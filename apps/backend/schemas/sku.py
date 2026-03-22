"""
SKU Pydantic 数据结构
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AttributeValueBase(BaseModel):
    value: str = Field(..., max_length=100)
    sort_order: int = 0


class AttributeValueCreate(AttributeValueBase):
    pass


class AttributeValueResponse(AttributeValueBase):
    id: int
    attribute_id: int

    model_config = {"from_attributes": True}


class ProductAttributeBase(BaseModel):
    name: str = Field(..., max_length=100)
    sort_order: int = 0


class ProductAttributeCreate(ProductAttributeBase):
    values: list[AttributeValueCreate] = []


class ProductAttributeResponse(ProductAttributeBase):
    id: int
    product_id: int
    values: list[AttributeValueResponse] = []

    model_config = {"from_attributes": True}


class SKUBase(BaseModel):
    sku_code: str = Field(..., max_length=100)
    price: float = Field(..., ge=0)
    stock: int = Field(0, ge=0)
    image_url: Optional[str] = None
    is_active: bool = True


class SKUCreate(SKUBase):
    attribute_value_ids: list[int] = []


class SKUUpdate(BaseModel):
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class SKUResponse(SKUBase):
    id: int
    product_id: int
    created_at: datetime
    attribute_values: list[AttributeValueResponse] = []

    model_config = {"from_attributes": True}
