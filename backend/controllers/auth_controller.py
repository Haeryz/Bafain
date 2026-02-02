import logging
import os
from typing import Any

from fastapi import HTTPException, status
from firebase_admin import auth as firebase_auth

from lib.firebase_admin import init_firebase
from lib.firebase_identity import (
  FirebaseIdentityError,
  refresh_id_token,
  reset_password_with_oob_code,
  send_password_reset,
  sign_in_with_password,
  sign_up,
  update_password_with_id_token,
)
from models.auth import (
  AuthForgotPasswordRequest,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResetPasswordRequest,
)

logger = logging.getLogger("bafain.auth")


def _is_rate_limited(code: str | None) -> bool:
  if not code:
    return False
  upper = str(code).upper()
  return (
    "TOO_MANY_ATTEMPTS" in upper
    or "RESOURCE_EXHAUSTED" in upper
    or "RATE_LIMIT" in upper
  )


def _auth_error_detail(error: Any, fallback: str) -> str:
  debug = os.getenv("AUTH_DEBUG") == "true"
  if debug and error is not None:
    return str(error)
  return fallback


def _raise_identity_error(
  exc: FirebaseIdentityError, fallback: str, default_status: int
) -> None:
  code = (exc.code or "").upper()
  if _is_rate_limited(code):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    message = "Rate limit exceeded"
  elif code in (
    "INVALID_PASSWORD",
    "EMAIL_NOT_FOUND",
    "INVALID_LOGIN_CREDENTIALS",
  ):
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Invalid email or password"
  elif code in ("EMAIL_EXISTS", "EMAIL_ALREADY_EXISTS"):
    status_code = status.HTTP_400_BAD_REQUEST
    message = "Email already registered"
  elif code == "INVALID_EMAIL":
    status_code = status.HTTP_400_BAD_REQUEST
    message = "Invalid email address"
  elif code == "USER_DISABLED":
    status_code = status.HTTP_403_FORBIDDEN
    message = "User account disabled"
  elif code in (
    "TOKEN_EXPIRED",
    "INVALID_ID_TOKEN",
    "INVALID_OOB_CODE",
    "EXPIRED_OOB_CODE",
  ):
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "Invalid or expired reset session"
  else:
    status_code = default_status
    message = fallback

  logger.warning("Firebase auth error: %s", exc.code or str(exc))
  raise HTTPException(
    status_code=status_code,
    detail=_auth_error_detail(exc, message),
  )


def _maybe_init_firebase() -> bool:
  try:
    init_firebase()
    return True
  except Exception as exc:
    logger.warning("Firebase admin init failed: %s", str(exc))
    return False


def _build_session(payload: dict[str, Any]) -> dict[str, Any] | None:
  access_token = payload.get("idToken") or payload.get("id_token")
  refresh_token = payload.get("refreshToken") or payload.get("refresh_token")
  expires_in = payload.get("expiresIn") or payload.get("expires_in")
  if not access_token and not refresh_token:
    return None
  session: dict[str, Any] = {"token_type": "bearer"}
  if access_token:
    session["access_token"] = access_token
  if refresh_token:
    session["refresh_token"] = refresh_token
  if expires_in:
    session["expires_in"] = expires_in
  return session


def _build_user_fallback(payload: dict[str, Any]) -> dict[str, Any] | None:
  user: dict[str, Any] = {}
  local_id = payload.get("localId")
  if local_id:
    user["id"] = local_id
    user["uid"] = local_id
  email = payload.get("email")
  if email:
    user["email"] = email
  display_name = payload.get("displayName")
  if display_name:
    user["display_name"] = display_name
  return user or None


