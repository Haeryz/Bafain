import os
import re
import uuid
from datetime import timedelta

from fastapi import HTTPException, status
from firebase_admin import storage

from lib.firebase_admin import init_firebase

from models.upload import SignedUploadRequest


def _slug_filename(filename: str) -> str:
  clean = re.sub(r"[^\w\-.]+", "_", filename.strip())
  return clean or f"file_{uuid.uuid4().hex}"


def _get_bucket() -> str:
  bucket = os.getenv("FIREBASE_STORAGE_BUCKET") or os.getenv("GCS_BUCKET")
  if not bucket:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Storage bucket not configured",
    )
  return bucket


def create_signed_upload(payload: SignedUploadRequest):
  bucket_name = _get_bucket()
  init_firebase()
  filename = _slug_filename(payload.filename)
  folder = payload.folder.strip("/ ")

  if payload.product_id:
    path = f"{folder}/{payload.product_id}/{uuid.uuid4().hex}_{filename}"
  else:
    path = f"{folder}/{uuid.uuid4().hex}_{filename}"

  bucket = storage.bucket(bucket_name)
  blob = bucket.blob(path)
  if not payload.upsert and blob.exists():
    raise HTTPException(
      status_code=status.HTTP_409_CONFLICT,
      detail="File already exists",
    )

  ttl_minutes = int(os.getenv("FIREBASE_SIGNED_URL_TTL_MINUTES", "15"))
  signed_url = blob.generate_signed_url(
    expiration=timedelta(minutes=ttl_minutes),
    method="PUT",
  )

  return {
    "bucket": bucket_name,
    "path": path,
    "signed_url": signed_url,
    "token": None,
    "public_url": blob.public_url,
  }
