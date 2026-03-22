"""
商品路由 - 商品列表、详情、CRUD
"""
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_admin_user
from models.user import User
from crud.product import (
    get_products, get_product, get_product_by_slug,
    create_product, update_product, delete_product,
)
from schemas.product import (
    ProductCreate, ProductUpdate,
    ProductListResponse, ProductDetailResponse, PaginatedResponse,
)

router = APIRouter(prefix="/products", tags=["商品"])


@router.get("", response_model=PaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取商品列表（分页）"""
    items, total = await get_products(db, page, page_size, category_id, is_active, search)
    return PaginatedResponse(
        items=[ProductListResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product_detail(product_id: int, db: AsyncSession = Depends(get_db)):
    """获取商品详情"""
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return product


@router.get("/slug/{slug}", response_model=ProductDetailResponse)
async def get_product_by_slug_route(slug: str, db: AsyncSession = Depends(get_db)):
    """通过 slug 获取商品详情（SEO 友好）"""
    product = await get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return product


@router.post("", response_model=ProductDetailResponse, status_code=201)
async def create_product_route(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """创建商品（管理员）"""
    return await create_product(db, data)


@router.put("/{product_id}", response_model=ProductDetailResponse)
async def update_product_route(
    product_id: int,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """更新商品（管理员）"""
    product = await update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return product


@router.delete("/{product_id}", status_code=204)
async def delete_product_route(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """删除商品（管理员）"""
    if not await delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="商品不存在")
