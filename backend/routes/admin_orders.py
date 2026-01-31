from fastapi import APIRouter, Depends, Header, Query

from controllers.admin_orders_controller import (
  extract_access_token,
  list_admin_orders,
  update_admin_order,
  update_admin_shipment,
)
from lib.supabase_client import get_supabase_client
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
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return list_admin_orders(access_token, supabase, status, q, page, limit)


@router.patch("/{order_id}", response_model=AdminOrderUpdateResponse)
def update_order_route(
  order_id: str,
  payload: AdminOrderUpdateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return update_admin_order(access_token, order_id, payload, supabase)


@router.patch("/{order_id}/shipment", response_model=AdminShipmentUpdateResponse)
def update_shipment_route(
  order_id: str,
  payload: AdminShipmentUpdateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return update_admin_shipment(access_token, order_id, payload, supabase)
