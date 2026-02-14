from typing import Any, Optional

from pydantic import BaseModel, Field


class AdminIdentity(BaseModel):
  uid: str
  role: str
  email: str = ""
  display_name: str = ""


class AdminSessionResponse(BaseModel):
  admin: AdminIdentity


class AdminDashboardSummary(BaseModel):
  total_orders: int
  paid_orders: int
  pending_orders: int
  products_count: int
  total_revenue: int


class AdminStatusCount(BaseModel):
  status: str
  count: int


class AdminMonthlySales(BaseModel):
  year: int
  monthly_totals: list[int]


class AdminDashboardResponse(BaseModel):
  summary: AdminDashboardSummary
  orders_by_status: list[AdminStatusCount]
  monthly_sales: list[AdminMonthlySales]
  recent_orders: list[dict[str, Any]]


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
