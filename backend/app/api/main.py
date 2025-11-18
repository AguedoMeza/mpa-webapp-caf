from fastapi import APIRouter
from app.api.caf_solicitud import router as caf_solicitud_router
from app.api.debug import router as debug_router
from app.api.users import router as users_router

api_router = APIRouter()
api_router.include_router(caf_solicitud_router)
api_router.include_router(debug_router, prefix="/debug", tags=["debug"])
api_router.include_router(users_router, tags=["users"])

@api_router.get("/")
def api_v1_root():
    return {"message": "API v1 root"}
