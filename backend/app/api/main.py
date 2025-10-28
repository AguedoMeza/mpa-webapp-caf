from fastapi import APIRouter
from app.api.caf_solicitud import router as caf_solicitud_router

api_router = APIRouter()
api_router.include_router(caf_solicitud_router)

@api_router.get("/")
def api_v1_root():
    return {"message": "API v1 root"}
