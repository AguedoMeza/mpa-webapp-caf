from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.caf_solicitud_service import CafSolicitudService

router = APIRouter()
service = CafSolicitudService()

@router.post("/caf-solicitud", status_code=status.HTTP_201_CREATED)
def create_caf_solicitud(data: dict, db: Session = Depends(get_db)):
    solicitud = service.create(db, data)
    return solicitud
