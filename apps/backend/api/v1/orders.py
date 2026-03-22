"""
订单路由
"""
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_active_user, get_admin_user
from models.user import User
from models.order import OrderStatus
from crud.order import create_order, get_orders, get_order, update_order_status
from schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus
from schemas.product import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["订单"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order_route(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """创建订单"""
    try:
        return await create_order(db, user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=PaginatedResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """获取当前用户订单列表"""
    items, total = await get_orders(db, user_id=user.id, page=page, page_size=page_size, status=status)
    return PaginatedResponse(
        items=[OrderResponse.model_validate(o) for o in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/admin", response_model=PaginatedResponse)
async def list_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """获取所有订单列表（管理员）"""
    items, total = await get_orders(db, page=page, page_size=page_size, status=status)
    return PaginatedResponse(
        items=[OrderResponse.model_validate(o) for o in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_detail(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    """获取订单详情"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    # 非管理员只能查看自己的订单
    if order.user_id != user.id and not user.is_admin:
        raise HTTPException(status_code=403, detail="权限不足")
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_status(
    order_id: int,
    data: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """更新订单状态（管理员）"""
    order = await update_order_status(db, order_id, data.status)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    return order
