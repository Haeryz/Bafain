from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductImageInput(BaseModel):
  image_url: str = Field(min_length=1, max_length=2000)
  sort_order: int = 0


class ProductFeatureInput(BaseModel):
  feature: str = Field(min_length=1, max_length=1000)
  sort_order: int = 0


class ProductSpecInput(BaseModel):
  spec_key: str = Field(min_length=1, max_length=200)
  spec_value: Optional[str] = None
  spec_qty: Optional[int] = Field(default=None, ge=0)
  spec_unit: Optional[str] = Field(default=None, max_length=50)
  sort_order: int = 0


class ProductCreateRequest(BaseModel):
  title: str = Field(min_length=1, max_length=300)
  price_idr: int = Field(ge=0)
  price_unit: Optional[str] = Field(default=None, max_length=50)
  description: Optional[str] = None
  image_url: Optional[str] = None
  images: list[ProductImageInput] = []
  features: list[ProductFeatureInput] = []
  specs: list[ProductSpecInput] = []


class ProductUpdateRequest(BaseModel):
  title: Optional[str] = Field(default=None, min_length=1, max_length=300)
  price_idr: Optional[int] = Field(default=None, ge=0)
  price_unit: Optional[str] = Field(default=None, max_length=50)
  description: Optional[str] = None
  image_url: Optional[str] = None
  images: Optional[list[ProductImageInput]] = None
  features: Optional[list[ProductFeatureInput]] = None
  specs: Optional[list[ProductSpecInput]] = None


class ProductImage(BaseModel):
  id: str
  product_id: str
  image_url: str
  sort_order: int
  created_at: Optional[datetime] = None


class ProductFeature(BaseModel):
  id: str
  product_id: str
  feature: str
  sort_order: int


class ProductSpec(BaseModel):
  id: str
  product_id: str
  spec_key: str
  spec_value: Optional[str] = None
  spec_qty: Optional[int] = None
  spec_unit: Optional[str] = None
  sort_order: int


class ProductResponse(BaseModel):
  id: str
  title: str
  price_idr: int
  price_unit: Optional[str] = None
  description: Optional[str] = None
  image_url: Optional[str] = None
  created_at: Optional[datetime] = None
  product_images: list[ProductImage] = []
  product_features: list[ProductFeature] = []
  product_specs: list[ProductSpec] = []
