"""
订单模型
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class OrderStatus(str, PyEnum):
    PENDING = "pending"           # 待付款
    PAID = "paid"                 # 已付款
    PROCESSING = "processing"    # 处理中
    SHIPPED = "shipped"          # 已发货
    DELIVERED = "delivered"      # 已送达
    CANCELLED = "cancelled"      # 已取消
    REFUNDED = "refunded"        # 已退款


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_no: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False
    )
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    shipping_name: Mapped[str] = mapped_column(String(100), nullable=True)
    shipping_phone: Mapped[str] = mapped_column(String(20), nullable=True)
    shipping_address: Mapped[str] = mapped_column(Text, nullable=True)
    note: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", lazy="selectin", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    """订单明细"""
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    sku_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skus.id"), nullable=False
    )
    product_name: Mapped[str] = mapped_column(String(300), nullable=False)
    sku_name: Mapped[str] = mapped_column(String(200), nullable=True)  # SKU 描述快照
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    sku: Mapped["SKU"] = relationship(lazy="selectin")
