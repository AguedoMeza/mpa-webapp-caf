from datetime import datetime
from typing import Optional
from app.models.caf_solicitud import TBL_CAF_Solicitud


class DomainEvent:
    """Clase base para todos los eventos del dominio."""
    
    def __init__(self, timestamp: Optional[datetime] = None):
        self.timestamp = timestamp or datetime.now()


class SolicitudCreada(DomainEvent):
    """Evento disparado cuando se crea una nueva solicitud CAF."""
    
    def __init__(self, solicitud: TBL_CAF_Solicitud, timestamp: Optional[datetime] = None):
        super().__init__(timestamp)
        self.solicitud = solicitud
    
    @property
    def solicitud_id(self) -> int:
        return self.solicitud.id_solicitud
    
    @property
    def tipo_contratacion(self) -> str:
        return self.solicitud.Tipo_Contratacion or "N/A"
    
    @property
    def responsable(self) -> str:
        return self.solicitud.Responsable or "N/A"


class SolicitudAprobada(DomainEvent):
    """Evento disparado cuando se aprueba una solicitud CAF."""
    
    def __init__(self, solicitud: TBL_CAF_Solicitud, aprobado_por: str, timestamp: Optional[datetime] = None):
        super().__init__(timestamp)
        self.solicitud = solicitud
        self.aprobado_por = aprobado_por  # Email o nombre del responsable que aprobó
    
    @property
    def solicitud_id(self) -> int:
        return self.solicitud.id_solicitud
    
    @property
    def tipo_contratacion(self) -> str:
        return self.solicitud.Tipo_Contratacion or "N/A"


class SolicitudRechazada(DomainEvent):
    """Evento disparado cuando se rechaza una solicitud CAF."""
    
    def __init__(self, solicitud: TBL_CAF_Solicitud, rechazado_por: str, comentarios: str, timestamp: Optional[datetime] = None):
        super().__init__(timestamp)
        self.solicitud = solicitud
        self.rechazado_por = rechazado_por  # Email o nombre del responsable que rechazó
        self.comentarios = comentarios  # Motivo del rechazo
    
    @property
    def solicitud_id(self) -> int:
        return self.solicitud.id_solicitud
    
    @property
    def tipo_contratacion(self) -> str:
        return self.solicitud.Tipo_Contratacion or "N/A"


class SolicitudActualizada(DomainEvent):
    """Evento disparado cuando se actualiza una solicitud CAF."""
    
    def __init__(self, solicitud: TBL_CAF_Solicitud, campos_modificados: list, timestamp: Optional[datetime] = None):
        super().__init__(timestamp)
        self.solicitud = solicitud
        self.campos_modificados = campos_modificados  # Lista de campos que cambiaron
    
    @property
    def solicitud_id(self) -> int:
        return self.solicitud.id_solicitud