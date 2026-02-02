import logging
import os
import uuid
from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from firebase_admin import auth as firebase_auth
from firebase_admin import firestore
from google.cloud.firestore_v1 import Client as FirestoreClient
from google.cloud.firestore_v1.transforms import Sentinel

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


def _verify_id_token(access_token: str) -> dict[str, Any]:
  try:
    return firebase_auth.verify_id_token(access_token)
  except Exception as exc:
    logger.warning("Firebase token verification failed: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc


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


def _profile_collection() -> str:
  return (
    os.getenv("FIRESTORE_PROFILE_COLLECTION")
    or os.getenv("FIREBASE_PROFILE_COLLECTION")
    or "profiles"
  )


def _addresses_subcollection() -> str:
  return (
    os.getenv("FIRESTORE_ADDRESS_SUBCOLLECTION")
    or os.getenv("FIREBASE_ADDRESS_SUBCOLLECTION")
    or "addresses"
  )


def _addresses_collection(
  firestore_client: FirestoreClient, uid: str
):
  return (
    firestore_client.collection(_profile_collection())
    .document(uid)
    .collection(_addresses_subcollection())
  )


def _build_address(address_id: str, data: dict[str, Any]) -> dict[str, Any]:
  payload = _sanitize_payload(data)
  payload["id"] = address_id
  if "is_default" not in payload:
    payload["is_default"] = False
  return payload


def _sanitize_payload(value: Any) -> Any:
  if isinstance(value, Sentinel):
    return None
  if isinstance(value, datetime):
    return value.isoformat()
  if isinstance(value, list):
    return [_sanitize_payload(item) for item in value]
  if isinstance(value, dict):
    cleaned: dict[str, Any] = {}
    for key, item in value.items():
      sanitized = _sanitize_payload(item)
      if sanitized is not None:
        cleaned[key] = sanitized
    return cleaned
  return value


def _unset_default_addresses(
  firestore_client: FirestoreClient, uid: str, keep_id: str
) -> None:
  collection = _addresses_collection(firestore_client, uid)
  docs = collection.where(field_path="is_default", op_string="==", value=True).stream()
  batch = firestore_client.batch()
  changed = False
  for doc in docs:
    if doc.id == keep_id:
      continue
    batch.update(doc.reference, {"is_default": False})
    changed = True
  if changed:
    batch.commit()


def list_addresses(
  access_token: str, firestore_client: FirestoreClient
) -> AddressListResponse:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  addresses: list[dict[str, Any]] = []
  for doc in _addresses_collection(firestore_client, uid).stream():
    data = doc.to_dict() or {}
    addresses.append(_build_address(doc.id, data))

  addresses.sort(key=lambda item: (not item.get("is_default", False)))
  return {"addresses": addresses}


def create_address(
  access_token: str,
  payload: AddressCreateRequest,
  firestore_client: FirestoreClient,
) -> AddressResponse:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  data = _payload_to_dict(payload)
  address_id = uuid.uuid4().hex
  data["created_at"] = firestore.SERVER_TIMESTAMP
  data["updated_at"] = firestore.SERVER_TIMESTAMP

  if data.get("is_default"):
    _unset_default_addresses(firestore_client, uid, address_id)

  _addresses_collection(firestore_client, uid).document(address_id).set(data)
  snapshot = _addresses_collection(firestore_client, uid).document(address_id).get()
  current = snapshot.to_dict() if snapshot and snapshot.exists else data
  return {"address": _build_address(address_id, current)}


def update_address(
  access_token: str,
  address_id: str,
  payload: AddressUpdateRequest,
  firestore_client: FirestoreClient,
) -> AddressResponse:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  doc_ref = _addresses_collection(firestore_client, uid).document(address_id)
  snapshot = doc_ref.get()
  if not snapshot.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Address not found",
    )

  data = _payload_to_dict(payload)
  if not data:
    current = snapshot.to_dict() or {}
    return {"address": _build_address(address_id, current)}

  data["updated_at"] = firestore.SERVER_TIMESTAMP
  if data.get("is_default"):
    _unset_default_addresses(firestore_client, uid, address_id)

  doc_ref.set(data, merge=True)
  refreshed = doc_ref.get()
  merged = refreshed.to_dict() if refreshed and refreshed.exists else (snapshot.to_dict() or {})
  return {"address": _build_address(address_id, merged)}


def delete_address(
  access_token: str, address_id: str, firestore_client: FirestoreClient
) -> AddressDeleteResponse:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  doc_ref = _addresses_collection(firestore_client, uid).document(address_id)
  snapshot = doc_ref.get()
  if not snapshot.exists:
    return {"message": "Address not found", "address_id": address_id, "deleted": False}

  doc_ref.delete()
  return {"message": "Address deleted", "address_id": address_id, "deleted": True}


def set_default_address(
  access_token: str, address_id: str, firestore_client: FirestoreClient
) -> AddressDefaultResponse:
  claims = _verify_id_token(access_token)
  uid = claims.get("uid") or claims.get("user_id")
  if not uid:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )

  doc_ref = _addresses_collection(firestore_client, uid).document(address_id)
  snapshot = doc_ref.get()
  if not snapshot.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Address not found",
    )

  _unset_default_addresses(firestore_client, uid, address_id)
  doc_ref.set(
    {"is_default": True, "updated_at": firestore.SERVER_TIMESTAMP},
    merge=True,
  )
  refreshed = doc_ref.get()
  data = refreshed.to_dict() if refreshed and refreshed.exists else (snapshot.to_dict() or {})
  data["is_default"] = True
  return {
    "address": _build_address(address_id, data),
    "message": "Default address updated",
  }
