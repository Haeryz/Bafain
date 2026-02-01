import logging
import uuid
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.address import (
  AddressCreateRequest,
  AddressDefaultResponse,
  AddressDeleteResponse,
  AddressListResponse,
  AddressResponse,
  AddressUpdateRequest,
)

logger = logging.getLogger("bafain.addresses")


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


def _payload_to_dict(payload: Any) -> dict[str, Any]:
  if payload is None:
    return {}
  if isinstance(payload, dict):
    return payload
  if hasattr(payload, "model_dump"):
    return payload.model_dump(exclude_none=True)
  if hasattr(payload, "dict"):
    return payload.dict(exclude_none=True)
  return {}


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


def list_addresses(access_token: str, supabase: Client) -> AddressListResponse:
  _get_user(access_token, supabase)
  return {"addresses": []}


def _build_address(
  address_id: str, payload: Any, is_default: bool | None = None
) -> dict[str, Any]:
  data = _payload_to_dict(payload)
  data["id"] = address_id
  if is_default is not None:
    data["is_default"] = is_default
  elif "is_default" not in data:
    data["is_default"] = False
  return data


def create_address(
  access_token: str, payload: AddressCreateRequest, supabase: Client
) -> AddressResponse:
  _get_user(access_token, supabase)
  address_id = uuid.uuid4().hex
  return {"address": _build_address(address_id, payload)}


def update_address(
  access_token: str,
  address_id: str,
  payload: AddressUpdateRequest,
  supabase: Client,
) -> AddressResponse:
  _get_user(access_token, supabase)
  return {"address": _build_address(address_id, payload)}


def delete_address(
  access_token: str, address_id: str, supabase: Client
) -> AddressDeleteResponse:
  _get_user(access_token, supabase)
  return {"message": "Address deleted", "address_id": address_id, "deleted": True}


def set_default_address(
  access_token: str, address_id: str, supabase: Client
) -> AddressDefaultResponse:
  _get_user(access_token, supabase)
  address = _build_address(address_id, {}, is_default=True)
  return {"address": address, "message": "Default address updated"}
