"""
商品 CRUD 操作
"""
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.product import Product, ProductImage
from models.category import Category
from schemas.product import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate


# ====== 分类 CRUD ======

async def get_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(
        select(Category).order_by(Category.sort_order, Category.id)
    )
    return list(result.scalars().all())


async def get_category(db: AsyncSession, category_id: int) -> Optional[Category]:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    category = Category(**data.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def update_category(db: AsyncSession, category_id: int, data: CategoryUpdate) -> Optional[Category]:
    category = await get_category(db, category_id)
    if not category:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    await db.flush()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: int) -> bool:
    category = await get_category(db, category_id)
    if not category:
        return False
    await db.delete(category)
    await db.flush()
    return True


# ====== 商品 CRUD ======

async def get_products(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
) -> tuple[list[Product], int]:
    query = select(Product)
    count_query = select(func.count(Product.id))

    if category_id is not None:
        query = query.where(Product.category_id == category_id)
        count_query = count_query.where(Product.category_id == category_id)
    if is_active is not None:
        query = query.where(Product.is_active == is_active)
        count_query = count_query.where(Product.is_active == is_active)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
        count_query = count_query.where(Product.name.ilike(f"%{search}%"))

    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Product.sort_order, Product.id.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_product(db: AsyncSession, product_id: int) -> Optional[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category), selectinload(Product.attributes))
        .where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def get_product_by_slug(db: AsyncSession, slug: str) -> Optional[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.category), selectinload(Product.attributes))
        .where(Product.slug == slug)
    )
    return result.scalar_one_or_none()


from models.sku import SKU

async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.flush()
    
    # Auto-create a default SKU so the product can be purchased immediately
    default_sku = SKU(
        product_id=product.id,
        sku_code=f"{product.slug}-default",
        price=product.base_price,
        stock=999,
        image_url=product.main_image_url
    )
    db.add(default_sku)
    
    await db.flush()
    await db.refresh(product)
    return product


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Optional[Product]:
    product = await get_product(db, product_id)
    if not product:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    await db.flush()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await get_product(db, product_id)
    if not product:
        return False
    await db.delete(product)
    await db.flush()
    return True
