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
)

logger = logging.getLogger("bafain.cart")
_CART_ITEMS_BY_USER: dict[str, dict[str, dict[str, Any]]] = {}


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


def _get_cart_items(user_id: str) -> dict[str, dict[str, Any]]:
  return _CART_ITEMS_BY_USER.setdefault(user_id, {})


def get_cart(access_token: str, supabase: Client) -> CartResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  items = list(_get_cart_items(user_id).values())
  return {"items": items, "subtotal": 0, "currency": "IDR"}


def add_cart_item(
  access_token: str, payload: CartItemCreateRequest, supabase: Client
) -> CartItemResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  item_id = uuid.uuid4().hex
  item = {"id": item_id, "product_id": payload.product_id, "qty": payload.qty}
  _get_cart_items(user_id)[item_id] = item
  return {"item": item}


def update_cart_item(
  access_token: str,
  item_id: str,
  payload: CartItemUpdateRequest,
  supabase: Client,
) -> CartItemResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  items = _get_cart_items(user_id)
  if item_id not in items:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Cart item not found",
    )
  items[item_id]["qty"] = payload.qty
  return {"item": items[item_id]}


def delete_cart_item(
  access_token: str, item_id: str, supabase: Client
) -> CartItemDeleteResponse:
  user = _get_user(access_token, supabase)
  user_id = getattr(user, "id", None)
  if not user_id:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  items = _get_cart_items(user_id)
  if item_id not in items:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Cart item not found",
    )
  items.pop(item_id, None)
  return {"message": "Cart item deleted", "item_id": item_id, "deleted": True}

