from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class AddressBase(BaseModel):
  label: Optional[str] = Field(default=None, max_length=120)
  recipient_name: Optional[str] = Field(default=None, max_length=200)
  phone: Optional[str] = Field(default=None, max_length=50)
  address_line1: Optional[str] = Field(default=None, max_length=500)
  address_line2: Optional[str] = Field(default=None, max_length=500)
  city: Optional[str] = Field(default=None, max_length=120)
  province: Optional[str] = Field(default=None, max_length=120)
  postal_code: Optional[str] = Field(default=None, max_length=30)
  country: Optional[str] = Field(default=None, max_length=120)
  notes: Optional[str] = Field(default=None, max_length=500)
  latitude: Optional[float] = None
  longitude: Optional[float] = None
  is_default: Optional[bool] = None
  metadata: Optional[dict[str, Any]] = None


class AddressCreateRequest(AddressBase):
  pass


class AddressUpdateRequest(AddressBase):
  pass


class AddressResponse(BaseModel):
  address: dict[str, Any]


class AddressListResponse(BaseModel):
  addresses: list[dict[str, Any]]


class AddressDeleteResponse(BaseModel):
  message: str
  address_id: str
  deleted: bool = True


class AddressDefaultResponse(BaseModel):
  address: dict[str, Any]
  message: str
