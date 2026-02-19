import os
from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from google.cloud.firestore_v1 import Client

from models.admin import (
  AdminOrderListResponse,
  AdminOrderUpdateRequest,
  AdminOrderUpdateResponse,
  AdminShipmentUpdateRequest,
  AdminShipmentUpdateResponse,
)
from lib.admin_access import (
  ADMIN_ORDER_WRITE_ROLES,
  ADMIN_READ_ROLES,
  require_admin_access,
)


def _orders_collection() -> str:
  return os.getenv("FIRESTORE_ORDERS_COLLECTION") or "orders"


def _doc_to_dict(doc) -> dict[str, Any]:
  data = doc.to_dict() or {}
  data["id"] = doc.id
  return data


def list_admin_orders(
  access_token: str,
  firestore: Client,
  status_filter: str | None,
  query_text: str | None,
  page: int,
  limit: int,
) -> AdminOrderListResponse:
  require_admin_access(access_token, firestore, ADMIN_READ_ROLES)
  docs = list(firestore.collection(_orders_collection()).stream())
  orders = [_doc_to_dict(doc) for doc in docs]
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


def update_admin_order(
  access_token: str,
  order_id: str,
  payload: AdminOrderUpdateRequest,
  firestore: Client,
) -> AdminOrderUpdateResponse:
  require_admin_access(access_token, firestore, ADMIN_ORDER_WRITE_ROLES)
  status_value = payload.status or "diproses"
  doc_ref = firestore.collection(_orders_collection()).document(order_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  doc_ref.update({"status": status_value, "updated_at": datetime.utcnow()})
  return {
    "order_id": order_id,
    "status": status_value,
    "message": "Order updated",
  }


def update_admin_shipment(
  access_token: str,
  order_id: str,
  payload: AdminShipmentUpdateRequest,
  firestore: Client,
) -> AdminShipmentUpdateResponse:
  require_admin_access(access_token, firestore, ADMIN_ORDER_WRITE_ROLES)
  shipment = {
    "carrier": payload.carrier,
    "nomor_resi": payload.nomor_resi,
    "eta": payload.eta,
  }
  doc_ref = firestore.collection(_orders_collection()).document(order_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(
      status_code=status.HTTP_404_NOT_FOUND,
      detail="Order not found",
    )
  doc_ref.update({"shipment": shipment, "updated_at": datetime.utcnow()})
  return {
    "order_id": order_id,
    "shipment": shipment,
    "message": "Shipment updated",
  }
