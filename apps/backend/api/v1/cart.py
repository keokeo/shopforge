"""
购物车路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_active_user
from models.user import User
from crud.order import get_cart_items, add_to_cart, update_cart_item, remove_from_cart, clear_cart
from schemas.order import CartItemCreate, CartItemUpdate, CartItemResponse

router = APIRouter(prefix="/cart", tags=["购物车"])


@router.get("", response_model=list[CartItemResponse])
async def list_cart(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """获取当前用户购物车"""
    return await get_cart_items(db, user.id)


@router.post("", response_model=CartItemResponse, status_code=201)
async def add_cart_item(
    data: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """添加商品到购物车"""
    return await add_to_cart(db, user.id, data)


@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart(
    item_id: int,
    data: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """更新购物车商品数量"""
    item = await update_cart_item(db, item_id, user.id, data.quantity)
    if not item:
        raise HTTPException(status_code=404, detail="购物车条目不存在")
    return item


@router.delete("/{item_id}", status_code=204)
async def remove_cart_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """移除购物车商品"""
    if not await remove_from_cart(db, item_id, user.id):
        raise HTTPException(status_code=404, detail="购物车条目不存在")


@router.delete("", status_code=204)
async def clear_cart_route(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """清空购物车"""
    await clear_cart(db, user.id)
