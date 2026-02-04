from fastapi import APIRouter, Header, Query

from controllers.shipment_controller import (
  get_shipment,
  list_tracking_events,
  public_track,
)
from lib.firebase_auth import extract_access_token
from models.shipment import PublicTrackingResponse, ShipmentResponse, TrackingEventsResponse

router = APIRouter(prefix="/api/v1")


@router.get("/orders/{order_id}/shipment", response_model=ShipmentResponse)
def get_order_shipment(
  order_id: str,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return get_shipment(access_token, order_id)


@router.get("/orders/{order_id}/tracking-events", response_model=TrackingEventsResponse)
def get_tracking_events(
  order_id: str,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return list_tracking_events(access_token, order_id)


@router.get("/track", response_model=PublicTrackingResponse)
def public_track_route(
  order_number: str | None = Query(default=None, alias="orderNumber"),
  email_or_phone: str | None = Query(default=None, alias="emailOrPhone"),
):
  return public_track(order_number, email_or_phone)
