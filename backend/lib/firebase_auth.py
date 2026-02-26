import logging
import os
from typing import Any

from fastapi import HTTPException, status
from firebase_admin import auth as firebase_auth

from lib.firebase_admin import init_firebase

logger = logging.getLogger("bafain.firebase_auth")


def _token_clock_skew_seconds() -> int:
  raw = (os.getenv("FIREBASE_TOKEN_CLOCK_SKEW_SECONDS") or "").strip()
  if not raw:
    return 60
  try:
    value = int(raw)
  except ValueError:
    logger.warning(
      "Invalid FIREBASE_TOKEN_CLOCK_SKEW_SECONDS value: %s. Using default 60.",
      raw,
    )
    return 60
  if value < 0:
    return 0
  if value > 60:
    return 60
  return value


def extract_access_token(authorization: str | None) -> str:
  if not authorization:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Missing Authorization header",
    )
  scheme, _, token = authorization.partition(" ")
  if scheme.lower() != "bearer" or not token.strip():
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid Authorization header",
    )
  return token.strip()


def verify_access_token(access_token: str) -> dict[str, Any]:
  init_firebase()
  try:
    return firebase_auth.verify_id_token(
      access_token,
      clock_skew_seconds=_token_clock_skew_seconds(),
    )
  except Exception as exc:
    logger.warning("Firebase token verification failed: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc


def get_user_id(access_token: str) -> str:
  claims = verify_access_token(access_token)
  uid = claims.get("uid") or claims.get("user_id") or claims.get("sub")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  return uid


def get_user_record(access_token: str):
  uid = get_user_id(access_token)
  try:
    return firebase_auth.get_user(uid)
  except Exception as exc:
    logger.warning("Firebase get_user error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc
