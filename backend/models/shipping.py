from typing import Any, Optional

from pydantic import BaseModel, Field


class ShippingOption(BaseModel):
  id: str
  name: str
  price: int = Field(ge=0)
  eta_text: str


class ShippingOptionsResponse(BaseModel):
  options: list[ShippingOption]
  currency: str = "IDR"


class ShippingQuoteRequest(BaseModel):
  address: Optional[dict[str, Any]] = None
  items: Optional[list[dict[str, Any]]] = None


class ShippingQuoteResponse(BaseModel):
  options: list[ShippingOption]
  currency: str = "IDR"
