import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.shipment import PublicTrackingResponse, ShipmentResponse, TrackingEventsResponse

logger = logging.getLogger("bafain.shipment")


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
  access_token: str, order_id: str, supabase: Client
) -> ShipmentResponse:
  _get_user(access_token, supabase)
  return {"shipment": _default_shipment(order_id)}


def list_tracking_events(
  access_token: str, order_id: str, supabase: Client
) -> TrackingEventsResponse:
  _get_user(access_token, supabase)
  return {"order_id": order_id, "events": _default_events(order_id)}


def public_track(
  order_number: str | None, email_or_phone: str | None, supabase: Client
) -> PublicTrackingResponse:
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
