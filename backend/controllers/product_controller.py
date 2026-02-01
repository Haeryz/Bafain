from fastapi import HTTPException, status
from supabase import Client

from models.product import ProductCreateRequest, ProductUpdateRequest


def _handle_response(response, not_found_message: str | None = None):
  if hasattr(response, "error") and response.error:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail=str(response.error),
    )

  data = getattr(response, "data", None)
  if not data and not_found_message:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=not_found_message)

  return data


def list_products(
  supabase: Client,
  limit: int,
  offset: int,
  query_text: str | None = None,
  min_price: int | None = None,
  max_price: int | None = None,
  feature: str | None = None,
  spec_key: str | None = None,
  spec_value: str | None = None,
):
  feature_select = "product_features!inner(*)" if feature else "product_features(*)"
  spec_select = (
    "product_specs!inner(*)" if spec_key or spec_value else "product_specs(*)"
  )

  query = (
    supabase.table("products")
    .select(f"*, product_images(*), {feature_select}, {spec_select}")
    .order("created_at", desc=True)
    .order("sort_order", foreign_table="product_images")
    .order("sort_order", foreign_table="product_features")
    .order("sort_order", foreign_table="product_specs")
  )

  if query_text:
    safe_query = query_text.replace(",", " ").strip()
    if safe_query:
      query = query.or_(
        f"title.ilike.%{safe_query}%,description.ilike.%{safe_query}%"
      )

  if min_price is not None:
    query = query.gte("price_idr", min_price)

  if max_price is not None:
    query = query.lte("price_idr", max_price)

  if feature:
    query = query.ilike("product_features.feature", f"%{feature}%")

  if spec_key:
    query = query.ilike("product_specs.spec_key", f"%{spec_key}%")

  if spec_value:
    query = query.ilike("product_specs.spec_value", f"%{spec_value}%")

  query = query.range(offset, offset + limit - 1)

  return _handle_response(query.execute()) or []


def get_product(supabase: Client, product_id: str):
  query = (
    supabase.table("products")
    .select("*, product_images(*), product_features(*), product_specs(*)")
    .eq("id", product_id)
    .single()
  )
  return _handle_response(query.execute(), "Product not found")


def create_product(supabase: Client, payload: ProductCreateRequest):
  product_payload = {
    "title": payload.title,
    "price_idr": payload.price_idr,
    "price_unit": payload.price_unit,
    "description": payload.description,
    "image_url": payload.image_url,
  }
  product_response = (
    supabase.table("products").insert(product_payload).execute()
  )
  product = _handle_response(product_response)
  if not product:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Failed to create product",
    )

  product_id = product[0]["id"]

  if payload.images:
    images_payload = [
      {**image.model_dump(), "product_id": product_id}
      for image in payload.images
    ]
    _handle_response(supabase.table("product_images").insert(images_payload).execute())

  if payload.features:
    features_payload = [
      {**feature.model_dump(), "product_id": product_id}
      for feature in payload.features
    ]
    _handle_response(
      supabase.table("product_features").insert(features_payload).execute()
    )

  if payload.specs:
    specs_payload = [
      {**spec.model_dump(), "product_id": product_id} for spec in payload.specs
    ]
    _handle_response(
      supabase.table("product_specs").insert(specs_payload).execute()
    )

  return get_product(supabase, product_id)


def update_product(
  supabase: Client, product_id: str, payload: ProductUpdateRequest
):
  update_payload = {
    key: value
    for key, value in {
      "title": payload.title,
      "price_idr": payload.price_idr,
      "price_unit": payload.price_unit,
      "description": payload.description,
      "image_url": payload.image_url,
    }.items()
    if value is not None
  }

  if update_payload:
    _handle_response(
      supabase.table("products").update(update_payload).eq("id", product_id).execute(),
      "Product not found",
    )

  if payload.images is not None:
    supabase.table("product_images").delete().eq("product_id", product_id).execute()
    if payload.images:
      images_payload = [
        {**image.model_dump(), "product_id": product_id}
        for image in payload.images
      ]
      _handle_response(
        supabase.table("product_images").insert(images_payload).execute()
      )

  if payload.features is not None:
    supabase.table("product_features").delete().eq("product_id", product_id).execute()
    if payload.features:
      features_payload = [
        {**feature.model_dump(), "product_id": product_id}
        for feature in payload.features
      ]
      _handle_response(
        supabase.table("product_features").insert(features_payload).execute()
      )

  if payload.specs is not None:
    supabase.table("product_specs").delete().eq("product_id", product_id).execute()
    if payload.specs:
      specs_payload = [
        {**spec.model_dump(), "product_id": product_id} for spec in payload.specs
      ]
      _handle_response(
        supabase.table("product_specs").insert(specs_payload).execute()
      )

  return get_product(supabase, product_id)


def delete_product(supabase: Client, product_id: str):
  response = supabase.table("products").delete().eq("id", product_id).execute()
  data = _handle_response(response)
  if not data:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
  return {"message": "Product deleted"}
