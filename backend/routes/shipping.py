from fastapi import APIRouter, Depends, Header

from controllers.shipping_controller import (
  extract_access_token,
  get_shipping_options,
  get_shipping_quote,
)
from lib.supabase_client import get_supabase_client
from models.shipping import ShippingOptionsResponse, ShippingQuoteRequest, ShippingQuoteResponse

router = APIRouter(prefix="/shipping")


@router.get("/options", response_model=ShippingOptionsResponse)
def shipping_options(
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_shipping_options(access_token, supabase)


@router.post("/quote", response_model=ShippingQuoteResponse)
def shipping_quote(
  payload: ShippingQuoteRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_shipping_quote(access_token, payload, supabase)
