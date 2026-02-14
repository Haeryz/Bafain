from fastapi import APIRouter, Depends, Query

from controllers.admin_orders_controller import (
  list_admin_orders,
  update_admin_order,
  update_admin_shipment,
)
from lib.auth_dependency import require_access_token
from lib.firestore_client import get_firestore_client
from models.admin import (
  AdminOrderListResponse,
  AdminOrderUpdateRequest,
  AdminOrderUpdateResponse,
  AdminShipmentUpdateRequest,
  AdminShipmentUpdateResponse,
)

router = APIRouter(prefix="/api/v1/admin/orders")


@router.get("", response_model=AdminOrderListResponse)
def list_orders_route(
  status: str | None = Query(default=None),
  q: str | None = Query(default=None),
  page: int = Query(default=1, ge=1),
  limit: int = Query(default=10, ge=1, le=100),
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return list_admin_orders(access_token, firestore, status, q, page, limit)


@router.patch("/{order_id}", response_model=AdminOrderUpdateResponse)
def update_order_route(
  order_id: str,
  payload: AdminOrderUpdateRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return update_admin_order(access_token, order_id, payload, firestore)


@router.patch("/{order_id}/shipment", response_model=AdminShipmentUpdateResponse)
def update_shipment_route(
  order_id: str,
  payload: AdminShipmentUpdateRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return update_admin_shipment(access_token, order_id, payload, firestore)
