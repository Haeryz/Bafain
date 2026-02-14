from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from models.shipment import PublicTrackingResponse, ShipmentResponse, TrackingEventsResponse
from lib.firebase_auth import get_user_id


def _now_iso() -> str:
  return datetime.now(timezone.utc).isoformat()


def _default_shipment(order_id: str) -> dict[str, Any]:
  return {
    "order_id": order_id,
    "carrier": "JNE",
    "tracking_number": "RESI123456789",
    "nomor_resi": "RESI123456789",
    "shipped_at": _now_iso(),
    "eta": "2-3 hari",
  }


def _default_events(order_id: str) -> list[dict[str, Any]]:
  return [
    {
      "order_id": order_id,
      "status": "Order dibuat",
      "description": "Pesanan diterima",
      "timestamp": _now_iso(),
    },
  ]


def get_shipment(
  access_token: str, order_id: str
) -> ShipmentResponse:
  get_user_id(access_token)
  return {"shipment": _default_shipment(order_id)}


def list_tracking_events(
  access_token: str, order_id: str
) -> TrackingEventsResponse:
  get_user_id(access_token)
  return {"order_id": order_id, "events": _default_events(order_id)}


def public_track(
  access_token: str,
  order_number: str | None,
  email_or_phone: str | None,
) -> PublicTrackingResponse:
  get_user_id(access_token)
  if not order_number or not email_or_phone:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="orderNumber and emailOrPhone are required",
    )
  return {
    "order_number": order_number,
    "shipment": _default_shipment(order_number),
    "events": _default_events(order_number),
  }
