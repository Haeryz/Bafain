import logging
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from supabase import Client

from models.invoice import InvoiceResponse

logger = logging.getLogger("bafain.invoice")


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


def get_invoice(
  access_token: str, order_id: str, supabase: Client
) -> InvoiceResponse:
  _get_user(access_token, supabase)
  expires_in = 3600
  expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
  token = expires_at.strftime("%Y%m%d%H%M%S")
  return {
    "order_id": order_id,
    "download_url": f"https://example.com/invoices/{order_id}.pdf?token={token}",
    "expires_in": expires_in,
  }
