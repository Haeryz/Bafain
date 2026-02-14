from fastapi import APIRouter, Depends, Query

from controllers.orders_controller import (
  add_order_note,
  cancel_order,
  check_payment,
  confirm_received,
  create_order,
  get_order_detail,
  list_order_notes,
  list_orders,
)
from lib.auth_dependency import require_access_token
from lib.firestore_client import get_firestore_client
from models.orders import (
  OrderActionResponse,
  OrderCreateRequest,
  OrderListResponse,
  OrderNoteRequest,
  OrderNotesResponse,
  OrderResponse,
)

router = APIRouter(prefix="/orders")


@router.post("", response_model=OrderResponse, status_code=201)
def create_order_route(
  payload: OrderCreateRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return create_order(access_token, payload, firestore)


@router.get("", response_model=OrderListResponse)
def list_orders_route(
  status: str | None = Query(default=None),
  q: str | None = Query(default=None),
  page: int = Query(default=1, ge=1),
  limit: int = Query(default=10, ge=1, le=100),
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return list_orders(access_token, firestore, status, q, page, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail_route(
  order_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return get_order_detail(access_token, order_id, firestore)


@router.post("/{order_id}/cancel", response_model=OrderActionResponse)
def cancel_order_route(
  order_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return cancel_order(access_token, order_id, firestore)


@router.post("/{order_id}/confirm-received", response_model=OrderActionResponse)
def confirm_received_route(
  order_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return confirm_received(access_token, order_id, firestore)


@router.post("/{order_id}/check-payment", response_model=OrderActionResponse)
def check_payment_route(
  order_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return check_payment(access_token, order_id, firestore)


@router.post("/{order_id}/notes", response_model=OrderNotesResponse)
def add_order_note_route(
  order_id: str,
  payload: OrderNoteRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return add_order_note(access_token, order_id, payload, firestore)


@router.get("/{order_id}/notes", response_model=OrderNotesResponse)
def list_order_notes_route(
  order_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return list_order_notes(access_token, order_id, firestore)
