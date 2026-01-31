from fastapi import APIRouter, Depends, Header

from controllers.cart_controller import (
  add_cart_item,
  delete_cart_item,
  extract_access_token,
  get_cart,
  update_cart_item,
)
from lib.supabase_client import get_supabase_client
from models.cart import (
  CartItemCreateRequest,
  CartItemDeleteResponse,
  CartItemResponse,
  CartItemUpdateRequest,
  CartResponse,
)

router = APIRouter(prefix="/api/v1/cart")


@router.get("", response_model=CartResponse)
def get_cart_route(
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_cart(access_token, supabase)


@router.post("/items", response_model=CartItemResponse, status_code=201)
def add_cart_item_route(
  payload: CartItemCreateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return add_cart_item(access_token, payload, supabase)


@router.patch("/items/{item_id}", response_model=CartItemResponse)
def update_cart_item_route(
  item_id: str,
  payload: CartItemUpdateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return update_cart_item(access_token, item_id, payload, supabase)


@router.delete("/items/{item_id}", response_model=CartItemDeleteResponse)
def delete_cart_item_route(
  item_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return delete_cart_item(access_token, item_id, supabase)
