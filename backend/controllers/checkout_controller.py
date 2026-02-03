import logging
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.checkout import (
  CheckoutSummaryRequest,
  CheckoutSummaryResponse,
  SelectShippingRequest,
  SelectShippingResponse,
)
from models.shipping import ShippingOption

logger = logging.getLogger("bafain.checkout")


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


def extract_access_token(authorization: str | None) -> str:
  if not authorization:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Missing Authorization header",
    )
  scheme, _, token = authorization.partition(" ")
  if scheme.lower() != "bearer" or not token.strip():
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid Authorization header",
    )
  return token.strip()


def _get_user(access_token: str, supabase: Client):
  try:
    response = supabase.auth.get_user(access_token)
  except Exception as exc:
    logger.warning("Supabase auth get_user error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    ) from exc

  user = getattr(response, "user", None)
  if user is None:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
    )
  return user


def checkout_summary(
  access_token: str, payload: CheckoutSummaryRequest, supabase: Client
) -> CheckoutSummaryResponse:
  _get_user(access_token, supabase)
  subtotal = payload.subtotal or 0
  shipping_option = payload.shipping_option or {}
  shipping_fee = 0
  for key in ["price", "price_value", "shipping_fee"]:
    value = shipping_option.get(key)
    if isinstance(value, (int, float)):
      shipping_fee = int(value)
      break
  total = subtotal + shipping_fee
  return {
    "subtotal": subtotal,
    "shipping_fee": shipping_fee,
    "total": total,
    "currency": "IDR",
  }


def select_shipping(
  access_token: str,
  payload: SelectShippingRequest,
  supabase: Client,
) -> SelectShippingResponse:
  _get_user(access_token, supabase)
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
