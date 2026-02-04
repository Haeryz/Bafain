from models.shipping import ShippingOption, ShippingOptionsResponse, ShippingQuoteRequest, ShippingQuoteResponse
from lib.firebase_auth import get_user_id


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


def get_shipping_options(access_token: str) -> ShippingOptionsResponse:
  get_user_id(access_token)
  return {"options": _default_options(), "currency": "IDR"}


def get_shipping_quote(
  access_token: str, payload: ShippingQuoteRequest
) -> ShippingQuoteResponse:
  get_user_id(access_token)
  return {"options": _default_options(), "currency": "IDR"}
