import logging

from fastapi import HTTPException, status
from supabase import Client

from models.shipping import ShippingOption, ShippingOptionsResponse, ShippingQuoteRequest, ShippingQuoteResponse

logger = logging.getLogger("bafain.shipping")


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


def _default_options() -> list[ShippingOption]:
  return [
    ShippingOption(id="standard", name="Standard", price=15000, eta_text="2-3 hari"),
    ShippingOption(id="express", name="Express", price=30000, eta_text="1-2 hari"),
    ShippingOption(id="premium", name="Premium", price=50000, eta_text="0-1 hari"),
  ]


def get_shipping_options(access_token: str, supabase: Client) -> ShippingOptionsResponse:
  _get_user(access_token, supabase)
  return {"options": _default_options(), "currency": "IDR"}


def get_shipping_quote(
  access_token: str, payload: ShippingQuoteRequest, supabase: Client
) -> ShippingQuoteResponse:
  _get_user(access_token, supabase)
  return {"options": _default_options(), "currency": "IDR"}
