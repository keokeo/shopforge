"""
Dashboard 路由 - 提供管理后台的数据统计
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from core.database import get_db
from core.dependencies import get_admin_user
from models.user import User
from models.order import Order, OrderStatus
from models.product import Product
from schemas.order import OrderResponse

router = APIRouter(prefix="/dashboard", tags=["数据看板"])


@router.get("/metrics")
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    """获取管理后台数据看板统计信息"""
    now = datetime.now(timezone.utc)
    
    # 1. 订单数 & 总销售额 (仅统计已支付及以上状态的订单，这里简单起见统计非取消状态的)
    valid_order_stmt = select(func.count(Order.id), func.sum(Order.total_amount)).where(Order.status != OrderStatus.CANCELLED)
    order_result = await db.execute(valid_order_stmt)
    order_count, total_sales = order_result.one()
    total_sales = float(total_sales or 0)
    order_count = order_count or 0

    # 2. 商品总数
    product_result = await db.execute(select(func.count(Product.id)))
    product_count = product_result.scalar() or 0

    # 3. 用户总数
    user_result = await db.execute(select(func.count(User.id)))
    user_count = user_result.scalar() or 0

    # 4. 近7天销售趋势
    trend_data = []
    # 生成过去 7 天的日期序列（按本地时区或 UTC 划分，这里简化使用 UTC）
    for i in range(6, -1, -1):
        target_date = now - timedelta(days=i)
        start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        day_stmt = select(func.sum(Order.total_amount)).where(
            and_(
                Order.created_at >= start_of_day,
                Order.created_at < end_of_day,
                Order.status != OrderStatus.CANCELLED
            )
        )
        day_sum = (await db.execute(day_stmt)).scalar() or 0
        trend_data.append({
            "date": start_of_day.strftime("%m-%d"),
            "sales": float(day_sum)
        })

    # 5. 最近 5 笔订单
    recent_orders_stmt = select(Order).order_by(Order.created_at.desc()).limit(5)
    recent_orders_result = await db.execute(recent_orders_stmt)
    recent_orders = recent_orders_result.scalars().all()

    return {
        "metrics": {
            "total_sales": total_sales,
            "order_count": order_count,
            "product_count": product_count,
            "user_count": user_count,
        },
        "sales_trend": trend_data,
        "recent_orders": [OrderResponse.model_validate(o) for o in recent_orders],
    }
