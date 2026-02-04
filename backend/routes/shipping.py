from fastapi import APIRouter, Header

from controllers.shipping_controller import (
  get_shipping_options,
  get_shipping_quote,
)
from lib.firebase_auth import extract_access_token
from models.shipping import ShippingOptionsResponse, ShippingQuoteRequest, ShippingQuoteResponse

router = APIRouter(prefix="/shipping")


@router.get("/options", response_model=ShippingOptionsResponse)
def shipping_options(
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return get_shipping_options(access_token)


@router.post("/quote", response_model=ShippingQuoteResponse)
def shipping_quote(
  payload: ShippingQuoteRequest,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return get_shipping_quote(access_token, payload)
