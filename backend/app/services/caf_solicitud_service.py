from sqlalchemy.orm import Session
from app.models.caf_solicitud import TBL_CAF_Solicitud, SolicitudStatus

class CafSolicitudService:
    def get_detail(self, db: Session, solicitud_id: int):
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        return solicitud
    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        # Se espera que 'approve' ya venga como entero
        solicitud = TBL_CAF_Solicitud(**data)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        return solicitud

    def update(self, db: Session, solicitud_id: int, data: dict) -> TBL_CAF_Solicitud:
        # Buscar la solicitud existente
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        
        # Actualizar campos que lleguen en data
        for field, value in data.items():
            if hasattr(solicitud, field):
                setattr(solicitud, field, value)
        
        db.commit()
        db.refresh(solicitud)
        return solicitud

    def approve_or_reject(self, db: Session, solicitud_id: int, approve_status: str, comentarios: str = None) -> TBL_CAF_Solicitud:
        """
        Aprueba o rechaza una solicitud CAF.
        Args:
            db: Sesión de base de datos
            solicitud_id: ID de la solicitud
            approve_status: Estado ('revision', 'aprobado', 'rechazado')
            comentarios: Comentarios del rechazo (opcional, solo para rechazos)
        Returns:
            TBL_CAF_Solicitud: Solicitud actualizada
        """
        # Convertir string a valor del enum
        try:
            status_enum = SolicitudStatus[approve_status]
            approve_value = status_enum.value
        except KeyError:
            valid_statuses = [status.name for status in SolicitudStatus]
            raise ValueError(f"El estado debe ser uno de: {', '.join(valid_statuses)}")
        
        # Buscar la solicitud existente
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        
        # Actualizar el estado de aprobación
        solicitud.approve = approve_value
        
        # Los comentarios solo se permiten y se requieren para rechazos
        if approve_status == 'rechazado':
            if not comentarios or not comentarios.strip():
                raise ValueError("Los comentarios son requeridos para rechazar una solicitud")
            solicitud.Comentarios = comentarios.strip()
        elif approve_status == 'aprobado':
            # Limpiar comentarios previos si se aprueba
            solicitud.Comentarios = None
        
        db.commit()
        db.refresh(solicitud)
        
        # TODO: Aquí se disparará el evento del patrón Observer
        # self._dispatch_approval_event(solicitud, approve_status, comentarios)
        
        return solicitud
