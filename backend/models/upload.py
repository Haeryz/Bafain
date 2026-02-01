from typing import Optional

from pydantic import BaseModel, Field


class SignedUploadRequest(BaseModel):
  filename: str = Field(min_length=1, max_length=255)
  folder: str = Field(default="products", min_length=1, max_length=120)
  product_id: Optional[str] = Field(default=None, max_length=64)
  upsert: bool = False


class SignedUploadResponse(BaseModel):
  bucket: str
  path: str
  signed_url: Optional[str] = None
  token: Optional[str] = None
  public_url: Optional[str] = None
