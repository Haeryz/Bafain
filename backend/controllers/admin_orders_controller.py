import logging

from fastapi import HTTPException, status
from supabase import Client

from models.admin import (
  AdminOrderListResponse,
  AdminOrderUpdateRequest,
  AdminOrderUpdateResponse,
  AdminShipmentUpdateRequest,
  AdminShipmentUpdateResponse,
)

logger = logging.getLogger("bafain.admin.orders")


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


def list_admin_orders(
  access_token: str,
  supabase: Client,
  status_filter: str | None,
  query_text: str | None,
  page: int,
  limit: int,
) -> AdminOrderListResponse:
  _get_user(access_token, supabase)
  return {"orders": [], "page": page, "limit": limit, "total": 0}


def update_admin_order(
  access_token: str,
  order_id: str,
  payload: AdminOrderUpdateRequest,
  supabase: Client,
) -> AdminOrderUpdateResponse:
  _get_user(access_token, supabase)
  status_value = payload.status or "diproses"
  return {
    "order_id": order_id,
    "status": status_value,
    "message": "Order updated",
  }


def update_admin_shipment(
  access_token: str,
  order_id: str,
  payload: AdminShipmentUpdateRequest,
  supabase: Client,
) -> AdminShipmentUpdateResponse:
  _get_user(access_token, supabase)
  shipment = {
    "carrier": payload.carrier,
    "nomor_resi": payload.nomor_resi,
    "eta": payload.eta,
  }
  return {
    "order_id": order_id,
    "shipment": shipment,
    "message": "Shipment updated",
  }
