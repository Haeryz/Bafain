from fastapi import APIRouter, Depends

from controllers.invoice_controller import get_invoice
from lib.auth_dependency import require_access_token
from models.invoice import InvoiceResponse

router = APIRouter(prefix="/orders")


@router.get("/{order_id}/invoice", response_model=InvoiceResponse)
def get_invoice_route(
  order_id: str,
  access_token: str = Depends(require_access_token),
):
  return get_invoice(access_token, order_id)
