import logging
import os
from typing import Any

from fastapi import HTTPException, status
from supabase import AuthSessionMissingError, Client

from models.profile import ProfileUpdateRequest

logger = logging.getLogger("bafain.profile")

ORDER_STATUSES = ("in-queue", "aktif", "selesai")


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


def _get_user(access_token: str, supabase: Client):
  try:
    response = supabase.auth.get_user(access_token)
  except Exception as exc:
    logger.warning("Supabase auth get_user error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc

  user = getattr(response, "user", None)
  if user is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  return user


def _profile_response(user: Any) -> dict[str, Any]:
  return {"user": _to_dict(user) or {}}


def get_profile(access_token: str, supabase: Client) -> dict[str, Any]:
  user = _get_user(access_token, supabase)
  return _profile_response(user)


def _merge_metadata(
  current: dict[str, Any], payload: ProfileUpdateRequest
) -> dict[str, Any]:
  metadata = {**current}
  if payload.metadata:
    metadata.update(payload.metadata)
  if payload.full_name is not None:
    metadata["full_name"] = payload.full_name
  if payload.avatar_url is not None:
    metadata["avatar_url"] = payload.avatar_url
  return metadata


def _set_session(
  access_token: str, refresh_token: str | None, supabase: Client
) -> None:
  token = refresh_token or access_token
  try:
    supabase.auth.set_session(access_token, token)
  except AuthSessionMissingError as exc:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Session expired. Please sign in again.",
    ) from exc
  except Exception as exc:
    logger.warning("Supabase auth set_session error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc


def update_profile(
  access_token: str,
  payload: ProfileUpdateRequest,
  supabase: Client,
  refresh_token: str | None = None,
) -> dict[str, Any]:
  user = _get_user(access_token, supabase)
  user_dict = _to_dict(user) or {}
  current_metadata = user_dict.get("user_metadata") or {}

  metadata = _merge_metadata(current_metadata, payload)

  attributes: dict[str, Any] = {}
  if payload.phone is not None:
    attributes["phone"] = payload.phone
  if metadata != current_metadata:
    attributes["data"] = metadata

  if not attributes:
    return _profile_response(user)

  _set_session(access_token, refresh_token, supabase)

  try:
    response = supabase.auth.update_user(attributes)
  except AuthSessionMissingError as exc:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Session expired. Please sign in again.",
    ) from exc
  except Exception as exc:
    logger.warning("Supabase auth update_user error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Unable to update profile right now",
    ) from exc

  updated_user = getattr(response, "user", None) or user
  return _profile_response(updated_user)


def update_avatar(
  access_token: str,
  avatar_url: str,
  supabase: Client,
  refresh_token: str | None = None,
) -> dict[str, Any]:
  payload = ProfileUpdateRequest(avatar_url=avatar_url)
  return update_profile(access_token, payload, supabase, refresh_token)


def _resolve_orders_table() -> str | None:
  table = (os.getenv("SUPABASE_ORDERS_TABLE") or os.getenv("ORDERS_TABLE") or "").strip()
  return table or None


def _resolve_orders_columns() -> dict[str, str]:
  return {
    "user_id": os.getenv("SUPABASE_ORDERS_USER_COLUMN", "user_id"),
    "status": os.getenv("SUPABASE_ORDERS_STATUS_COLUMN", "status"),
    "created_at": os.getenv("SUPABASE_ORDERS_CREATED_AT_COLUMN", "created_at"),
  }


def _empty_counts() -> dict[str, int]:
  return {status: 0 for status in ORDER_STATUSES}


def _is_missing_table(error: Any) -> bool:
  message = str(error).lower()
  return "does not exist" in message or "schema cache" in message


def get_order_stats(access_token: str, supabase: Client) -> dict[str, Any]:
  user = _get_user(access_token, supabase)
  user_dict = _to_dict(user) or {}
  user_id = user_dict.get("id")
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  orders_table = _resolve_orders_table()
  if not orders_table:
    logger.warning("Orders table not configured; returning empty stats.")
    return {"counts": _empty_counts()}

  columns = _resolve_orders_columns()
  supabase.postgrest.auth(access_token)
  response = (
    supabase.table(orders_table)
    .select(columns["status"])
    .eq(columns["user_id"], user_id)
    .execute()
  )
  error = getattr(response, "error", None)
  if error:
    if _is_missing_table(error):
      logger.warning("Orders table missing; returning empty stats.")
      return {"counts": _empty_counts()}
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=str(error),
    )

  data = getattr(response, "data", None) or []
  counts = _empty_counts()
  for row in data:
    raw_status = row.get(columns["status"])
    if raw_status is None:
      continue
    normalized = str(raw_status).strip().lower().replace("_", "-")
    if normalized in counts:
      counts[normalized] += 1

  return {"counts": counts}


def get_recent_orders(
  access_token: str, supabase: Client, limit: int
) -> dict[str, Any]:
  user = _get_user(access_token, supabase)
  user_dict = _to_dict(user) or {}
  user_id = user_dict.get("id")
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  orders_table = _resolve_orders_table()
  if not orders_table:
    logger.warning("Orders table not configured; returning empty recent orders.")
    return {"orders": []}

  columns = _resolve_orders_columns()
  supabase.postgrest.auth(access_token)
  response = (
    supabase.table(orders_table)
    .select("*")
    .eq(columns["user_id"], user_id)
    .order(columns["created_at"], desc=True)
    .range(0, limit - 1)
    .execute()
  )
  error = getattr(response, "error", None)
  if error:
    if _is_missing_table(error):
      logger.warning("Orders table missing; returning empty recent orders.")
      return {"orders": []}
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=str(error),
    )

  return {"orders": getattr(response, "data", None) or []}
