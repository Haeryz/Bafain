from fastapi import APIRouter, Depends

from controllers.upload_controller import create_signed_upload
from lib.auth_dependency import require_access_token
from models.upload import SignedUploadRequest, SignedUploadResponse

router = APIRouter()


@router.post("/sign", response_model=SignedUploadResponse)
def create_signed_upload_route(
  payload: SignedUploadRequest,
  _access_token: str = Depends(require_access_token),
):
  return create_signed_upload(payload)
