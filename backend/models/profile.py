from typing import Any

from pydantic import BaseModel, Field


class ProfilePayload(BaseModel):
  full_name: str | None = Field(default=None, max_length=200)
  email: str | None = Field(default=None, max_length=320)
  phone: str | None = Field(default=None, max_length=50)
  company: str | None = Field(default=None, max_length=200)
  address: str | None = Field(default=None, max_length=500)
  joined_date: str | None = Field(default=None, max_length=32)
  avatar_url: str | None = Field(default=None, max_length=2000)


class ProfileResponse(BaseModel):
  user: dict[str, Any]
  profile: ProfilePayload


class ProfileUpdateRequest(BaseModel):
  full_name: str | None = Field(default=None, max_length=200)
  email: str | None = Field(default=None, max_length=320)
  phone: str | None = Field(default=None, max_length=50)
  company: str | None = Field(default=None, max_length=200)
  address: str | None = Field(default=None, max_length=500)
  joined_date: str | None = Field(default=None, max_length=32)
  avatar_url: str | None = Field(default=None, max_length=2000)
  metadata: dict[str, Any] | None = None


class ProfileAvatarRequest(BaseModel):
  avatar_url: str = Field(min_length=1, max_length=2000)


class OrderStatsResponse(BaseModel):
  counts: dict[str, int]


class RecentOrdersResponse(BaseModel):
  orders: list[dict[str, Any]]
