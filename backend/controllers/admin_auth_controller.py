from google.cloud.firestore_v1 import Client

from lib.admin_access import ADMIN_READ_ROLES, require_admin_access
from models.admin import AdminSessionResponse


def get_admin_session(access_token: str, firestore: Client) -> AdminSessionResponse:
  admin_identity = require_admin_access(access_token, firestore, ADMIN_READ_ROLES)
  return {
    "admin": {
      "uid": admin_identity["uid"],
      "role": admin_identity["role"],
      "email": admin_identity["email"],
      "display_name": admin_identity["display_name"],
    }
  }
