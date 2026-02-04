from fastapi import APIRouter, Header

from controllers.checkout_controller import (
  checkout_summary,
  select_shipping,
)
from lib.firebase_auth import extract_access_token
from models.checkout import (
  CheckoutSummaryRequest,
  CheckoutSummaryResponse,
  SelectShippingRequest,
  SelectShippingResponse,
)

router = APIRouter(prefix="/checkout")


@router.post("/summary", response_model=CheckoutSummaryResponse)
def checkout_summary_route(
  payload: CheckoutSummaryRequest,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return checkout_summary(access_token, payload)


@router.post("/select-shipping", response_model=SelectShippingResponse)
def select_shipping_route(
  payload: SelectShippingRequest,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return select_shipping(access_token, payload)
