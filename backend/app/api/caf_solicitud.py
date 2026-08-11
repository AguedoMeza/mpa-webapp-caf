from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import DataError, IntegrityError
from typing import Optional
from app.core.database import get_db
from app.services.caf_solicitud_service import CafSolicitudService
from app.schemas.caf_solicitud import ApprovalRequest, ApprovalResponse, ReasignacionRequest
from app.services.email_service import email_service
from app.core.config import settings


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


@router.patch("/caf-solicitud/{solicitud_id}/responsable", status_code=status.HTTP_200_OK)
def reasignar_responsable(
    solicitud_id: int,
    data: ReasignacionRequest,
    db: Session = Depends(get_db),
):
    """
    Cambia el Admin Responsable de una solicitud y lo registra en su historial.

    Existe porque cuando el responsable causa baja o sale de vacaciones la
    solicitud queda atorada: nadie mas ve los controles de aprobacion.

    No valida quien lo ejecuta. El correo que llega en 'usuario' se guarda tal
    como lo manda el cliente.
    """
    try:
        service = CafSolicitudService()
        solicitud = service.reasignar_responsable(
            db,
            solicitud_id=solicitud_id,
            nuevo_responsable=data.responsable,
            usuario=data.usuario,
            motivo=data.motivo,
        )

        aviso_enviado = False
        if data.notificar:
            # El correo no debe tumbar la reasignacion: el cambio ya se guardo.
            try:
                resultado = email_service.send_caf_notification(
                    to_email=solicitud.Responsable,
                    solicitud_id=solicitud.id_solicitud,
                    tipo_contratacion=solicitud.Tipo_Contratacion,
                    responsable=solicitud.Responsable,
                    frontend_base_url=settings.FRONTEND_BASE_URL,
                    building=solicitud.Building,
                    cliente=solicitud.Cliente,
                    proveedor=solicitud.Proveedor,
                    usuario_solicitante=solicitud.Usuario,
                )
                aviso_enviado = resultado.get("status") == "success"
                if not aviso_enviado:
                    print(f"⚠️ Reasignacion #{solicitud_id} guardada pero el correo fallo: {resultado}")
            except Exception as e:
                print(f"⚠️ Reasignacion #{solicitud_id} guardada pero el correo fallo: {str(e)}")

        return {
            "success": True,
            "id_solicitud": solicitud.id_solicitud,
            "responsable": solicitud.Responsable,
            "historial": solicitud.Historial_Reasignacion,
            "notificado": aviso_enviado,
            "message": f"Solicitud #{solicitud_id} reasignada a {solicitud.Responsable}",
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error reasignando solicitud #{solicitud_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al reasignar la solicitud")


# OJO: esta ruta va declarada ANTES de /caf-solicitud/{solicitud_id}. Si se declara
# despues, FastAPI intenta interpretar "responsables" como un int y responde 422.
@router.get("/caf-solicitud/responsables", status_code=status.HTTP_200_OK)
def list_responsables_caf(db: Session = Depends(get_db)):
    """
    Responsables que aparecen en las solicitudes, con el conteo de cada uno.
    Alimenta el filtro del listado.
    """
    try:
        service = CafSolicitudService()
        return service.list_responsables(db)
    except Exception as e:
        print(f"❌ Error listando responsables: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al listar los responsables")


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
