from fastapi import APIRouter

from backend.app.api.endpoints import data, root

api_router = APIRouter()
api_router.include_router(root.router, tags=["health"])
api_router.include_router(data.router, prefix="/api", tags=["data"])
