from fastapi import APIRouter

from backend.app.api.endpoints import analysis, data, root

api_router = APIRouter()
api_router.include_router(root.router, tags=["health"])
api_router.include_router(data.router, prefix="/api", tags=["data"])
api_router.include_router(analysis.router, prefix="/api", tags=["analysis"])
