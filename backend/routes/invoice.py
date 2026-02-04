from fastapi import APIRouter, Header

from controllers.invoice_controller import get_invoice
from lib.firebase_auth import extract_access_token
from models.invoice import InvoiceResponse

router = APIRouter(prefix="/orders")


@router.get("/{order_id}/invoice", response_model=InvoiceResponse)
def get_invoice_route(
  order_id: str,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return get_invoice(access_token, order_id)
