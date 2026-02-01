from typing import Any

from pydantic import BaseModel, Field


class AuthRegisterRequest(BaseModel):
  email: str = Field(min_length=3, max_length=320)
  password: str = Field(min_length=8, max_length=1000)


class AuthLoginRequest(BaseModel):
  email: str = Field(min_length=3, max_length=320)
  password: str = Field(min_length=1, max_length=1000)


class AuthForgotPasswordRequest(BaseModel):
  email: str = Field(min_length=3, max_length=320)


class AuthResetPasswordRequest(BaseModel):
  access_token: str = Field(min_length=10)
  refresh_token: str = Field(min_length=10)
  new_password: str = Field(min_length=8, max_length=1000)


class AuthSessionResponse(BaseModel):
  user: dict[str, Any] | None = None
  session: dict[str, Any] | None = None


class AuthRegisterResponse(AuthSessionResponse):
  message: str


class MessageResponse(BaseModel):
  message: str
