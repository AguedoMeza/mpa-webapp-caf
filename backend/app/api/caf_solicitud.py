from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.caf_solicitud_service import CafSolicitudService


router = APIRouter()
service = CafSolicitudService()


@router.post("/caf-solicitud", status_code=status.HTTP_201_CREATED)
def create_caf_solicitud(data: dict, db: Session = Depends(get_db)):
    solicitud = service.create(db, data)
    return solicitud

@router.get("/caf-solicitud/{solicitud_id}", status_code=status.HTTP_200_OK)
def get_caf_solicitud_detail(solicitud_id: int, db: Session = Depends(get_db)):
    result = service.get_detail(db, solicitud_id)
    if not result:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return result
