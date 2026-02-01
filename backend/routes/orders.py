from fastapi import APIRouter, Depends, Header, Query

from controllers.orders_controller import (
  add_order_note,
  cancel_order,
  confirm_received,
  create_order,
  extract_access_token,
  get_order_detail,
  list_order_notes,
  list_orders,
)
from lib.supabase_client import get_supabase_client
from models.orders import (
  OrderActionResponse,
  OrderCreateRequest,
  OrderListResponse,
  OrderNoteRequest,
  OrderNotesResponse,
  OrderResponse,
)

router = APIRouter(prefix="/api/v1/orders")


@router.post("", response_model=OrderResponse, status_code=201)
def create_order_route(
  payload: OrderCreateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return create_order(access_token, payload, supabase)


@router.get("", response_model=OrderListResponse)
def list_orders_route(
  status: str | None = Query(default=None),
  q: str | None = Query(default=None),
  page: int = Query(default=1, ge=1),
  limit: int = Query(default=10, ge=1, le=100),
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return list_orders(access_token, supabase, status, q, page, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail_route(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_order_detail(access_token, order_id, supabase)


@router.post("/{order_id}/cancel", response_model=OrderActionResponse)
def cancel_order_route(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return cancel_order(access_token, order_id, supabase)


@router.post("/{order_id}/confirm-received", response_model=OrderActionResponse)
def confirm_received_route(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return confirm_received(access_token, order_id, supabase)


@router.post("/{order_id}/notes", response_model=OrderNotesResponse)
def add_order_note_route(
  order_id: str,
  payload: OrderNoteRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return add_order_note(access_token, order_id, payload, supabase)


@router.get("/{order_id}/notes", response_model=OrderNotesResponse)
def list_order_notes_route(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return list_order_notes(access_token, order_id, supabase)
