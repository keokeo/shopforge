"""
订单 CRUD 操作
"""
import uuid
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.order import Order, OrderItem, OrderStatus
from models.sku import SKU
from models.cart import CartItem
from schemas.order import OrderCreate, CartItemCreate


def generate_order_no() -> str:
    """生成唯一订单号"""
    return f"SF{uuid.uuid4().hex[:12].upper()}"


# ====== 购物车 CRUD ======

async def get_cart_items(db: AsyncSession, user_id: int) -> list[CartItem]:
    result = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.sku))
        .where(CartItem.user_id == user_id)
        .order_by(CartItem.created_at.desc())
    )
    return list(result.scalars().all())


async def add_to_cart(db: AsyncSession, user_id: int, data: CartItemCreate) -> CartItem:
    # 检查是否已在购物车
    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == user_id,
            CartItem.sku_id == data.sku_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.quantity += data.quantity
        await db.flush()
        await db.refresh(existing)
        return existing

    item = CartItem(user_id=user_id, sku_id=data.sku_id, quantity=data.quantity)
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


async def update_cart_item(db: AsyncSession, item_id: int, user_id: int, quantity: int) -> Optional[CartItem]:
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        return None
    item.quantity = quantity
    await db.flush()
    await db.refresh(item)
    return item


async def remove_from_cart(db: AsyncSession, item_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        return False
    await db.delete(item)
    await db.flush()
    return True


async def clear_cart(db: AsyncSession, user_id: int) -> None:
    result = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    items = result.scalars().all()
    for item in items:
        await db.delete(item)
    await db.flush()


# ====== 订单 CRUD ======

async def create_order(db: AsyncSession, user_id: int, data: OrderCreate) -> Order:
    total_amount = 0
    order_items = []

    for item_data in data.items:
        sku_result = await db.execute(
            select(SKU).options(selectinload(SKU.product)).where(SKU.id == item_data.sku_id)
        )
        sku = sku_result.scalar_one_or_none()
        if not sku:
            raise ValueError(f"SKU {item_data.sku_id} 不存在")
        if not sku.is_active:
            raise ValueError(f"SKU {sku.sku_code} 已下架")
        if not sku.product.is_active:
            raise ValueError(f"商品「{sku.product.name}」已下架，无法购买")
        if sku.stock < item_data.quantity:
            raise ValueError(f"SKU {sku.sku_code} 库存不足")

        line_total = float(sku.price) * item_data.quantity
        total_amount += line_total

        # 构造属性描述
        attr_desc = ", ".join([av.value for av in sku.attribute_values]) if sku.attribute_values else None

        order_items.append(OrderItem(
            sku_id=sku.id,
            product_name=sku.product.name,
            sku_name=attr_desc,
            price=float(sku.price),
            quantity=item_data.quantity,
        ))

        # 扣减库存
        sku.stock -= item_data.quantity

    order = Order(
        order_no=generate_order_no(),
        user_id=user_id,
        total_amount=total_amount,
        shipping_name=data.shipping_name,
        shipping_phone=data.shipping_phone,
        shipping_address=data.shipping_address,
        note=data.note,
        items=order_items,
    )
    db.add(order)
    await db.flush()
    await db.refresh(order)
    return order


async def get_orders(
    db: AsyncSession,
    user_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    status: Optional[OrderStatus] = None,
) -> tuple[list[Order], int]:
    query = select(Order).options(selectinload(Order.items))
    count_query = select(func.count(Order.id))

    if user_id is not None:
        query = query.where(Order.user_id == user_id)
        count_query = count_query.where(Order.user_id == user_id)
    if status is not None:
        query = query.where(Order.status == status)
        count_query = count_query.where(Order.status == status)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_order(db: AsyncSession, order_id: int) -> Optional[Order]:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def update_order_status(db: AsyncSession, order_id: int, status: OrderStatus) -> Optional[Order]:
    order = await get_order(db, order_id)
    if not order:
        return None
    order.status = status
    await db.flush()
    await db.refresh(order)
    return order
