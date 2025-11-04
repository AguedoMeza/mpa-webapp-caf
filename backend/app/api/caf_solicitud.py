from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.caf_solicitud_service import CafSolicitudService
from app.schemas.caf_solicitud import ApprovalRequest, ApprovalResponse


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

@router.put("/caf-solicitud/{solicitud_id}", status_code=status.HTTP_200_OK)
def update_caf_solicitud(solicitud_id: int, data: dict, db: Session = Depends(get_db)):
    result = service.update(db, solicitud_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return result

@router.patch("/caf-solicitud/{solicitud_id}/approval", status_code=status.HTTP_200_OK, response_model=ApprovalResponse)
def approve_or_reject_solicitud(
    solicitud_id: int, 
    approval_data: ApprovalRequest, 
    db: Session = Depends(get_db)
) -> ApprovalResponse:
    """
    Aprueba o rechaza una solicitud CAF.
    
    Body esperado:
    {
        "approve": "aprobado" | "rechazado" | "revision",
        "comentarios": "string"  // Requerido solo para rechazos
    }
    """
    try:
        result = service.approve_or_reject(
            db, 
            solicitud_id, 
            approval_data.approve, 
            approval_data.comentarios
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
        return ApprovalResponse(
            success=True,
            id_solicitud=result.id_solicitud,
            approve=result.approve,
            status=approval_data.approve,
            comentarios=result.Comentarios,
            message=f"Solicitud #{result.id_solicitud} {approval_data.approve} exitosamente"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
