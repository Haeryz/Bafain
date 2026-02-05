from firebase_admin import firestore
from google.cloud.firestore_v1 import Client

from lib.firebase_admin import init_firebase


def get_firestore_client() -> Client:
  init_firebase()
  return firestore.client()
