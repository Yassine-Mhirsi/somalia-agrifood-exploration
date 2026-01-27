from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Somalia Agrifood Exploration API is running"}
