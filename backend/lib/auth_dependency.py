from fastapi import Header

from lib.firebase_auth import extract_access_token, verify_access_token


def require_access_token(
  authorization: str | None = Header(default=None),
) -> str:
  access_token = extract_access_token(authorization)
  verify_access_token(access_token)
  return access_token
