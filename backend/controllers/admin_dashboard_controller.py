import os
from collections import Counter
from datetime import datetime
from typing import Any

from google.cloud.firestore_v1 import Client

from lib.admin_access import ADMIN_READ_ROLES, require_admin_access
from models.admin import AdminDashboardResponse


def _orders_collection() -> str:
  return os.getenv("FIRESTORE_ORDERS_COLLECTION") or "orders"


def _products_collection() -> str:
  return "products"


def _to_iso(value: Any) -> str | None:
  if isinstance(value, datetime):
    return value.isoformat()
  if isinstance(value, str):
    return value
  return None


def _sort_timestamp(value: Any) -> float:
  if isinstance(value, datetime):
    try:
      return value.timestamp()
    except Exception:
      return 0.0
  if isinstance(value, str):
    try:
      return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except Exception:
      return 0.0
  return 0.0


def _parse_datetime(value: Any) -> datetime | None:
  if isinstance(value, datetime):
    return value
  if isinstance(value, str):
    try:
      return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
      return None
  return None


def _serialize_order(doc) -> dict[str, Any]:
  raw = doc.to_dict() or {}
  return {
    "id": doc.id,
    "status": raw.get("status"),
    "payment_status": raw.get("payment_status"),
    "total": int(raw.get("total") or 0),
    "user_id": raw.get("user_id"),
    "customer_note": raw.get("customer_note"),
    "created_at": _to_iso(raw.get("created_at")),
  }


def get_admin_dashboard(access_token: str, firestore: Client) -> AdminDashboardResponse:
  require_admin_access(access_token, firestore, ADMIN_READ_ROLES)

  order_docs = list(firestore.collection(_orders_collection()).stream())
  product_docs = list(firestore.collection(_products_collection()).stream())
  orders = [_serialize_order(doc) for doc in order_docs]

  total_orders = len(orders)
  paid_orders = sum(1 for order in orders if order.get("payment_status") == "paid")
  pending_orders = total_orders - paid_orders
  total_revenue = sum(
    int(order.get("total") or 0)
    for order in orders
    if order.get("payment_status") == "paid"
  )
  products_count = len(product_docs)

  status_counter = Counter(
    str(order.get("status") or "unknown")
    for order in orders
  )
  orders_by_status = [
    {"status": key, "count": value}
    for key, value in sorted(
      status_counter.items(),
      key=lambda item: item[1],
      reverse=True,
    )
  ]

  recent_orders = sorted(
    orders,
    key=lambda order: _sort_timestamp(order.get("created_at")),
    reverse=True,
  )[:8]

  yearly_sales_map: dict[int, list[int]] = {}
  for order in orders:
    parsed = _parse_datetime(order.get("created_at"))
    if parsed is None:
      continue
    year = parsed.year
    if year not in yearly_sales_map:
      yearly_sales_map[year] = [0] * 12
    if order.get("payment_status") == "paid":
      month_index = max(0, min(11, parsed.month - 1))
      yearly_sales_map[year][month_index] += int(order.get("total") or 0)

  monthly_sales = [
    {"year": year, "monthly_totals": yearly_sales_map[year]}
    for year in sorted(yearly_sales_map.keys(), reverse=True)
  ]

  return {
    "summary": {
      "total_orders": total_orders,
      "paid_orders": paid_orders,
      "pending_orders": pending_orders,
      "products_count": products_count,
      "total_revenue": total_revenue,
    },
    "orders_by_status": orders_by_status,
    "monthly_sales": monthly_sales,
    "recent_orders": recent_orders,
  }
