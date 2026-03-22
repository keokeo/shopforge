"""
SKU 路由 - SKU 管理、属性管理
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_admin_user
from models.user import User
from crud.sku import (
    get_skus, get_sku, create_sku, update_sku, delete_sku,
    get_product_attributes, create_product_attribute, delete_product_attribute,
)
from schemas.sku import (
    SKUCreate, SKUUpdate, SKUResponse,
    ProductAttributeCreate, ProductAttributeResponse,
)

router = APIRouter(prefix="/products/{product_id}", tags=["SKU"])


# ====== 属性管理 ======

@router.get("/attributes", response_model=list[ProductAttributeResponse])
async def list_attributes(product_id: int, db: AsyncSession = Depends(get_db)):
    """获取商品属性列表"""
    return await get_product_attributes(db, product_id)


@router.post("/attributes", response_model=ProductAttributeResponse, status_code=201)
async def create_attribute(
    product_id: int,
    data: ProductAttributeCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """创建商品属性（管理员）"""
    return await create_product_attribute(db, product_id, data)


@router.delete("/attributes/{attribute_id}", status_code=204)
async def remove_attribute(
    product_id: int,
    attribute_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """删除商品属性（管理员）"""
    if not await delete_product_attribute(db, attribute_id):
        raise HTTPException(status_code=404, detail="属性不存在")


# ====== SKU 管理 ======

@router.get("/skus", response_model=list[SKUResponse])
async def list_skus(product_id: int, db: AsyncSession = Depends(get_db)):
    """获取商品 SKU 列表"""
    return await get_skus(db, product_id)


@router.post("/skus", response_model=SKUResponse, status_code=201)
async def create_sku_route(
    product_id: int,
    data: SKUCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """创建 SKU（管理员）"""
    return await create_sku(db, product_id, data)


@router.put("/skus/{sku_id}", response_model=SKUResponse)
async def update_sku_route(
    product_id: int,
    sku_id: int,
    data: SKUUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """更新 SKU（管理员）"""
    sku = await update_sku(db, sku_id, data)
    if not sku:
        raise HTTPException(status_code=404, detail="SKU 不存在")
    return sku


@router.delete("/skus/{sku_id}", status_code=204)
async def delete_sku_route(
    product_id: int,
    sku_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """删除 SKU（管理员）"""
    if not await delete_sku(db, sku_id):
        raise HTTPException(status_code=404, detail="SKU 不存在")
