"""
分类路由 - 分类 CRUD
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_admin_user
from models.user import User
from crud.product import (
    get_categories, get_category,
    create_category, update_category, delete_category,
)
from schemas.product import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["分类"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """获取所有分类"""
    return await get_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category_detail(category_id: int, db: AsyncSession = Depends(get_db)):
    """获取分类详情"""
    category = await get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return category


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category_route(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """创建分类（管理员）"""
    return await create_category(db, data)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category_route(
    category_id: int,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """更新分类（管理员）"""
    category = await update_category(db, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return category


@router.delete("/{category_id}", status_code=204)
async def delete_category_route(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """删除分类（管理员）"""
    if not await delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="分类不存在")
