from fastapi import APIRouter, Depends

from controllers.cs_controller import cs_chat
from lib.auth_dependency import require_access_token
from models.cs import CsChatRequest, CsChatResponse

router = APIRouter(prefix="/cs")


@router.post("/chat", response_model=CsChatResponse)
def cs_chat_route(
  payload: CsChatRequest,
  access_token: str = Depends(require_access_token),
):
  return cs_chat(access_token, payload)

