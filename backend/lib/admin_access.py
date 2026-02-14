from typing import Any

from fastapi import HTTPException, status
from google.cloud.firestore_v1 import Client

from lib.firebase_auth import verify_access_token

ADMIN_ROLE_VIEWER = "viewer"
ADMIN_ROLE_OPERATOR = "operator"
ADMIN_ROLE_ADMIN = "admin"
ADMIN_ROLE_SUPER_ADMIN = "super_admin"

ADMIN_ROLES = {
  ADMIN_ROLE_VIEWER,
  ADMIN_ROLE_OPERATOR,
  ADMIN_ROLE_ADMIN,
  ADMIN_ROLE_SUPER_ADMIN,
}

ADMIN_READ_ROLES = {
  ADMIN_ROLE_VIEWER,
  ADMIN_ROLE_OPERATOR,
  ADMIN_ROLE_ADMIN,
  ADMIN_ROLE_SUPER_ADMIN,
}

ADMIN_ORDER_WRITE_ROLES = {
  ADMIN_ROLE_OPERATOR,
  ADMIN_ROLE_ADMIN,
  ADMIN_ROLE_SUPER_ADMIN,
}

ADMIN_PRODUCT_WRITE_ROLES = {
  ADMIN_ROLE_ADMIN,
  ADMIN_ROLE_SUPER_ADMIN,
}


def _normalize_role(value: Any) -> str | None:
  if not isinstance(value, str):
    return None
  lowered = value.strip().lower()
  if lowered in ADMIN_ROLES:
    return lowered
  return None


def _extract_claims_role(claims: dict[str, Any]) -> str | None:
  role = _normalize_role(claims.get("role"))
  if role:
    return role

  roles = claims.get("roles")
  if isinstance(roles, list):
    for raw_role in roles:
      parsed_role = _normalize_role(raw_role)
      if parsed_role:
        return parsed_role

  if claims.get("is_admin") is True or claims.get("admin") is True:
    return ADMIN_ROLE_ADMIN
  return None


def _get_admin_users_collection() -> str:
  from os import getenv

  return getenv("FIRESTORE_ADMIN_USERS_COLLECTION") or "admin_users"


def _extract_uid(claims: dict[str, Any]) -> str | None:
  uid = claims.get("uid") or claims.get("user_id") or claims.get("sub")
  if isinstance(uid, str) and uid.strip():
    return uid.strip()
  return None


def require_admin_access(
  access_token: str,
  firestore: Client,
  allowed_roles: set[str] | None = None,
) -> dict[str, str]:
  claims = verify_access_token(access_token)
  uid = _extract_uid(claims)
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  email = claims.get("email")
  display_name = claims.get("name")
  role = _extract_claims_role(claims)

  admin_doc = (
    firestore.collection(_get_admin_users_collection())
    .document(uid)
    .get()
  )
  if admin_doc.exists:
    admin_data = admin_doc.to_dict() or {}
  else:
    admin_data = {}

  if admin_doc.exists and admin_data.get("active") is False:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Admin account is disabled",
    )

  if not role:
    role = _normalize_role(admin_data.get("role"))

  if not role:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Admin access required",
    )

  if allowed_roles is not None and role not in allowed_roles:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Insufficient admin role",
    )

  resolved_email = email if isinstance(email, str) else admin_data.get("email")
  resolved_display_name = (
    display_name
    if isinstance(display_name, str)
    else admin_data.get("display_name")
  )

  return {
    "uid": uid,
    "role": role,
    "email": resolved_email or "",
    "display_name": resolved_display_name or "",
  }
