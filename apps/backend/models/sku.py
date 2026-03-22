"""
SKU 变体模型
实现灵活的多属性 SKU 系统:
  Product → ProductAttribute → AttributeValue
  SKU ↔ AttributeValue (多对多)
"""
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Numeric, Boolean, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

# SKU ↔ 属性值 关联表
sku_attribute_values = Table(
    "sku_attribute_values",
    Base.metadata,
    Column("sku_id", Integer, ForeignKey("skus.id", ondelete="CASCADE"), primary_key=True),
    Column("attribute_value_id", Integer, ForeignKey("attribute_values.id", ondelete="CASCADE"), primary_key=True),
)


class ProductAttribute(Base):
    """商品属性名（如: 颜色、尺码、材质）"""
    __tablename__ = "product_attributes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # 如: "颜色", "尺码"
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="attributes")
    values: Mapped[list["AttributeValue"]] = relationship(
        back_populates="attribute", lazy="selectin", cascade="all, delete-orphan"
    )


class AttributeValue(Base):
    """属性值（如: 红色、XL、棉质）"""
    __tablename__ = "attribute_values"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attribute_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("product_attributes.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String(100), nullable=False)  # 如: "红色", "XL"
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    attribute: Mapped["ProductAttribute"] = relationship(back_populates="values")
    skus: Mapped[list["SKU"]] = relationship(
        secondary=sku_attribute_values, back_populates="attribute_values", lazy="selectin"
    )


class SKU(Base):
    """商品变体 SKU（每个属性组合对应一个 SKU）"""
    __tablename__ = "skus"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    sku_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    product: Mapped["Product"] = relationship(back_populates="skus")
    attribute_values: Mapped[list["AttributeValue"]] = relationship(
        secondary=sku_attribute_values, back_populates="skus", lazy="selectin"
    )
