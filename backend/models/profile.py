from typing import Any

from pydantic import BaseModel, Field


class ProfileResponse(BaseModel):
  user: dict[str, Any]


class ProfileUpdateRequest(BaseModel):
  full_name: str | None = Field(default=None, max_length=200)
  phone: str | None = Field(default=None, max_length=50)
  avatar_url: str | None = Field(default=None, max_length=2000)
  metadata: dict[str, Any] | None = None


class ProfileAvatarRequest(BaseModel):
  avatar_url: str = Field(min_length=1, max_length=2000)


class OrderStatsResponse(BaseModel):
  counts: dict[str, int]


class RecentOrdersResponse(BaseModel):
  orders: list[dict[str, Any]]
