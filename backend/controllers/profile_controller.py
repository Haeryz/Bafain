import logging
import os
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from firebase_admin import auth as firebase_auth
from firebase_admin import firestore
from google.cloud.firestore_v1 import Client as FirestoreClient
from supabase import Client as SupabaseClient

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


def _verify_id_token(access_token: str) -> dict[str, Any]:
  try:
    return firebase_auth.verify_id_token(access_token)
  except Exception as exc:
    logger.warning("Firebase token verification failed: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc


def _get_firebase_user(uid: str):
  try:
    return firebase_auth.get_user(uid)
  except Exception as exc:
    logger.warning("Firebase get_user error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc


def _get_supabase_user(access_token: str, supabase: SupabaseClient):
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


def _profile_collection() -> str:
  return (
    os.getenv("FIRESTORE_PROFILE_COLLECTION")
    or os.getenv("FIREBASE_PROFILE_COLLECTION")
    or "profiles"
  )


def _ms_to_iso_date(timestamp_ms: int | None) -> str | None:
  if not timestamp_ms:
    return None
  try:
    dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
  except Exception:
    return None
  return dt.date().isoformat()


def _build_user_payload(record) -> dict[str, Any]:
  user: dict[str, Any] = {
    "id": record.uid,
    "uid": record.uid,
    "email_verified": record.email_verified,
  }
  if record.email:
    user["email"] = record.email
  if record.display_name:
    user["display_name"] = record.display_name
  if record.phone_number:
    user["phone_number"] = record.phone_number
  if record.photo_url:
    user["photo_url"] = record.photo_url
  metadata = getattr(record, "user_metadata", None)
  created_at = getattr(metadata, "creation_timestamp", None) if metadata else None
  created_at_iso = _ms_to_iso_date(created_at)
  if created_at_iso:
    user["created_at"] = created_at_iso
  return user


def _build_profile_payload(record, profile_data: dict[str, Any]) -> dict[str, Any]:
  metadata = getattr(record, "user_metadata", None)
  created_at = getattr(metadata, "creation_timestamp", None) if metadata else None
  joined_date = profile_data.get("joined_date") or _ms_to_iso_date(created_at)
  return {
    "full_name": profile_data.get("full_name") or record.display_name or None,
    "email": profile_data.get("email") or record.email or None,
    "phone": profile_data.get("phone") or record.phone_number or None,
    "company": profile_data.get("company") or None,
    "address": profile_data.get("address") or None,
    "joined_date": joined_date,
    "avatar_url": profile_data.get("avatar_url") or record.photo_url or None,
  }


def _profile_response(record, profile_data: dict[str, Any]) -> dict[str, Any]:
  return {
    "user": _build_user_payload(record),
    "profile": _build_profile_payload(record, profile_data),
  }


def get_profile(access_token: str, firestore_client: FirestoreClient) -> dict[str, Any]:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  user_record = _get_firebase_user(uid)
  doc = (
    firestore_client.collection(_profile_collection())
    .document(uid)
    .get()
  )
  profile_data = doc.to_dict() if doc and doc.exists else {}
  return _profile_response(user_record, profile_data or {})


def _looks_like_e164(value: str) -> bool:
  if not value or not value.startswith("+"):
    return False
  digits = value[1:]
  return digits.isdigit() and 8 <= len(digits) <= 15


def update_profile(
  access_token: str,
  payload: ProfileUpdateRequest,
  firestore_client: FirestoreClient,
) -> dict[str, Any]:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  auth_updates: dict[str, Any] = {}
  if payload.full_name is not None:
    auth_updates["display_name"] = payload.full_name
  if payload.email is not None:
    auth_updates["email"] = payload.email
  if payload.avatar_url is not None:
    auth_updates["photo_url"] = payload.avatar_url
  if payload.phone is not None and _looks_like_e164(payload.phone):
    auth_updates["phone_number"] = payload.phone

  if auth_updates:
    try:
      firebase_auth.update_user(uid, **auth_updates)
    except firebase_auth.EmailAlreadyExistsError as exc:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email already in use.",
      ) from exc
    except firebase_auth.InvalidArgumentError as exc:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid profile data.",
      ) from exc
    except firebase_auth.UserNotFoundError as exc:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
      ) from exc
    except Exception as exc:
      logger.warning("Firebase update_user error: %s", str(exc))
      raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Unable to update profile right now",
      ) from exc

  profile_updates: dict[str, Any] = {}
  if payload.full_name is not None:
    profile_updates["full_name"] = payload.full_name
  if payload.email is not None:
    profile_updates["email"] = payload.email
  if payload.phone is not None:
    profile_updates["phone"] = payload.phone
  if payload.company is not None:
    profile_updates["company"] = payload.company
  if payload.address is not None:
    profile_updates["address"] = payload.address
  if payload.joined_date is not None:
    profile_updates["joined_date"] = payload.joined_date
  if payload.avatar_url is not None:
    profile_updates["avatar_url"] = payload.avatar_url
  if payload.metadata is not None:
    profile_updates["metadata"] = payload.metadata

  if profile_updates:
    profile_updates["updated_at"] = firestore.SERVER_TIMESTAMP
    (
      firestore_client.collection(_profile_collection())
      .document(uid)
      .set(profile_updates, merge=True)
    )

  return get_profile(access_token, firestore_client)


def update_avatar(
  access_token: str,
  avatar_url: str,
  firestore_client: FirestoreClient,
) -> dict[str, Any]:
  payload = ProfileUpdateRequest(avatar_url=avatar_url)
  return update_profile(access_token, payload, firestore_client)


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


def get_order_stats(access_token: str, supabase: SupabaseClient) -> dict[str, Any]:
  user = _get_supabase_user(access_token, supabase)
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
  access_token: str, supabase: SupabaseClient, limit: int
) -> dict[str, Any]:
  user = _get_supabase_user(access_token, supabase)
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
