import logging
import uuid
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.cart import (
  CartItemCreateRequest,
  CartItemDeleteResponse,
  CartItemResponse,
  CartItemUpdateRequest,
  CartResponse,
  CheckoutSummaryRequest,
  CheckoutSummaryResponse,
)

logger = logging.getLogger("bafain.cart")


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


def get_cart(access_token: str, supabase: Client) -> CartResponse:
  _get_user(access_token, supabase)
  return {"items": [], "subtotal": 0, "currency": "IDR"}


def add_cart_item(
  access_token: str, payload: CartItemCreateRequest, supabase: Client
) -> CartItemResponse:
  _get_user(access_token, supabase)
  item_id = uuid.uuid4().hex
  return {
    "item": {
      "id": item_id,
      "product_id": payload.product_id,
      "qty": payload.qty,
    }
  }


def update_cart_item(
  access_token: str,
  item_id: str,
  payload: CartItemUpdateRequest,
  supabase: Client,
) -> CartItemResponse:
  _get_user(access_token, supabase)
  return {"item": {"id": item_id, "qty": payload.qty}}


def delete_cart_item(
  access_token: str, item_id: str, supabase: Client
) -> CartItemDeleteResponse:
  _get_user(access_token, supabase)
  return {"message": "Cart item deleted", "item_id": item_id, "deleted": True}


def checkout_summary(
  access_token: str, payload: CheckoutSummaryRequest, supabase: Client
) -> CheckoutSummaryResponse:
  _get_user(access_token, supabase)
  return {
    "subtotal": 0,
    "shipping_fee": 0,
    "total": 0,
    "currency": "IDR",
  }
