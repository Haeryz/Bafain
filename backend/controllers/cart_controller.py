import os
import uuid
from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from google.cloud.firestore_v1 import Client

from models.cart import (
  CartItemCreateRequest,
  CartItemDeleteResponse,
  CartItemResponse,
  CartItemUpdateRequest,
  CartResponse,
)
from lib.firebase_auth import get_user_id


def _cart_collection() -> str:
  return os.getenv("FIRESTORE_CART_COLLECTION") or "cart_items"


def _doc_to_dict(doc) -> dict[str, Any]:
  data = doc.to_dict() or {}
  data["id"] = doc.id
  return data


def get_cart(access_token: str, firestore: Client) -> CartResponse:
  user_id = get_user_id(access_token)
  docs = (
    firestore.collection(_cart_collection())
    .where("user_id", "==", user_id)
    .stream()
  )
  items = [_doc_to_dict(doc) for doc in docs]
  return {"items": items, "subtotal": 0, "currency": "IDR"}


def add_cart_item(
  access_token: str, payload: CartItemCreateRequest, firestore: Client
) -> CartItemResponse:
  user_id = get_user_id(access_token)
  item_id = uuid.uuid4().hex
  item = {
    "user_id": user_id,
    "product_id": payload.product_id,
    "qty": payload.qty,
    "created_at": datetime.utcnow(),
  }
  firestore.collection(_cart_collection()).document(item_id).set(item)
  item["id"] = item_id
  return {"item": item}


def update_cart_item(
  access_token: str,
  item_id: str,
  payload: CartItemUpdateRequest,
  firestore: Client,
) -> CartItemResponse:
  user_id = get_user_id(access_token)
  doc_ref = firestore.collection(_cart_collection()).document(item_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Cart item not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Cart item not found",
    )
  doc_ref.update({"qty": payload.qty})
  data["qty"] = payload.qty
  data["id"] = item_id
  return {"item": data}


def delete_cart_item(
  access_token: str, item_id: str, firestore: Client
) -> CartItemDeleteResponse:
  user_id = get_user_id(access_token)
  doc_ref = firestore.collection(_cart_collection()).document(item_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Cart item not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Cart item not found",
    )
  doc_ref.delete()
  return {"message": "Cart item deleted", "item_id": item_id, "deleted": True}

