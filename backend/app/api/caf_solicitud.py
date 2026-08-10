from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import DataError, IntegrityError
from typing import Optional
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
    try:
        service = CafSolicitudService()
        solicitud = service.create(db, data)
        return solicitud
    except (DataError, IntegrityError) as e:
        raise HTTPException(status_code=400, detail=f"Error de datos: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear la solicitud: {str(e)}")

@router.get("/caf-solicitud", status_code=status.HTTP_200_OK)
def list_caf_solicitudes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
    tipo_contratacion: Optional[str] = Query(None, max_length=100),
    estado: Optional[str] = Query(
        None,
        pattern="^(pendiente|correcciones|aprobado|rechazado)$",
        description="Filtra por estado de aprobacion",
    ),
    responsable: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
):
    """
    Lista una pagina del listado de solicitudes CAF, las mas recientes primero.

    La paginacion y los filtros se resuelven en la BD: si se filtrara en el cliente
    sobre una pagina, los filtros solo verian los registros visibles.

    Devuelve {items, total, page, page_size, pages} y solo las columnas que la
    tabla necesita, no la fila completa.
    """
    try:
        service = CafSolicitudService()
        return service.list_all(
            db,
            page=page,
            page_size=page_size,
            search=search,
            tipo_contratacion=tipo_contratacion,
            status=estado,
            responsable=responsable,
        )
    except Exception as e:
        print(f"❌ Error listando solicitudes CAF: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al listar las solicitudes")


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
    try:
        service = CafSolicitudService()
        result = service.update(db, solicitud_id, data)
        if not result:
            raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        return result
    except (DataError, IntegrityError) as e:
        raise HTTPException(status_code=400, detail=f"Error de datos: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar la solicitud: {str(e)}")

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


@router.get("/buildings/select", status_code=status.HTTP_200_OK)
def get_buildings_for_select(db: Session = Depends(get_db)):
    """
    Obtiene lista de edificios para usar en un componente Select.
    El filtrado/búsqueda se realiza en el frontend.
    
    Returns:
    ```json
    [
        {
            "value": "BLDG01",
            "label": "Torre Principal - Ciudad de México, CDMX"
        }
    ]
    ```
    """
    service = CafSolicitudService()
    return service.get_buildings_for_select(db)
