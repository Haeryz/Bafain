from fastapi import APIRouter, Depends, Header

from controllers.admin_auth_controller import get_admin_session
from controllers.admin_dashboard_controller import get_admin_dashboard
from lib.firebase_auth import extract_access_token
from lib.firestore_client import get_firestore_client
from models.admin import AdminDashboardResponse, AdminSessionResponse

router = APIRouter(prefix="/api/v1/admin")


@router.get("/session", response_model=AdminSessionResponse)
def admin_session_route(
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  return get_admin_session(access_token, firestore)


@router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard_route(
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  return get_admin_dashboard(access_token, firestore)
