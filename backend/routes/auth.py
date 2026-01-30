from fastapi import APIRouter, Depends

from controllers.auth_controller import (
  forgot_password,
  login_user,
  register_user,
  reset_password,
)
from lib.supabase_client import get_supabase_client
from models.auth import (
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthRegisterResponse,
  AuthResetPasswordRequest,
  AuthSessionResponse,
  MessageResponse,
)

router = APIRouter()


@router.post("/register", response_model=AuthRegisterResponse)
def register(
  payload: AuthRegisterRequest, supabase=Depends(get_supabase_client)
):
  return register_user(payload, supabase)


@router.post("/login", response_model=AuthSessionResponse)
def login(payload: AuthLoginRequest, supabase=Depends(get_supabase_client)):
  return login_user(payload, supabase)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password_route(
  payload: AuthForgotPasswordRequest, supabase=Depends(get_supabase_client)
):
  return forgot_password(payload, supabase)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_route(
  payload: AuthResetPasswordRequest, supabase=Depends(get_supabase_client)
):
  return reset_password(payload, supabase)
