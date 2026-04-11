import asyncio
import os
import sys
from datetime import datetime

# 加载环境变量之前添加根目录到 path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from core.database import AsyncSessionLocal
from core.security import hash_password
from models.user import User
from models.category import Category
from models.product import Product, ProductImage
from models.sku import ProductAttribute, AttributeValue, SKU

async def seed_data():
    async with AsyncSessionLocal() as session:
        # Seed users
        print("Creating users...")
        admin = User(
            email="admin@shopforge.dev",
            username="admin",
            hashed_password=hash_password("admin123"),
            full_name="ShopForge Admin",
            is_active=True,
            is_admin=True,
        )
        testuser = User(
            email="test@shopforge.dev",
            username="testuser",
            hashed_password=hash_password("test123"),
            full_name="Test Buyer",
            is_active=True,
            is_admin=False,
        )
        session.add_all([admin, testuser])
        await session.commit()
        print(f"  Admin: admin / admin123")
        print(f"  Test:  testuser / test123")
        
        print("Creating categories...")
        cat1 = Category(name="Ready to Wear", slug="ready-to-wear")
        cat2 = Category(name="Accessories", slug="accessories")
        session.add_all([cat1, cat2])
        await session.commit()
        await session.refresh(cat1)
        await session.refresh(cat2)

        print("Creating products...")
        product1 = Product(
            name="Cashmere Structured Coat",
            slug="cashmere-structured-coat",
            description="A masterpiece of minimalist tailoring. This structured coat is cut from double-faced cashmere for an ultra-soft, unlined finish. Featuring dramatic lapels, dropped shoulders, and sharp lines, it embodies the editorial aesthetic with effortless luxury.",
            main_image_url="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
            base_price=1250.00,
            category_id=cat1.id,
            is_active=True,
            is_featured=True,
        )
        product2 = Product(
            name="Minimalist Leather Tote",
            slug="minimalist-leather-tote",
            description="Crafted from smooth, vegetable-tanned leather, this tote relies on its stark geometric silhouette rather than flashy hardware. Features structural top handles and a vast interior for absolute utility with high-end appeal.",
            main_image_url="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop",
            base_price=850.00,
            category_id=cat2.id,
            is_active=True,
            is_featured=True,
        )
        session.add_all([product1, product2])
        await session.commit()
        await session.refresh(product1)
        await session.refresh(product2)

        print("Creating product images...")
        img1 = ProductImage(product_id=product1.id, image_url="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop", sort_order=1)
        img2 = ProductImage(product_id=product1.id, image_url="https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=1000&auto=format&fit=crop", sort_order=2)
        session.add_all([img1, img2])

        print("Creating attributes and SKUs for product 1...")
        attr_size = ProductAttribute(product_id=product1.id, name="Size")
        attr_color = ProductAttribute(product_id=product1.id, name="Color")
        session.add_all([attr_size, attr_color])
        await session.commit()
        await session.refresh(attr_size)
        await session.refresh(attr_color)

        val_s = AttributeValue(attribute_id=attr_size.id, value="S", sort_order=1)
        val_m = AttributeValue(attribute_id=attr_size.id, value="M", sort_order=2)
        val_noir = AttributeValue(attribute_id=attr_color.id, value="Noir", sort_order=1)
        val_bone = AttributeValue(attribute_id=attr_color.id, value="Bone", sort_order=2)
        session.add_all([val_s, val_m, val_noir, val_bone])
        await session.commit()
        await session.refresh(val_s)
        await session.refresh(val_m)
        await session.refresh(val_noir)
        await session.refresh(val_bone)

        sku1 = SKU(product_id=product1.id, sku_code="COAT-NOIR-S", price=1250.00, stock=5)
        sku2 = SKU(product_id=product1.id, sku_code="COAT-NOIR-M", price=1250.00, stock=3)
        sku3 = SKU(product_id=product1.id, sku_code="COAT-BONE-S", price=1250.00, stock=0)
        session.add_all([sku1, sku2, sku3])
        await session.commit()
        await session.refresh(sku1)
        await session.refresh(sku2)
        await session.refresh(sku3)

        sku1.attribute_values.extend([val_s, val_noir])
        sku2.attribute_values.extend([val_m, val_noir])
        sku3.attribute_values.extend([val_s, val_bone])

        print("Creating SKUs for product 2...")
        sku_tote = SKU(product_id=product2.id, sku_code="TOTE-ONE", price=850.00, stock=10)
        session.add_all([sku_tote])
        await session.commit()

        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
