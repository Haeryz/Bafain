from typing import Any

from pydantic import BaseModel


class ShipmentResponse(BaseModel):
  shipment: dict[str, Any]


class TrackingEventsResponse(BaseModel):
  order_id: str
  events: list[dict[str, Any]]


class PublicTrackingResponse(BaseModel):
  order_number: str
  shipment: dict[str, Any]
  events: list[dict[str, Any]]
