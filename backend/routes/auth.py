from fastapi import APIRouter

from controllers.auth_controller import (
  forgot_password,
  login_user,
  register_user,
  reset_password,
)
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
def register(payload: AuthRegisterRequest):
  return register_user(payload)


@router.post("/login", response_model=AuthSessionResponse)
def login(payload: AuthLoginRequest):
  return login_user(payload)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password_route(payload: AuthForgotPasswordRequest):
  return forgot_password(payload)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_route(payload: AuthResetPasswordRequest):
  return reset_password(payload)
