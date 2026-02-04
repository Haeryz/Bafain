from datetime import datetime, timedelta, timezone

from models.invoice import InvoiceResponse
from lib.firebase_auth import get_user_id


def get_invoice(
  access_token: str, order_id: str
) -> InvoiceResponse:
  get_user_id(access_token)
  expires_in = 3600
  expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
  token = expires_at.strftime("%Y%m%d%H%M%S")
  return {
    "order_id": order_id,
    "download_url": f"https://example.com/invoices/{order_id}.pdf?token={token}",
    "expires_in": expires_in,
  }
