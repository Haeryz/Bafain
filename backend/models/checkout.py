from typing import Any, Optional

from pydantic import BaseModel


class CheckoutSummaryRequest(BaseModel):
  address: Optional[dict[str, Any]] = None
  shipping_option: Optional[dict[str, Any]] = None
  subtotal: Optional[int] = None


class CheckoutSummaryResponse(BaseModel):
  subtotal: int
  shipping_fee: int
  tax_amount: int
  total: int
  currency: str = "IDR"


class SelectShippingRequest(BaseModel):
  option_id: str


class SelectShippingResponse(BaseModel):
  selected_option: dict[str, Any]
  message: str
