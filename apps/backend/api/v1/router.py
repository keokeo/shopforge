"""
API v1 总路由注册
"""
from fastapi import APIRouter

from api.v1.auth import router as auth_router
from api.v1.products import router as products_router
from api.v1.skus import router as skus_router
from api.v1.categories import router as categories_router
from api.v1.cart import router as cart_router
from api.v1.orders import router as orders_router
from api.v1.users import router as users_router
from api.v1.upload import router as upload_router
from api.v1.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(skus_router)
api_router.include_router(categories_router)
api_router.include_router(cart_router)
api_router.include_router(orders_router)
api_router.include_router(users_router)
api_router.include_router(upload_router)
api_router.include_router(dashboard_router)
