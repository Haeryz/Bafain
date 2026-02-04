from fastapi import APIRouter

from controllers.upload_controller import create_signed_upload
from models.upload import SignedUploadRequest, SignedUploadResponse

router = APIRouter()


@router.post("/sign", response_model=SignedUploadResponse)
def create_signed_upload_route(
  payload: SignedUploadRequest,
):
  return create_signed_upload(payload)
