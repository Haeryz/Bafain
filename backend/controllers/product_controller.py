from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, status
from google.cloud.firestore_v1 import Client

from models.product import ProductCreateRequest, ProductUpdateRequest


def _doc_to_dict(doc) -> dict:
  data = doc.to_dict() or {}
  data["id"] = doc.id
  return data


def _get_subcollection(firestore: Client, product_id: str, name: str) -> list[dict]:
  docs = (
    firestore.collection("products")
    .document(product_id)
    .collection(name)
    .order_by("sort_order")
    .stream()
  )
  return [_doc_to_dict(doc) for doc in docs]


def _set_subcollection(
  firestore: Client, product_id: str, name: str, items: list[dict]
):
  coll_ref = firestore.collection("products").document(product_id).collection(name)
  existing = list(coll_ref.stream())
  for doc in existing:
    doc.reference.delete()
  for item in items:
    item_id = item.get("id") or uuid4().hex
    item_data = {**item, "product_id": product_id}
    item_data.pop("id", None)
    coll_ref.document(item_id).set(item_data)


def _build_product_response(firestore: Client, product_id: str, data: dict) -> dict:
  return {
    **data,
    "id": product_id,
    "product_images": _get_subcollection(firestore, product_id, "product_images"),
    "product_features": _get_subcollection(firestore, product_id, "product_features"),
    "product_specs": _get_subcollection(firestore, product_id, "product_specs"),
    "product_benefits": _get_subcollection(firestore, product_id, "product_benefits"),
    "product_gallery": _get_subcollection(firestore, product_id, "product_gallery"),
  }


def list_products(
  firestore: Client,
  limit: int,
  offset: int,
  query_text: str | None = None,
  min_price: int | None = None,
  max_price: int | None = None,
  feature: str | None = None,
  spec_key: str | None = None,
  spec_value: str | None = None,
):
  query = firestore.collection("products")

  if min_price is not None:
    query = query.where("price_idr", ">=", min_price)

  if max_price is not None:
    query = query.where("price_idr", "<=", max_price)

  if min_price is not None or max_price is not None:
    query = query.order_by("price_idr")
  else:
    query = query.order_by("created_at", direction="DESCENDING")

  docs = list(query.stream())

  results = []
  for doc in docs:
    data = _doc_to_dict(doc)

    if query_text:
      search_text = query_text.lower()
      title = (data.get("title") or "").lower()
      description = (data.get("description") or "").lower()
      if search_text not in title and search_text not in description:
        continue

    product = _build_product_response(firestore, doc.id, data)

    if feature:
      feature_lower = feature.lower()
      features = [
        (f.get("feature") or "").lower() for f in product["product_features"]
      ]
      if not any(feature_lower in f for f in features):
        continue

    if spec_key:
      spec_key_lower = spec_key.lower()
      specs = [
        (s.get("spec_key") or "").lower() for s in product["product_specs"]
      ]
      if not any(spec_key_lower in s for s in specs):
        continue

    if spec_value:
      spec_value_lower = spec_value.lower()
      specs = [
        (s.get("spec_value") or "").lower() for s in product["product_specs"]
      ]
      if not any(spec_value_lower in s for s in specs):
        continue

    results.append(product)

  return results[offset : offset + limit]


def get_product(firestore: Client, product_id: str):
  doc = firestore.collection("products").document(product_id).get()
  if not doc.exists:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
  data = _doc_to_dict(doc)
  return _build_product_response(firestore, product_id, data)


def create_product(firestore: Client, payload: ProductCreateRequest):
  product_id = uuid4().hex
  product_data = {
    "title": payload.title,
    "price_idr": payload.price_idr,
    "price_unit": payload.price_unit,
    "description": payload.description,
    "image_url": payload.image_url,
    "created_at": datetime.utcnow(),
  }
  firestore.collection("products").document(product_id).set(product_data)

  if payload.images:
    _set_subcollection(
      firestore, product_id, "product_images",
      [img.model_dump() for img in payload.images]
    )

  if payload.features:
    _set_subcollection(
      firestore, product_id, "product_features",
      [f.model_dump() for f in payload.features]
    )

  if payload.specs:
    _set_subcollection(
      firestore, product_id, "product_specs",
      [s.model_dump() for s in payload.specs]
    )

  if payload.benefits:
    _set_subcollection(
      firestore, product_id, "product_benefits",
      [b.model_dump() for b in payload.benefits]
    )

  if payload.gallery:
    _set_subcollection(
      firestore, product_id, "product_gallery",
      [g.model_dump() for g in payload.gallery]
    )

  return get_product(firestore, product_id)


def update_product(firestore: Client, product_id: str, payload: ProductUpdateRequest):
  doc_ref = firestore.collection("products").document(product_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

  update_data = {
    k: v for k, v in {
      "title": payload.title,
      "price_idr": payload.price_idr,
      "price_unit": payload.price_unit,
      "description": payload.description,
      "image_url": payload.image_url,
    }.items() if v is not None
  }

  if update_data:
    doc_ref.update(update_data)

  if payload.images is not None:
    _set_subcollection(
      firestore, product_id, "product_images",
      [img.model_dump() for img in payload.images]
    )

  if payload.features is not None:
    _set_subcollection(
      firestore, product_id, "product_features",
      [f.model_dump() for f in payload.features]
    )

  if payload.specs is not None:
    _set_subcollection(
      firestore, product_id, "product_specs",
      [s.model_dump() for s in payload.specs]
    )

  if payload.benefits is not None:
    _set_subcollection(
      firestore, product_id, "product_benefits",
      [b.model_dump() for b in payload.benefits]
    )

  if payload.gallery is not None:
    _set_subcollection(
      firestore, product_id, "product_gallery",
      [g.model_dump() for g in payload.gallery]
    )

  return get_product(firestore, product_id)


def delete_product(firestore: Client, product_id: str):
  doc_ref = firestore.collection("products").document(product_id)
  doc = doc_ref.get()
  if not doc.exists:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

  for coll_name in ["product_images", "product_features", "product_specs", "product_benefits", "product_gallery"]:
    for sub_doc in doc_ref.collection(coll_name).stream():
      sub_doc.reference.delete()

  doc_ref.delete()
  return {"message": "Product deleted"}
