from typing import Optional

from pydantic import BaseModel


class InvoiceResponse(BaseModel):
  order_id: str
  download_url: str
  expires_in: Optional[int] = None
