import logging
import os
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.auth import (
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest,
)

logger = logging.getLogger("bafain.auth")


def _is_rate_limited(error: Any) -> bool:
  if error is None:
    return False
  return "rate limit" in str(error).lower()


def _to_dict(value: Any) -> dict[str, Any] | None:
  if value is None:
    return None
  if isinstance(value, dict):
    return value
  if hasattr(value, "model_dump"):
    return value.model_dump()
  if hasattr(value, "dict"):
    return value.dict()
  return None


def _auth_error_detail(error: Any, fallback: str) -> str:
  debug = os.getenv("AUTH_DEBUG") == "true"
  if debug and error is not None:
    return str(error)
  return fallback


def _raise_if_response_error(response: Any, fallback: str, status_code: int):
  error = getattr(response, "error", None)
  if error:
    if _is_rate_limited(error):
      status_code = status.HTTP_429_TOO_MANY_REQUESTS
      fallback = "Rate limit exceeded"
    logger.warning("Supabase auth error: %s", str(error))
    raise HTTPException(
      status_code=status_code,
      detail=_auth_error_detail(error, fallback),
    )


def register_user(payload: AuthRegisterRequest, supabase: Client) -> dict[str, Any]:
  try:
    response = supabase.auth.sign_up(
      {"email": payload.email, "password": payload.password}
    )
    _raise_if_response_error(
      response, "Unable to register with provided credentials", 400
    )
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 422):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=_auth_error_detail(
          exc, "Unable to register with provided credentials"
        ),
      )
    if _is_rate_limited(exc):
      logger.warning("Supabase auth rate limit: %s", str(exc))
      raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=_auth_error_detail(exc, "Rate limit exceeded"),
      )
    logger.warning("Supabase auth error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  return {
    "user": _to_dict(getattr(response, "user", None)),
    "session": _to_dict(getattr(response, "session", None)),
    "message": "If the email is valid, a confirmation message has been sent.",
  }


def login_user(payload: AuthLoginRequest, supabase: Client) -> dict[str, Any]:
  try:
    response = supabase.auth.sign_in_with_password(
      {"email": payload.email, "password": payload.password}
    )
    _raise_if_response_error(response, "Invalid email or password", 401)
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 401):
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=_auth_error_detail(exc, "Invalid email or password"),
      )
    if _is_rate_limited(exc):
      logger.warning("Supabase auth rate limit: %s", str(exc))
      raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=_auth_error_detail(exc, "Rate limit exceeded"),
      )
    logger.warning("Supabase auth error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  return {
    "user": _to_dict(getattr(response, "user", None)),
    "session": _to_dict(getattr(response, "session", None)),
  }


def forgot_password(
  payload: AuthForgotPasswordRequest, supabase: Client
) -> dict[str, Any]:
  redirect_to = (
    os.getenv("SUPABASE_RESET_REDIRECT_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_RESET_REDIRECT_URL")
  )
  options = {"redirect_to": redirect_to} if redirect_to else None

  try:
    if options:
      response = supabase.auth.reset_password_for_email(payload.email, options)
    else:
      response = supabase.auth.reset_password_for_email(payload.email)
    _raise_if_response_error(
      response, "If the email exists, a reset link has been sent.", 200
    )
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 422):
      return {"message": "If the email exists, a reset link has been sent."}
    if _is_rate_limited(exc):
      logger.warning("Supabase auth rate limit: %s", str(exc))
      return {"message": "If the email exists, a reset link has been sent."}
    logger.warning("Supabase auth error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  return {"message": "If the email exists, a reset link has been sent."}


def reset_password(
  payload: AuthResetPasswordRequest, supabase: Client
) -> dict[str, Any]:
  try:
    supabase.auth.set_session(payload.access_token, payload.refresh_token)
    supabase.auth.update_user({"password": payload.new_password})
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 401, 403):
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=_auth_error_detail(exc, "Invalid or expired reset session"),
      )
    if _is_rate_limited(exc):
      logger.warning("Supabase auth rate limit: %s", str(exc))
      raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=_auth_error_detail(exc, "Rate limit exceeded"),
      )
    logger.warning("Supabase auth error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  return {"message": "Password updated successfully"}
