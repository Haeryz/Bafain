from fastapi import APIRouter, Depends, Header, Query

from controllers.shipment_controller import (
  extract_access_token,
  get_shipment,
  list_tracking_events,
  public_track,
)
from lib.supabase_client import get_supabase_client
from models.shipment import PublicTrackingResponse, ShipmentResponse, TrackingEventsResponse

router = APIRouter(prefix="/api/v1")


@router.get("/orders/{order_id}/shipment", response_model=ShipmentResponse)
def get_order_shipment(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_shipment(access_token, order_id, supabase)


@router.get("/orders/{order_id}/tracking-events", response_model=TrackingEventsResponse)
def get_tracking_events(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return list_tracking_events(access_token, order_id, supabase)


@router.get("/track", response_model=PublicTrackingResponse)
def public_track_route(
  order_number: str | None = Query(default=None, alias="orderNumber"),
  email_or_phone: str | None = Query(default=None, alias="emailOrPhone"),
  supabase=Depends(get_supabase_client),
):
  return public_track(order_number, email_or_phone, supabase)
