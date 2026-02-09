from fastapi import APIRouter, Header

from controllers.cs_controller import cs_chat
from lib.firebase_auth import extract_access_token
from models.cs import CsChatRequest, CsChatResponse

router = APIRouter(prefix="/cs")


@router.post("/chat", response_model=CsChatResponse)
def cs_chat_route(
  payload: CsChatRequest,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  return cs_chat(access_token, payload)

