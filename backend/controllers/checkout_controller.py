from models.checkout import (
  CheckoutSummaryRequest,
  CheckoutSummaryResponse,
  SelectShippingRequest,
  SelectShippingResponse,
)
from models.shipping import ShippingOption
from lib.firebase_auth import get_user_id

TAX_RATE = 0.11


def _default_options() -> list[ShippingOption]:
  return [
    ShippingOption(
      id="standar",
      name="Pengiriman Standar",
      price=50000,
      eta_text="3 - 5 hari kerja",
    ),
    ShippingOption(
      id="ekspres",
      name="Pengiriman Ekspres",
      price=150000,
      eta_text="1 - 2 hari kerja",
    ),
    ShippingOption(
      id="premium",
      name="Pengiriman Premium",
      price=150000,
      eta_text="Pengiriman hari berikutnya",
    ),
  ]


def checkout_summary(
  access_token: str, payload: CheckoutSummaryRequest
) -> CheckoutSummaryResponse:
  get_user_id(access_token)
  subtotal = payload.subtotal or 0
  shipping_option = payload.shipping_option or {}
  shipping_fee = 0
  for key in ["price", "price_value", "shipping_fee"]:
    value = shipping_option.get(key)
    if isinstance(value, (int, float)):
      shipping_fee = int(value)
      break
  pre_tax_total = subtotal + shipping_fee
  tax_amount = int(round(pre_tax_total * TAX_RATE))
  total = pre_tax_total + tax_amount
  return {
    "subtotal": subtotal,
    "shipping_fee": shipping_fee,
    "tax_amount": tax_amount,
    "total": total,
    "currency": "IDR",
  }


def select_shipping(
  access_token: str,
  payload: SelectShippingRequest,
) -> SelectShippingResponse:
  get_user_id(access_token)
  options = {option.id: option for option in _default_options()}
  option = options.get(payload.option_id)
  if option is None:
    option = ShippingOption(
      id=payload.option_id,
      name=payload.option_id.replace("-", " ").title(),
      price=0,
      eta_text="TBD",
    )
  return {"selected_option": option.model_dump(), "message": "Shipping selected"}
