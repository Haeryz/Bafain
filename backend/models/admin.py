from typing import Any, Optional

from pydantic import BaseModel, Field


class AdminOrderListResponse(BaseModel):
  orders: list[dict[str, Any]]
  page: int
  limit: int
  total: int


class AdminOrderUpdateRequest(BaseModel):
  status: Optional[str] = Field(default=None, max_length=50)
  notes: Optional[str] = Field(default=None, max_length=2000)


class AdminOrderUpdateResponse(BaseModel):
  order_id: str
  status: str
  message: str


class AdminShipmentUpdateRequest(BaseModel):
  carrier: str = Field(min_length=1, max_length=100)
  nomor_resi: str = Field(min_length=1, max_length=100)
  eta: Optional[str] = Field(default=None, max_length=100)


class AdminShipmentUpdateResponse(BaseModel):
  order_id: str
  shipment: dict[str, Any]
  message: str
