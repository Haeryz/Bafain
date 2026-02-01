import os
import re
import uuid
from typing import Any

from fastapi import HTTPException, status
from supabase import Client

from models.upload import SignedUploadRequest


def _slug_filename(filename: str) -> str:
  clean = re.sub(r"[^\w\-.]+", "_", filename.strip())
  return clean or f"file_{uuid.uuid4().hex}"


def _extract_data(response: Any) -> dict:
  if response is None:
    return {}
  if isinstance(response, dict):
    return response.get("data", response)
  data = getattr(response, "data", None)
  if isinstance(data, dict):
    return data
  return {}


def _raise_if_error(response: Any):
  error = getattr(response, "error", None)
  if error:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=str(error),
    )


def _get_bucket() -> str:
  bucket = os.getenv("SUPABASE_STORAGE_BUCKET") or os.getenv(
    "NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET"
  )
  if not bucket:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Storage bucket not configured",
    )
  return bucket


def create_signed_upload(payload: SignedUploadRequest, supabase: Client):
  bucket = _get_bucket()
  filename = _slug_filename(payload.filename)
  folder = payload.folder.strip("/ ")

  if payload.product_id:
    path = f"{folder}/{payload.product_id}/{uuid.uuid4().hex}_{filename}"
  else:
    path = f"{folder}/{uuid.uuid4().hex}_{filename}"

  options = {"upsert": "true"} if payload.upsert else None
  response = supabase.storage.from_(bucket).create_signed_upload_url(
    path, options=options
  )
  _raise_if_error(response)

  data = _extract_data(response)
  signed_url = (
    data.get("signedUrl")
    or data.get("signed_url")
    or data.get("signedURL")
  )
  token = data.get("token")

  public_url = None
  public_response = supabase.storage.from_(bucket).get_public_url(path)
  public_data = _extract_data(public_response)
  public_url = (
    public_data.get("publicUrl")
    or public_data.get("public_url")
    or public_data.get("publicURL")
  )

  return {
    "bucket": bucket,
    "path": path,
    "signed_url": signed_url,
    "token": token,
    "public_url": public_url,
  }
