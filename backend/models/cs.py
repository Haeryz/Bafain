from typing import Literal

from pydantic import BaseModel, Field


class CsChatMessage(BaseModel):
  role: Literal["user", "assistant"]
  content: str = Field(min_length=1, max_length=2000)


class CsChatRequest(BaseModel):
  messages: list[CsChatMessage] = Field(min_length=1, max_length=20)


class CsUsage(BaseModel):
  prompt_tokens: int = 0
  completion_tokens: int = 0
  total_tokens: int = 0


class CsChatResponse(BaseModel):
  message: str
  model: str
  usage: CsUsage | None = None

