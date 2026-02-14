from fastapi import APIRouter, Depends, Query

from controllers.product_controller import (
  create_product,
  delete_product,
  get_product,
  list_products,
  update_product,
)
from lib.auth_dependency import require_access_token
from lib.firestore_client import get_firestore_client
from models.product import ProductCreateRequest, ProductResponse, ProductUpdateRequest

router = APIRouter()


@router.get("", response_model=list[ProductResponse])
def list_products_route(
  firestore=Depends(get_firestore_client),
  limit: int = Query(50, ge=1, le=200),
  offset: int = Query(0, ge=0),
  q: str | None = None,
  min_price: int | None = Query(default=None, ge=0),
  max_price: int | None = Query(default=None, ge=0),
  feature: str | None = None,
  spec_key: str | None = None,
  spec_value: str | None = None,
):
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
def get_product_route(product_id: str, firestore=Depends(get_firestore_client)):
  return get_product(firestore, product_id)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product_route(
  payload: ProductCreateRequest,
  _access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return create_product(firestore, payload)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product_route(
  product_id: str,
  payload: ProductUpdateRequest,
  _access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return update_product(firestore, product_id, payload)


@router.delete("/{product_id}")
def delete_product_route(
  product_id: str,
  _access_token: str = Depends(require_access_token),
  firestore=Depends(get_firestore_client),
):
  return delete_product(firestore, product_id)
