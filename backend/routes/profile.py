from fastapi import APIRouter, Depends, Query

from controllers.profile_controller import (
  get_order_stats,
  get_profile,
  get_recent_orders,
  update_avatar,
  update_profile,
)
from lib.auth_dependency import require_access_token
from lib.firestore_client import get_firestore_client
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
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return get_profile(access_token, firestore)


@router.patch("", response_model=ProfileResponse)
def update_me(
  payload: ProfileUpdateRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return update_profile(access_token, payload, firestore)


@router.post("/avatar", response_model=ProfileResponse)
def update_me_avatar(
  payload: ProfileAvatarRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return update_avatar(access_token, payload.avatar_url, firestore)


@router.get("/order-stats", response_model=OrderStatsResponse)
def order_stats(
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return get_order_stats(access_token, firestore)


@router.get("/orders/recent", response_model=RecentOrdersResponse)
def recent_orders(
  limit: int = Query(default=5, ge=1, le=50),
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return get_recent_orders(access_token, firestore, limit)

