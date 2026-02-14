from fastapi import APIRouter, Depends

from controllers.shipping_controller import (
  get_shipping_options,
  get_shipping_quote,
)
from lib.auth_dependency import require_access_token
from models.shipping import ShippingOptionsResponse, ShippingQuoteRequest, ShippingQuoteResponse

router = APIRouter(prefix="/shipping")


@router.get("/options", response_model=ShippingOptionsResponse)
def shipping_options(
  access_token: str = Depends(require_access_token),
):
  return get_shipping_options(access_token)


@router.post("/quote", response_model=ShippingQuoteResponse)
def shipping_quote(
  payload: ShippingQuoteRequest,
  access_token: str = Depends(require_access_token),
):
  return get_shipping_quote(access_token, payload)
