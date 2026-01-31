from typing import Any, Optional

from pydantic import BaseModel, Field


class CartItemCreateRequest(BaseModel):
  product_id: str = Field(min_length=1, max_length=100)
  qty: int = Field(ge=1)


class CartItemUpdateRequest(BaseModel):
  qty: int = Field(ge=1)


class CartItemResponse(BaseModel):
  item: dict[str, Any]


class CartResponse(BaseModel):
  items: list[dict[str, Any]]
  subtotal: int = 0
  currency: str = "IDR"


class CartItemDeleteResponse(BaseModel):
  message: str
  item_id: str
  deleted: bool = True


class CheckoutSummaryRequest(BaseModel):
  address: Optional[dict[str, Any]] = None
  shipping_option: Optional[dict[str, Any]] = None


class CheckoutSummaryResponse(BaseModel):
  subtotal: int
  shipping_fee: int
  total: int
  currency: str = "IDR"
