"""
SKU CRUD 操作
"""
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.sku import SKU, ProductAttribute, AttributeValue
from schemas.sku import SKUCreate, SKUUpdate, ProductAttributeCreate


# ====== 属性 CRUD ======

async def get_product_attributes(db: AsyncSession, product_id: int) -> list[ProductAttribute]:
    result = await db.execute(
        select(ProductAttribute)
        .options(selectinload(ProductAttribute.values))
        .where(ProductAttribute.product_id == product_id)
        .order_by(ProductAttribute.sort_order)
    )
    return list(result.scalars().all())


async def create_product_attribute(
    db: AsyncSession, product_id: int, data: ProductAttributeCreate
) -> ProductAttribute:
    attr = ProductAttribute(
        product_id=product_id,
        name=data.name,
        sort_order=data.sort_order,
    )
    db.add(attr)
    await db.flush()

    for val_data in data.values:
        val = AttributeValue(
            attribute_id=attr.id,
            value=val_data.value,
            sort_order=val_data.sort_order,
        )
        db.add(val)

    await db.flush()
    await db.refresh(attr)
    return attr


async def delete_product_attribute(db: AsyncSession, attribute_id: int) -> bool:
    result = await db.execute(select(ProductAttribute).where(ProductAttribute.id == attribute_id))
    attr = result.scalar_one_or_none()
    if not attr:
        return False
    await db.delete(attr)
    await db.flush()
    return True


# ====== SKU CRUD ======

async def get_skus(db: AsyncSession, product_id: int) -> list[SKU]:
    result = await db.execute(
        select(SKU)
        .options(selectinload(SKU.attribute_values))
        .where(SKU.product_id == product_id)
    )
    return list(result.scalars().all())


async def get_sku(db: AsyncSession, sku_id: int) -> Optional[SKU]:
    result = await db.execute(
        select(SKU)
        .options(selectinload(SKU.attribute_values))
        .where(SKU.id == sku_id)
    )
    return result.scalar_one_or_none()


async def create_sku(db: AsyncSession, product_id: int, data: SKUCreate) -> SKU:
    sku = SKU(
        product_id=product_id,
        sku_code=data.sku_code,
        price=data.price,
        stock=data.stock,
        image_url=data.image_url,
        is_active=data.is_active,
    )
    db.add(sku)
    await db.flush()

    # 关联属性值
    if data.attribute_value_ids:
        result = await db.execute(
            select(AttributeValue).where(AttributeValue.id.in_(data.attribute_value_ids))
        )
        attr_values = list(result.scalars().all())
        sku.attribute_values = attr_values
        await db.flush()

    await db.refresh(sku)
    return sku


async def update_sku(db: AsyncSession, sku_id: int, data: SKUUpdate) -> Optional[SKU]:
    sku = await get_sku(db, sku_id)
    if not sku:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sku, key, value)
    await db.flush()
    await db.refresh(sku)
    return sku


async def delete_sku(db: AsyncSession, sku_id: int) -> bool:
    sku = await get_sku(db, sku_id)
    if not sku:
        return False
    await db.delete(sku)
    await db.flush()
    return True
