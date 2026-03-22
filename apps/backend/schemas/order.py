"""
订单 Pydantic 数据结构
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from models.order import OrderStatus


class OrderItemCreate(BaseModel):
    sku_id: int
    quantity: int = Field(..., ge=1)


class OrderItemResponse(BaseModel):
    id: int
    sku_id: int
    product_name: str
    sku_name: Optional[str] = None
    price: float
    quantity: int

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_name: str = Field(..., max_length=100)
    shipping_phone: str = Field(..., max_length=20)
    shipping_address: str
    note: Optional[str] = None


class OrderUpdateStatus(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: int
    order_no: str
    user_id: int
    status: OrderStatus
    total_amount: float
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class CartItemCreate(BaseModel):
    sku_id: int
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    sku_id: int
    quantity: int
    created_at: datetime

    model_config = {"from_attributes": True}
