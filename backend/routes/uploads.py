from fastapi import APIRouter, Depends

from controllers.upload_controller import create_signed_upload
from lib.supabase_client import get_supabase_client
from models.upload import SignedUploadRequest, SignedUploadResponse

router = APIRouter()


@router.post("/sign", response_model=SignedUploadResponse)
def create_signed_upload_route(
  payload: SignedUploadRequest, supabase=Depends(get_supabase_client)
):
  return create_signed_upload(payload, supabase)
