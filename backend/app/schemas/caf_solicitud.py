from pydantic import BaseModel, Field, validator
from typing import Optional
from app.models.caf_solicitud import SolicitudStatus


class ApprovalRequest(BaseModel):
    """Modelo para la solicitud de aprobación/rechazo."""
    approve: str = Field(..., description="Estado de la solicitud: 'revision', 'aprobado' o 'rechazado'")
    comentarios: Optional[str] = Field(None, description="Comentarios del rechazo (requerido para rechazos)")
    
    @validator('approve')
    def validate_approve_status(cls, v):
        """Valida que el estado sea uno de los valores válidos del enum."""
        valid_values = [status.name for status in SolicitudStatus]
        if v not in valid_values:
            raise ValueError(f"El estado debe ser uno de: {', '.join(valid_values)}")
        return v
    
    @validator('comentarios')
    def validate_comentarios_for_rejection(cls, v, values):
        """Valida que los comentarios sean requeridos para rechazos."""
        if 'approve' in values and values['approve'] == 'rechazado':
            if not v or not v.strip():
                raise ValueError("Los comentarios son requeridos para rechazar una solicitud")
        return v


class ApprovalResponse(BaseModel):
    """Modelo para la respuesta de aprobación/rechazo."""
    success: bool
    id_solicitud: int
    approve: int
    status: str
    comentarios: Optional[str]
    message: str