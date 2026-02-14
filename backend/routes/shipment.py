from fastapi import APIRouter, Depends, Query

from controllers.shipment_controller import (
  get_shipment,
  list_tracking_events,
  public_track,
)
from lib.auth_dependency import require_access_token
from models.shipment import PublicTrackingResponse, ShipmentResponse, TrackingEventsResponse

router = APIRouter(prefix="/api/v1")


@router.get("/orders/{order_id}/shipment", response_model=ShipmentResponse)
def get_order_shipment(
  order_id: str,
  access_token: str = Depends(require_access_token),
):
  return get_shipment(access_token, order_id)


@router.get("/orders/{order_id}/tracking-events", response_model=TrackingEventsResponse)
def get_tracking_events(
  order_id: str,
  access_token: str = Depends(require_access_token),
):
  return list_tracking_events(access_token, order_id)


@router.get("/track", response_model=PublicTrackingResponse)
def public_track_route(
  order_number: str | None = Query(default=None, alias="orderNumber"),
  email_or_phone: str | None = Query(default=None, alias="emailOrPhone"),
  access_token: str = Depends(require_access_token),
):
  return public_track(access_token, order_number, email_or_phone)
