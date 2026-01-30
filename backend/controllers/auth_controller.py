import os
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.auth import (
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest,
)


def _to_dict(value: Any) -> dict[str, Any] | None:
  if value is None:
    return None
  if isinstance(value, dict):
    return value
  if hasattr(value, "model_dump"):
    return value.model_dump()
  if hasattr(value, "dict"):
    return value.dict()
  return None


def register_user(payload: AuthRegisterRequest, supabase: Client) -> dict[str, Any]:
  try:
    response = supabase.auth.sign_up(
      {"email": payload.email, "password": payload.password}
    )
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 422):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unable to register with provided credentials",
      )
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Auth service unavailable",
    ) from exc

  return {
    "user": _to_dict(getattr(response, "user", None)),
    "session": _to_dict(getattr(response, "session", None)),
    "message": "If the email is valid, a confirmation message has been sent.",
  }


def login_user(payload: AuthLoginRequest, supabase: Client) -> dict[str, Any]:
  try:
    response = supabase.auth.sign_in_with_password(
      {"email": payload.email, "password": payload.password}
    )
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 401):
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
      )
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Auth service unavailable",
    ) from exc

  return {
    "user": _to_dict(getattr(response, "user", None)),
    "session": _to_dict(getattr(response, "session", None)),
  }


def forgot_password(
  payload: AuthForgotPasswordRequest, supabase: Client
) -> dict[str, Any]:
  redirect_to = (
    os.getenv("SUPABASE_RESET_REDIRECT_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_RESET_REDIRECT_URL")
  )
  options = {"redirect_to": redirect_to} if redirect_to else None

  try:
    if options:
      supabase.auth.reset_password_for_email(payload.email, options)
    else:
      supabase.auth.reset_password_for_email(payload.email)
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 422):
      return {"message": "If the email exists, a reset link has been sent."}
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Auth service unavailable",
    ) from exc

  return {"message": "If the email exists, a reset link has been sent."}


def reset_password(
  payload: AuthResetPasswordRequest, supabase: Client
) -> dict[str, Any]:
  try:
    supabase.auth.set_session(payload.access_token, payload.refresh_token)
    supabase.auth.update_user({"password": payload.new_password})
  except Exception as exc:
    status_code = getattr(exc, "status", None)
    if status_code in (400, 401, 403):
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired reset session",
      )
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Auth service unavailable",
    ) from exc

  return {"message": "Password updated successfully"}
