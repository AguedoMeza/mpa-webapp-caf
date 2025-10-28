from fastapi import APIRouter

api_router = APIRouter()

@api_router.get("/")
def api_v1_root():
	return {"message": "API v1 root"}
