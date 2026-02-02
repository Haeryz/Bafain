from fastapi import APIRouter, Depends, Header, Query

from controllers.profile_controller import (
  extract_access_token,
  get_order_stats,
  get_profile,
  get_recent_orders,
  update_avatar,
  update_profile,
)
from lib.firestore_client import get_firestore_client
from lib.supabase_client import get_supabase_client
from models.profile import (
  OrderStatsResponse,
  ProfileAvatarRequest,
  ProfileResponse,
  ProfileUpdateRequest,
  RecentOrdersResponse,
)

router = APIRouter(prefix="/api/v1/me")


@router.get("", response_model=ProfileResponse)
def get_me(
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  return get_profile(access_token, firestore)


@router.patch("", response_model=ProfileResponse)
def update_me(
  payload: ProfileUpdateRequest,
  authorization: str | None = Header(default=None),
  x_refresh_token: str | None = Header(default=None, alias="X-Refresh-Token"),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  return update_profile(access_token, payload, firestore)


@router.post("/avatar", response_model=ProfileResponse)
def update_me_avatar(
  payload: ProfileAvatarRequest,
  authorization: str | None = Header(default=None),
  x_refresh_token: str | None = Header(default=None, alias="X-Refresh-Token"),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  return update_avatar(access_token, payload.avatar_url, firestore)


@router.get("/order-stats", response_model=OrderStatsResponse)
def order_stats(
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_order_stats(access_token, supabase)


@router.get("/orders/recent", response_model=RecentOrdersResponse)
def recent_orders(
  limit: int = Query(default=5, ge=1, le=50),
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return get_recent_orders(access_token, supabase, limit)

