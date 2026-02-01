from fastapi import APIRouter, Depends, Header

from controllers.address_controller import (
  create_address,
  delete_address,
  extract_access_token,
  list_addresses,
  set_default_address,
  update_address,
)
from lib.supabase_client import get_supabase_client
from models.address import (
  AddressCreateRequest,
  AddressDefaultResponse,
  AddressDeleteResponse,
  AddressListResponse,
  AddressResponse,
  AddressUpdateRequest,
)

router = APIRouter(prefix="/api/v1/me/addresses")


@router.get("", response_model=AddressListResponse)
def get_addresses(
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return list_addresses(access_token, supabase)


@router.post("", response_model=AddressResponse, status_code=201)
def create_address_route(
  payload: AddressCreateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return create_address(access_token, payload, supabase)


@router.patch("/{address_id}", response_model=AddressResponse)
def update_address_route(
  address_id: str,
  payload: AddressUpdateRequest,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return update_address(access_token, address_id, payload, supabase)


@router.delete("/{address_id}", response_model=AddressDeleteResponse)
def delete_address_route(
  address_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return delete_address(access_token, address_id, supabase)


@router.post("/{address_id}/set-default", response_model=AddressDefaultResponse)
def set_default_address_route(
  address_id: str,
  authorization: str | None = Header(default=None),
  supabase=Depends(get_supabase_client),
):
  access_token = extract_access_token(authorization)
  return set_default_address(access_token, address_id, supabase)