def _build_user_payload(
  record: firebase_auth.UserRecord | None,
  fallback: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
  if record is None:
    return fallback
  user: dict[str, Any] = {
    "id": record.uid,
    "uid": record.uid,
    "email_verified": record.email_verified,
  }
  if record.email:
    user["email"] = record.email
  if record.display_name:
    user["display_name"] = record.display_name
  if record.phone_number:
    user["phone_number"] = record.phone_number
  return user


def _looks_like_jwt(value: str) -> bool:
  return value.count(".") >= 2


def register_user(payload: AuthRegisterRequest) -> dict[str, Any]:
  try:
    response = sign_up(
      payload.email,
      payload.password,
      display_name=payload.name or None,
    )
  except FirebaseIdentityError as exc:
    _raise_identity_error(
      exc, "Unable to register with provided credentials", 400
    )
  except Exception as exc:
    logger.warning("Firebase sign up error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  local_id = response.get("localId")
  user_record = None
  if local_id and _maybe_init_firebase():
    update_fields: dict[str, Any] = {}
    if payload.name:
      update_fields["display_name"] = payload.name
    if payload.phone:
      update_fields["phone_number"] = payload.phone
    if update_fields:
      try:
        firebase_auth.update_user(local_id, **update_fields)
      except Exception as exc:
        logger.warning("Firebase user update failed: %s", str(exc))
    try:
      user_record = firebase_auth.get_user(local_id)
    except Exception as exc:
      logger.warning("Firebase get_user failed: %s", str(exc))

  return {
    "user": _build_user_payload(user_record, _build_user_fallback(response)),
    "session": _build_session(response),
    "message": "Registration successful.",
  }


def login_user(payload: AuthLoginRequest) -> dict[str, Any]:
  try:
    response = sign_in_with_password(payload.email, payload.password)
  except FirebaseIdentityError as exc:
    _raise_identity_error(exc, "Invalid email or password", 401)
  except Exception as exc:
    logger.warning("Firebase login error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  local_id = response.get("localId")
  user_record = None
  if local_id and _maybe_init_firebase():
    try:
      user_record = firebase_auth.get_user(local_id)
    except Exception as exc:
      logger.warning("Firebase get_user failed: %s", str(exc))

  return {
    "user": _build_user_payload(user_record, _build_user_fallback(response)),
    "session": _build_session(response),
  }


def forgot_password(payload: AuthForgotPasswordRequest) -> dict[str, Any]:
  continue_url = os.getenv("FIREBASE_RESET_REDIRECT_URL")
  try:
    send_password_reset(payload.email, continue_url=continue_url)
  except FirebaseIdentityError as exc:
    code = (exc.code or "").upper()
    if _is_rate_limited(code) or code in ("EMAIL_NOT_FOUND", "INVALID_EMAIL"):
      return {"message": "If the email exists, a reset link has been sent."}
    _raise_identity_error(exc, "Auth service unavailable", 502)
  except Exception as exc:
    logger.warning("Firebase forgot password error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  return {"message": "If the email exists, a reset link has been sent."}


def reset_password(payload: AuthResetPasswordRequest) -> dict[str, Any]:
  token = payload.access_token.strip()
  if not token:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Reset token is required.",
    )

  try:
    if _looks_like_jwt(token):
      try:
        update_password_with_id_token(token, payload.new_password)
      except FirebaseIdentityError as exc:
        code = (exc.code or "").upper()
        if (
          code in ("TOKEN_EXPIRED", "INVALID_ID_TOKEN")
          and payload.refresh_token
        ):
          refreshed = refresh_id_token(payload.refresh_token)
          refreshed_token = refreshed.get("id_token")
          if refreshed_token:
            update_password_with_id_token(
              refreshed_token, payload.new_password
            )
          else:
            _raise_identity_error(
              exc, "Invalid or expired reset session", 401
            )
        else:
          _raise_identity_error(
            exc, "Invalid or expired reset session", 401
          )
    else:
      reset_password_with_oob_code(token, payload.new_password)
  except FirebaseIdentityError as exc:
    _raise_identity_error(exc, "Invalid or expired reset session", 401)
  except Exception as exc:
    logger.warning("Firebase reset password error: %s", str(exc))
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=_auth_error_detail(exc, "Auth service unavailable"),
    ) from exc

  return {"message": "Password updated successfully"}
