"""
商品 Pydantic 数据结构
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=120)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductImageCreate(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    sort_order: int = 0


class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    alt_text: Optional[str] = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str = Field(..., max_length=300)
    slug: str = Field(..., max_length=350)
    description: Optional[str] = None
    main_image_url: Optional[str] = None
    category_id: Optional[int] = None
    base_price: float = Field(..., ge=0)
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0


class ProductCreate(ProductBase):
    images: Optional[list[ProductImageCreate]] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    main_image_url: Optional[str] = None
    category_id: Optional[int] = None
    base_price: Optional[float] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None
    images: Optional[list[ProductImageCreate]] = None


class ProductListResponse(BaseModel):
    id: int
    name: str
    slug: str
    main_image_url: Optional[str] = None
    base_price: float
    is_active: bool
    is_featured: bool
    category_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductDetailResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    images: list[ProductImageResponse] = []
    category: Optional[CategoryResponse] = None

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
