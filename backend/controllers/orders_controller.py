import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from google.cloud.firestore_v1 import Client

from models.orders import (
  OrderActionResponse,
  OrderCreateRequest,
  OrderListResponse,
  OrderNoteRequest,
  OrderNotesResponse,
  OrderResponse,
)
from lib.firebase_auth import get_user_id

TAX_RATE = 0.11


def _orders_collection() -> str:
  return os.getenv("FIRESTORE_ORDERS_COLLECTION") or "orders"


def _doc_to_dict(doc) -> dict[str, Any]:
  data = doc.to_dict() or {}
  data["id"] = doc.id
  return data


def _parse_datetime(value: Any) -> datetime | None:
  if isinstance(value, datetime):
    return value
  if isinstance(value, str):
    try:
      return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
      return None
  return None


def _ensure_utc(value: datetime | None) -> datetime | None:
  if value is None:
    return None
  if value.tzinfo is None:
    return value.replace(tzinfo=timezone.utc)
  return value.astimezone(timezone.utc)


def _sort_key(value: Any) -> float:
  if value is None:
    return 0.0
  if hasattr(value, "timestamp"):
    try:
      return float(value.timestamp())
    except Exception:
      return 0.0
  if isinstance(value, datetime):
    return value.timestamp()
  return 0.0


def create_order(
  access_token: str, payload: OrderCreateRequest, firestore: Client
) -> OrderResponse:
  user_id = get_user_id(access_token)
  order_id = uuid.uuid4().hex
  created_at = datetime.now(timezone.utc)
  expires_at = created_at + timedelta(hours=24)
  subtotal = payload.subtotal or 0
  shipping_fee = payload.shipping_fee or 0
  pre_tax_total = subtotal + shipping_fee
  tax_amount = (
    payload.tax_amount
    if payload.tax_amount is not None
    else int(round(pre_tax_total * TAX_RATE))
  )
  total = pre_tax_total + tax_amount
  order = {
    "id": order_id,
    "user_id": user_id,
    "status": "awaiting-payment",
    "payment_status": "pending",
    "address": payload.address,
    "shipping_option": payload.shipping_option,
    "customer_note": payload.customer_note,
    "items": payload.items or [],
    "subtotal": subtotal,
    "shipping_fee": shipping_fee,
    "tax_amount": tax_amount,
    "total": total,
    "currency": "IDR",
    "payment_method": payload.payment_method,
    "created_at": created_at,
    "expires_at": expires_at,
  }
  firestore.collection(_orders_collection()).document(order_id).set(
    {k: v for k, v in order.items() if k != "id"}
  )
  return {"order": order}


def list_orders(
  access_token: str,
  firestore: Client,
  status_filter: str | None,
  query_text: str | None,
  page: int,
  limit: int,
) -> OrderListResponse:
  user_id = get_user_id(access_token)
  docs = (
    firestore.collection(_orders_collection())
    .where("user_id", "==", user_id)
    .stream()
  )
  orders = [_doc_to_dict(doc) for doc in docs]
  if status_filter:
    orders = [order for order in orders if order.get("status") == status_filter]
  if query_text:
    query = query_text.lower()
    orders = [
      order
      for order in orders
      if query in str(order.get("id", "")).lower()
      or query in str(order.get("customer_note", "")).lower()
    ]
  orders.sort(key=lambda order: _sort_key(order.get("created_at")), reverse=True)
  total = len(orders)
  start = (page - 1) * limit
  end = start + limit
  return {"orders": orders[start:end], "page": page, "limit": limit, "total": total}


def get_order_detail(
  access_token: str, order_id: str, firestore: Client
) -> OrderResponse:
  user_id = get_user_id(access_token)
  doc = firestore.collection(_orders_collection()).document(order_id).get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  order = _doc_to_dict(doc)
  if order.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  return {"order": order}


def cancel_order(
  access_token: str, order_id: str, firestore: Client
) -> OrderActionResponse:
  user_id = get_user_id(access_token)
  doc_ref = firestore.collection(_orders_collection()).document(order_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  doc_ref.update({"status": "cancelled", "updated_at": datetime.utcnow()})
  return {
    "order_id": order_id,
    "status": "cancelled",
    "message": "Order cancelled",
  }


def confirm_received(
  access_token: str, order_id: str, firestore: Client
) -> OrderActionResponse:
  user_id = get_user_id(access_token)
  doc_ref = firestore.collection(_orders_collection()).document(order_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  doc_ref.update({"status": "selesai", "updated_at": datetime.utcnow()})
  return {
    "order_id": order_id,
    "status": "selesai",
    "message": "Order marked as received",
  }


def check_payment(
  access_token: str, order_id: str, firestore: Client
) -> OrderActionResponse:
  user_id = get_user_id(access_token)
  doc_ref = firestore.collection(_orders_collection()).document(order_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  now = datetime.now(timezone.utc)
  expires_at = _ensure_utc(_parse_datetime(data.get("expires_at")))
  if expires_at and now > expires_at and data.get("payment_status") != "paid":
    doc_ref.update(
      {
        "status": "expired",
        "payment_status": "expired",
        "updated_at": now,
      }
    )
    return {
      "order_id": order_id,
      "status": "expired",
      "message": "Payment expired",
    }
  status_value = data.get("status", "in-queue")
  if data.get("payment_status") != "paid":
    status_value = "in-queue"
    doc_ref.update(
      {
        "payment_status": "paid",
        "status": status_value,
        "updated_at": now,
      }
    )
  return {
    "order_id": order_id,
    "status": status_value,
    "message": "Payment verified",
  }


def add_order_note(
  access_token: str,
  order_id: str,
  payload: OrderNoteRequest,
  firestore: Client,
) -> OrderNotesResponse:
  user_id = get_user_id(access_token)
  doc_ref = firestore.collection(_orders_collection()).document(order_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  note = {
    "id": uuid.uuid4().hex,
    "note": payload.note,
    "created_at": datetime.utcnow().isoformat(),
  }
  notes = list(data.get("notes") or [])
  notes.append(note)
  doc_ref.update({"notes": notes, "updated_at": datetime.utcnow()})
  return {"order_id": order_id, "notes": notes}


def list_order_notes(
  access_token: str, order_id: str, firestore: Client
) -> OrderNotesResponse:
  user_id = get_user_id(access_token)
  doc = firestore.collection(_orders_collection()).document(order_id).get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  data = doc.to_dict() or {}
  if data.get("user_id") != user_id:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  return {"order_id": order_id, "notes": list(data.get("notes") or [])}
