from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.caf_solicitud_service import CafSolicitudService
from app.schemas.caf_solicitud import ApprovalRequest, ApprovalResponse


router = APIRouter()


@router.post("/caf-solicitud", status_code=status.HTTP_201_CREATED)
def create_caf_solicitud(data: dict, db: Session = Depends(get_db)):
    """
    Crea una nueva solicitud CAF.
    El campo 'approve' se deja como NULL (pendiente de revisión) automáticamente.
    """
    service = CafSolicitudService()
    solicitud = service.create(db, data)
    return solicitud

@router.get("/caf-solicitud/{solicitud_id}", status_code=status.HTTP_200_OK)
def get_caf_solicitud_detail(solicitud_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de una solicitud CAF por ID"""
    service = CafSolicitudService()
    result = service.get_detail(db, solicitud_id)
    if not result:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return result

@router.put("/caf-solicitud/{solicitud_id}", status_code=status.HTTP_200_OK)
def update_caf_solicitud(solicitud_id: int, data: dict, db: Session = Depends(get_db)):
    """Actualiza una solicitud CAF existente"""
    service = CafSolicitudService()
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
    Aprueba, rechaza o marca para correcciones una solicitud CAF.
    
    Flujo de estados:
    - NULL (pendiente) -> Estado inicial cuando se crea la solicitud
    - 'requiere_correcciones' (0) -> Rechazado temporalmente, necesita correcciones (comentarios OBLIGATORIOS)
    - 'aprobado' (1) -> Aprobado definitivamente
    - 'rechazado_definitivo' (2) -> Rechazado definitivamente (comentarios opcionales)
    
    Body esperado:
    {
        "approve": "requiere_correcciones" | "aprobado" | "rechazado_definitivo",
        "comentarios": "string"  // Obligatorio solo para "requiere_correcciones"
    }
    
    Ejemplos:
    
    1. Aprobar:
    {
        "approve": "aprobado"
    }
    
    2. Solicitar correcciones:
    {
        "approve": "requiere_correcciones",
        "comentarios": "Falta información del proveedor y montos actualizados"
    }
    
    3. Rechazar definitivamente (sin comentarios):
    {
        "approve": "rechazado_definitivo"
    }
    
    4. Rechazar definitivamente (con comentarios):
    {
        "approve": "rechazado_definitivo",
        "comentarios": "No cumple con los requisitos mínimos de la empresa"
    }
    """
    try:
        service = CafSolicitudService()
        result = service.approve_or_reject(
            db, 
            solicitud_id, 
            approval_data.approve, 
            approval_data.comentarios
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
        # Mapear estados a mensajes claros
        status_messages = {
            'requiere_correcciones': 'marcada para correcciones',
            'aprobado': 'aprobada',
            'rechazado_definitivo': 'rechazada definitivamente'
        }
        
        return ApprovalResponse(
            success=True,
            id_solicitud=result.id_solicitud,
            approve=result.approve,
            status=approval_data.approve,
            comentarios=result.Comentarios,
            message=f"Solicitud #{result.id_solicitud} {status_messages[approval_data.approve]} exitosamente"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
