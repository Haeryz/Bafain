import logging
import uuid
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.orders import (
  OrderActionResponse,
  OrderCreateRequest,
  OrderListResponse,
  OrderNoteRequest,
  OrderNotesResponse,
  OrderResponse,
)

logger = logging.getLogger("bafain.orders")
_ORDERS_BY_USER: dict[str, dict[str, dict[str, Any]]] = {}


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


def _get_orders(user_id: str) -> dict[str, dict[str, Any]]:
  return _ORDERS_BY_USER.setdefault(user_id, {})


def create_order(
  access_token: str, payload: OrderCreateRequest, supabase: Client
) -> OrderResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  order_id = uuid.uuid4().hex
  subtotal = payload.subtotal or 0
  shipping_fee = payload.shipping_fee or 0
  total = payload.total or (subtotal + shipping_fee)
  order = {
    "id": order_id,
    "status": "awaiting-payment",
    "payment_status": "pending",
    "address": payload.address,
    "shipping_option": payload.shipping_option,
    "customer_note": payload.customer_note,
    "items": payload.items or [],
    "subtotal": subtotal,
    "shipping_fee": shipping_fee,
    "total": total,
    "currency": "IDR",
    "payment_method": payload.payment_method,
  }
  _get_orders(user_id)[order_id] = order
  return {"order": order}


def list_orders(
  access_token: str,
  supabase: Client,
  status_filter: str | None,
  query_text: str | None,
  page: int,
  limit: int,
) -> OrderListResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  orders = list(_get_orders(user_id).values())
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
  total = len(orders)
  start = (page - 1) * limit
  end = start + limit
  return {"orders": orders[start:end], "page": page, "limit": limit, "total": total}


def get_order_detail(
  access_token: str, order_id: str, supabase: Client
) -> OrderResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  order = _get_orders(user_id).get(order_id)
  if not order:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  return {"order": order}


def cancel_order(
  access_token: str, order_id: str, supabase: Client
) -> OrderActionResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  order = _get_orders(user_id).get(order_id)
  if not order:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  order["status"] = "cancelled"
  return {
    "order_id": order_id,
    "status": "cancelled",
    "message": "Order cancelled",
  }


def confirm_received(
  access_token: str, order_id: str, supabase: Client
) -> OrderActionResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  order = _get_orders(user_id).get(order_id)
  if not order:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  order["status"] = "selesai"
  return {
    "order_id": order_id,
    "status": "selesai",
    "message": "Order marked as received",
  }


def check_payment(
  access_token: str, order_id: str, supabase: Client
) -> OrderActionResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  order = _get_orders(user_id).get(order_id)
  if not order:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  if order.get("payment_status") != "paid":
    order["payment_status"] = "paid"
    order["status"] = "in-queue"
  return {
    "order_id": order_id,
    "status": order.get("status", "in-queue"),
    "message": "Payment verified",
  }


def add_order_note(
  access_token: str,
  order_id: str,
  payload: OrderNoteRequest,
  supabase: Client,
) -> OrderNotesResponse:
  _get_user(access_token, supabase)
  note = {
    "id": uuid.uuid4().hex,
    "note": payload.note,
  }
  return {"order_id": order_id, "notes": [note]}


def list_order_notes(
  access_token: str, order_id: str, supabase: Client
) -> OrderNotesResponse:
  _get_user(access_token, supabase)
  return {"order_id": order_id, "notes": []}
