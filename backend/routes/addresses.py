from fastapi import APIRouter, Depends

from controllers.address_controller import (
  create_address,
  delete_address,
  list_addresses,
  set_default_address,
  update_address,
)
from lib.auth_dependency import require_access_token
from lib.firestore_client import get_firestore_client
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
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return list_addresses(access_token, firestore)


@router.post("", response_model=AddressResponse, status_code=201)
def create_address_route(
  payload: AddressCreateRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return create_address(access_token, payload, firestore)


@router.patch("/{address_id}", response_model=AddressResponse)
def update_address_route(
  address_id: str,
  payload: AddressUpdateRequest,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return update_address(access_token, address_id, payload, firestore)


@router.delete("/{address_id}", response_model=AddressDeleteResponse)
def delete_address_route(
  address_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return delete_address(access_token, address_id, firestore)


@router.post("/{address_id}/set-default", response_model=AddressDefaultResponse)
def set_default_address_route(
  address_id: str,
  access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return set_default_address(access_token, address_id, firestore)
