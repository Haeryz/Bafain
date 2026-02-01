from typing import Any, Optional

from pydantic import BaseModel, Field


class OrderCreateRequest(BaseModel):
  address: dict[str, Any]
  shipping_option: dict[str, Any]
  customer_note: Optional[str] = Field(default=None, max_length=2000)


class OrderResponse(BaseModel):
  order: dict[str, Any]


class OrderListResponse(BaseModel):
  orders: list[dict[str, Any]]
  page: int
  limit: int
  total: int


class OrderActionResponse(BaseModel):
  order_id: str
  status: str
  message: str


class OrderNoteRequest(BaseModel):
  note: str = Field(min_length=1, max_length=2000)


class OrderNotesResponse(BaseModel):
  order_id: str
  notes: list[dict[str, Any]]
