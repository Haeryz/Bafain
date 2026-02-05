import json
import os
import urllib.error
import urllib.request
from typing import Any

IDENTITY_BASE_URL = "https://identitytoolkit.googleapis.com/v1"
SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1"


class FirebaseIdentityError(Exception):
  def __init__(
    self,
    message: str,
    code: str | None = None,
    status_code: int | None = None,
  ) -> None:
    super().__init__(message)
    self.code = code
    self.status_code = status_code


def _get_api_key() -> str:
  api_key = (
    os.getenv("FIREBASE_WEB_API_KEY")
    or os.getenv("VITE_FIREBASE_API_KEY")
    or os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY")
  )
  if not api_key:
    raise RuntimeError("FIREBASE_WEB_API_KEY is missing.")
  return api_key


def _post_json(url: str, payload: dict[str, Any]) -> dict[str, Any]:
  data = json.dumps(payload).encode("utf-8")
  req = urllib.request.Request(
    url, data=data, headers={"Content-Type": "application/json"}
  )
  try:
    with urllib.request.urlopen(req, timeout=12) as response:
      text = response.read().decode("utf-8")
      return json.loads(text) if text else {}
  except urllib.error.HTTPError as exc:
    text = exc.read().decode("utf-8")
    body: dict[str, Any] = {}
    if text:
      try:
        body = json.loads(text)
      except json.JSONDecodeError:
        body = {}
    message = None
    if isinstance(body, dict):
      error = body.get("error")
      if isinstance(error, dict):
        message = error.get("message")
    if not message:
      message = exc.reason
    raise FirebaseIdentityError(
      message=message or "Firebase Identity request failed",
      code=message,
      status_code=exc.code,
    ) from exc
  except urllib.error.URLError as exc:
    raise FirebaseIdentityError(
      message="Firebase Identity service unreachable",
      code="SERVICE_UNAVAILABLE",
      status_code=None,
    ) from exc


def sign_up(
  email: str, password: str, display_name: str | None = None
) -> dict[str, Any]:
  url = f"{IDENTITY_BASE_URL}/accounts:signUp?key={_get_api_key()}"
  payload: dict[str, Any] = {
    "email": email,
    "password": password,
    "returnSecureToken": True,
  }
  if display_name:
    payload["displayName"] = display_name
  return _post_json(url, payload)


def sign_in_with_password(email: str, password: str) -> dict[str, Any]:
  url = (
    f"{IDENTITY_BASE_URL}/accounts:signInWithPassword?key={_get_api_key()}"
  )
  payload = {
    "email": email,
    "password": password,
    "returnSecureToken": True,
  }
  return _post_json(url, payload)


def send_password_reset(
  email: str, continue_url: str | None = None
) -> dict[str, Any]:
  url = f"{IDENTITY_BASE_URL}/accounts:sendOobCode?key={_get_api_key()}"
  payload: dict[str, Any] = {"requestType": "PASSWORD_RESET", "email": email}
  if continue_url:
    payload["continueUrl"] = continue_url
  return _post_json(url, payload)


def update_password_with_id_token(
  id_token: str, new_password: str
) -> dict[str, Any]:
  url = f"{IDENTITY_BASE_URL}/accounts:update?key={_get_api_key()}"
  payload = {
    "idToken": id_token,
    "password": new_password,
    "returnSecureToken": True,
  }
  return _post_json(url, payload)


def reset_password_with_oob_code(
  oob_code: str, new_password: str
) -> dict[str, Any]:
  url = f"{IDENTITY_BASE_URL}/accounts:resetPassword?key={_get_api_key()}"
  payload = {"oobCode": oob_code, "newPassword": new_password}
  return _post_json(url, payload)


def refresh_id_token(refresh_token: str) -> dict[str, Any]:
  url = f"{SECURE_TOKEN_URL}/token?key={_get_api_key()}"
  payload = {"grant_type": "refresh_token", "refresh_token": refresh_token}
  return _post_json(url, payload)
