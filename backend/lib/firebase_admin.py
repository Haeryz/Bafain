import json
import os

import firebase_admin
from firebase_admin import credentials


def init_firebase() -> None:
  if firebase_admin._apps:
    return

  creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
  creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

  if creds_json:
    try:
      payload = json.loads(creds_json)
    except json.JSONDecodeError as exc:
      raise RuntimeError(
        "FIREBASE_CREDENTIALS_JSON must be valid JSON."
      ) from exc
    cred = credentials.Certificate(payload)
  elif creds_path:
    cred = credentials.Certificate(creds_path)
  else:
    raise RuntimeError(
      "Firebase admin credentials missing. Set FIREBASE_CREDENTIALS_JSON or FIREBASE_CREDENTIALS_PATH."
    )

  firebase_admin.initialize_app(cred)
