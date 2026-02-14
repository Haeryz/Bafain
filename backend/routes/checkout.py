from fastapi import APIRouter, Depends

from controllers.checkout_controller import (
  checkout_summary,
  select_shipping,
)
from lib.auth_dependency import require_access_token
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
  access_token: str = Depends(require_access_token),
):
  return checkout_summary(access_token, payload)


@router.post("/select-shipping", response_model=SelectShippingResponse)
def select_shipping_route(
  payload: SelectShippingRequest,
  access_token: str = Depends(require_access_token),
):
  return select_shipping(access_token, payload)
