import argparse
from datetime import datetime, timezone
import os

from firebase_admin import auth as firebase_auth
from firebase_admin import firestore

from lib.admin_access import ADMIN_ROLES
from lib.firebase_admin import init_firebase


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    description="Create or update an admin user document in Firestore.",
  )
  parser.add_argument("--uid", required=True, help="Firebase auth user uid.")
  parser.add_argument("--email", default="", help="Admin email for metadata.")
  parser.add_argument(
    "--role",
    required=True,
    choices=sorted(ADMIN_ROLES),
    help="Admin role.",
  )
  parser.add_argument(
    "--display-name",
    default="",
    help="Human-readable admin name.",
  )
  parser.add_argument(
    "--inactive",
    action="store_true",
    help="Mark admin account as inactive.",
  )
  parser.add_argument(
    "--set-claim",
    action="store_true",
    help="Also set Firebase custom claim `role` and `is_admin`.",
  )
  return parser.parse_args()


def get_admin_users_collection() -> str:
  return os.getenv("FIRESTORE_ADMIN_USERS_COLLECTION") or "admin_users"


def upsert_admin_doc(
  uid: str,
  email: str,
  role: str,
  display_name: str,
  active: bool,
):
  init_firebase()
  db = firestore.client()
  doc_ref = db.collection(get_admin_users_collection()).document(uid)
  snapshot = doc_ref.get()
  now = datetime.now(timezone.utc)
  payload = {
    "uid": uid,
    "email": email,
    "display_name": display_name,
    "role": role,
    "active": active,
    "updated_at": now,
  }
  if not snapshot.exists:
    payload["created_at"] = now
  doc_ref.set(payload, merge=True)


def set_custom_claim(uid: str, role: str):
  init_firebase()
  user = firebase_auth.get_user(uid)
  existing_claims = user.custom_claims or {}
  merged_claims = {
    **existing_claims,
    "role": role,
    "is_admin": True,
  }
  firebase_auth.set_custom_user_claims(uid, merged_claims)


def main():
  args = parse_args()
  is_active = not args.inactive
  upsert_admin_doc(
    uid=args.uid,
    email=args.email,
    role=args.role,
    display_name=args.display_name,
    active=is_active,
  )

  if args.set_claim:
    set_custom_claim(args.uid, args.role)
    print("Admin document updated and custom claims set.")
    return

  print("Admin document updated.")


if __name__ == "__main__":
  main()
