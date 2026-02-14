from fastapi import APIRouter, Depends, Header, Query

from controllers.product_controller import (
  create_product,
  delete_product,
  get_product,
  list_products,
  update_product,
)
from lib.admin_access import ADMIN_PRODUCT_WRITE_ROLES, ADMIN_READ_ROLES, require_admin_access
from lib.firebase_auth import extract_access_token
from lib.firestore_client import get_firestore_client
from models.product import ProductCreateRequest, ProductResponse, ProductUpdateRequest

router = APIRouter(prefix="/api/v1/admin/products")


@router.get("", response_model=list[ProductResponse])
def admin_list_products_route(
  firestore=Depends(get_firestore_client),
  limit: int = Query(50, ge=1, le=200),
  offset: int = Query(0, ge=0),
  q: str | None = None,
  min_price: int | None = Query(default=None, ge=0),
  max_price: int | None = Query(default=None, ge=0),
  feature: str | None = None,
  spec_key: str | None = None,
  spec_value: str | None = None,
  authorization: str | None = Header(default=None),
):
  access_token = extract_access_token(authorization)
  require_admin_access(access_token, firestore, ADMIN_READ_ROLES)
  return list_products(
    firestore,
    limit,
    offset,
    query_text=q,
    min_price=min_price,
    max_price=max_price,
    feature=feature,
    spec_key=spec_key,
    spec_value=spec_value,
  )


@router.get("/{product_id}", response_model=ProductResponse)
def admin_get_product_route(
  product_id: str,
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  require_admin_access(access_token, firestore, ADMIN_READ_ROLES)
  return get_product(firestore, product_id)


@router.post("", response_model=ProductResponse, status_code=201)
def admin_create_product_route(
  payload: ProductCreateRequest,
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  require_admin_access(access_token, firestore, ADMIN_PRODUCT_WRITE_ROLES)
  return create_product(firestore, payload)


@router.put("/{product_id}", response_model=ProductResponse)
def admin_update_product_route(
  product_id: str,
  payload: ProductUpdateRequest,
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  require_admin_access(access_token, firestore, ADMIN_PRODUCT_WRITE_ROLES)
  return update_product(firestore, product_id, payload)


@router.delete("/{product_id}")
def admin_delete_product_route(
  product_id: str,
  authorization: str | None = Header(default=None),
  firestore=Depends(get_firestore_client),
):
  access_token = extract_access_token(authorization)
  require_admin_access(access_token, firestore, ADMIN_PRODUCT_WRITE_ROLES)
  return delete_product(firestore, product_id)
