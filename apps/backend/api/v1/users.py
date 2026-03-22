"""
用户管理路由 - 管理员查询用户列表
"""
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_admin_user
from models.user import User
from schemas.user import UserResponse
from schemas.product import PaginatedResponse

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("", response_model=PaginatedResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """获取用户列表（管理员）"""
    query = select(User)
    count_query = select(func.count(User.id))

    if search:
        query = query.where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
        count_query = count_query.where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(User.id.desc()).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    users = list(result.scalars().all())

    return PaginatedResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )
