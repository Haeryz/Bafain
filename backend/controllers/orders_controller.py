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


def create_order(
  access_token: str, payload: OrderCreateRequest, supabase: Client
) -> OrderResponse:
  _get_user(access_token, supabase)
  order_id = uuid.uuid4().hex
  return {
    "order": {
      "id": order_id,
      "status": "in-queue",
      "address": payload.address,
      "shipping_option": payload.shipping_option,
      "customer_note": payload.customer_note,
    }
  }


def list_orders(
  access_token: str,
  supabase: Client,
  status_filter: str | None,
  query_text: str | None,
  page: int,
  limit: int,
) -> OrderListResponse:
  _get_user(access_token, supabase)
  return {"orders": [], "page": page, "limit": limit, "total": 0}


def get_order_detail(
  access_token: str, order_id: str, supabase: Client
) -> OrderResponse:
  _get_user(access_token, supabase)
  return {"order": {"id": order_id, "status": "in-queue"}}


def cancel_order(
  access_token: str, order_id: str, supabase: Client
) -> OrderActionResponse:
  _get_user(access_token, supabase)
  return {
    "order_id": order_id,
    "status": "cancelled",
    "message": "Order cancelled",
  }


def confirm_received(
  access_token: str, order_id: str, supabase: Client
) -> OrderActionResponse:
  _get_user(access_token, supabase)
  return {
    "order_id": order_id,
    "status": "selesai",
    "message": "Order marked as received",
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
