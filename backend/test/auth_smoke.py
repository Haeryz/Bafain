import json
import os
import time
import urllib.request
from typing import Any

from dotenv import load_dotenv

load_dotenv()


def _post(url: str, payload: dict[str, Any]) -> tuple[int, dict[str, Any] | None]:
  data = json.dumps(payload).encode("utf-8")
  request = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST",
  )
  try:
    with urllib.request.urlopen(request) as response:
      status = response.getcode()
      body = response.read().decode("utf-8")
  except urllib.error.HTTPError as exc:
    status = exc.code
    body = exc.read().decode("utf-8")

  try:
    return status, json.loads(body) if body else None
  except json.JSONDecodeError:
    return status, {"raw": body}


def _print_result(label: str, status: int, body: dict[str, Any] | None) -> None:
  print(f"\n{label}")
  print(f"Status: {status}")
  print("Body:")
  print(json.dumps(body or {}, indent=2))


def _resolve_base_email() -> str | None:
  base_email = os.getenv("BASE_EMAIL")
  if base_email:
    return base_email
  domain = os.getenv("TEST_EMAIL_DOMAIN")
  if domain:
    return f"test@{domain}"
  allow_fake = os.getenv("ALLOW_FAKE_EMAIL_DOMAIN", "true").lower() in (
    "1",
    "true",
    "yes",
  )
  if allow_fake:
    return "test@example.com"
  return None


def _unique_email(prefix: str) -> str:
  base_email = _resolve_base_email()
  if not base_email:
    raise RuntimeError(
      "Set BASE_EMAIL or TEST_EMAIL_DOMAIN, or enable ALLOW_FAKE_EMAIL_DOMAIN to use example.com."
    )
  local, _, domain = base_email.partition("@")
  suffix = f"{int(time.time())}-{os.getpid()}"
  return f"{local}+{prefix}-{suffix}@{domain}"


def _unique_password(prefix: str) -> str:
  return f"{prefix}!{int(time.time())}X9"


def _resolve_email(
  env_name: str, prefix: str, allow_auto: bool
) -> str | None:
  explicit = os.getenv(env_name)
  if explicit:
    return explicit
  if allow_auto:
    return _unique_email(prefix)
  return None


def main() -> None:
  base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
  allow_auto_email = os.getenv("ALLOW_AUTO_EMAIL", "true").lower() in (
    "1",
    "true",
    "yes",
  )

  register_email = _resolve_email("REGISTER_EMAIL", "register", allow_auto_email)
  register_password = os.getenv("REGISTER_PASSWORD") or _unique_password("Register")

  login_email = _resolve_email("LOGIN_EMAIL", "login", allow_auto_email)
  login_password = os.getenv("LOGIN_PASSWORD") or _unique_password("Login")

  if register_email:
    register_status, register_body = _post(
      f"{base_url}/auth/register",
      {"email": register_email, "password": register_password},
    )
    _print_result("Register (user 1)", register_status, register_body)
  else:
    print("\nRegister (user 1)")
    print("Skipped (set REGISTER_EMAIL or BASE_EMAIL/TEST_EMAIL_DOMAIN).")

  if login_email:
    login_register_status, login_register_body = _post(
      f"{base_url}/auth/register",
      {"email": login_email, "password": login_password},
    )
    _print_result(
      "Register (user 2 for login)", login_register_status, login_register_body
    )

    login_status, login_body = _post(
      f"{base_url}/auth/login",
      {"email": login_email, "password": login_password},
    )
    _print_result("Login (user 2)", login_status, login_body)
  else:
    print("\nRegister (user 2 for login)")
    print("Skipped (set LOGIN_EMAIL or BASE_EMAIL/TEST_EMAIL_DOMAIN).")
    print("\nLogin (user 2)")
    print("Skipped (missing LOGIN_EMAIL/LOGIN_PASSWORD).")

  run_forgot = os.getenv("RUN_FORGOT_PASSWORD", "false").lower() in ("1", "true", "yes")
  if run_forgot:
    forgot_email = _resolve_email("FORGOT_EMAIL", "forgot", allow_auto_email)
    forgot_password = os.getenv("FORGOT_PASSWORD") or _unique_password("Forgot")
    if not forgot_email:
      print("\nRegister (user 3 for forgot-password)")
      print("Skipped (set FORGOT_EMAIL or BASE_EMAIL/TEST_EMAIL_DOMAIN).")
      print("\nForgot Password")
      print("Skipped (missing FORGOT_EMAIL).")
      return

    forgot_register_status, forgot_register_body = _post(
      f"{base_url}/auth/register",
      {"email": forgot_email, "password": forgot_password},
    )
    _print_result(
      "Register (user 3 for forgot-password)",
      forgot_register_status,
      forgot_register_body,
    )

    forgot_status, forgot_body = _post(
      f"{base_url}/auth/forgot-password",
      {"email": forgot_email},
    )
    _print_result("Forgot Password (user 3)", forgot_status, forgot_body)
  else:
    print("\nForgot Password")
    print("Skipped (set RUN_FORGOT_PASSWORD=true to enable).")

  access_token = os.getenv("RESET_ACCESS_TOKEN")
  refresh_token = os.getenv("RESET_REFRESH_TOKEN")
  new_password = os.getenv("RESET_NEW_PASSWORD")
  if access_token and refresh_token and new_password:
    reset_status, reset_body = _post(
      f"{base_url}/auth/reset-password",
      {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "new_password": new_password,
      },
    )
    _print_result("Reset Password", reset_status, reset_body)
  else:
    print("\nReset Password")
    print("Skipped (set RESET_ACCESS_TOKEN, RESET_REFRESH_TOKEN, RESET_NEW_PASSWORD).")


if __name__ == "__main__":
  main()
