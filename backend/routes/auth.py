from fastapi import APIRouter, Depends

from controllers.auth_controller import (
  forgot_password,
  login_user,
  refresh_session,
  register_user,
  reset_password,
)
from lib.rate_limit import enforce_auth_rate_limit
from models.auth import (
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRefreshRequest,
  AuthRegisterRequest,
  AuthRegisterResponse,
  AuthResetPasswordRequest,
  AuthSessionResponse,
  MessageResponse,
)

router = APIRouter(dependencies=[Depends(enforce_auth_rate_limit)])


@router.post("/register", response_model=AuthRegisterResponse)
def register(payload: AuthRegisterRequest):
  return register_user(payload)


@router.post("/login", response_model=AuthSessionResponse)
def login(payload: AuthLoginRequest):
  return login_user(payload)


@router.post("/refresh", response_model=AuthSessionResponse)
def refresh(payload: AuthRefreshRequest):
  return refresh_session(payload)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password_route(payload: AuthForgotPasswordRequest):
  return forgot_password(payload)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_route(payload: AuthResetPasswordRequest):
  return reset_password(payload)
