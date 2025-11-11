from pydantic import BaseModel, Field, validator
from typing import Optional, Literal

class ApprovalRequest(BaseModel):
    """
    Request para aprobar, rechazar o solicitar correcciones en una solicitud CAF.
    
    Estados permitidos:
    - 'requiere_correcciones' (0): Requiere correcciones (comentarios obligatorios)
    - 'aprobado' (1): Aprobado definitivamente
    - 'rechazado_definitivo' (2): Rechazado definitivamente (comentarios opcionales)
    """
    approve: Literal['requiere_correcciones', 'aprobado', 'rechazado_definitivo'] = Field(
        ...,
        description="Estado de aprobación: 'requiere_correcciones', 'aprobado', o 'rechazado_definitivo'"
    )
    comentarios: Optional[str] = Field(
        None,
        max_length=500,
        description="Comentarios (obligatorios para 'requiere_correcciones', opcionales para otros estados)"
    )
    
    @validator('comentarios')
    def validate_comentarios_required(cls, v, values):
        """Validar que los comentarios sean obligatorios cuando se requieren correcciones"""
        if 'approve' in values and values['approve'] == 'requiere_correcciones':
            if not v or not v.strip():
                raise ValueError("Los comentarios son OBLIGATORIOS cuando se requieren correcciones")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "approve": "requiere_correcciones",
                "comentarios": "Falta información del proveedor y montos actualizados"
            }
        }


class ApprovalResponse(BaseModel):
    """Response después de aprobar/rechazar una solicitud"""
    success: bool
    id_solicitud: int
    approve: Optional[int] = Field(None, description="Valor numérico del estado (0, 1, o 2)")
    status: str = Field(..., description="Estado en string: 'requiere_correcciones', 'aprobado', o 'rechazado_definitivo'")
    comentarios: Optional[str]
    message: str
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "id_solicitud": 123,
                "approve": 1,
                "status": "aprobado",
                "comentarios": None,
                "message": "Solicitud #123 aprobada exitosamente"
            }
        }


class SolicitudStatusInfo(BaseModel):
    """Información del estado de una solicitud"""
    approve: Optional[int] = Field(None, description="NULL=Pendiente, 0=Requiere correcciones, 1=Aprobado, 2=Rechazado definitivo")
    status_label: str = Field(..., description="Etiqueta legible del estado")
    comentarios: Optional[str] = None
    
    @staticmethod
    def from_approve_value(approve: Optional[int], comentarios: Optional[str] = None) -> 'SolicitudStatusInfo':
        """Crea una instancia a partir del valor de approve"""
        status_map = {
            None: "Pendiente de Revisión",
            0: "Requiere Correcciones",
            1: "Aprobado",
            2: "Rechazado Definitivamente"
        }
        
        return SolicitudStatusInfo(
            approve=approve,
            status_label=status_map.get(approve, "Estado Desconocido"),
            comentarios=comentarios
        )