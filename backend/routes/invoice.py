from fastapi import APIRouter, Depends, Header

from controllers.invoice_controller import extract_access_token, get_invoice
from lib.supabase_client import get_supabase_client
from models.invoice import InvoiceResponse

router = APIRouter(prefix="/orders")


@router.get("/{order_id}/invoice", response_model=InvoiceResponse)
def get_invoice_route(
  order_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_invoice(access_token, order_id, supabase)
