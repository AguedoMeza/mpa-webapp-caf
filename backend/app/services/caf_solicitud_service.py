from sqlalchemy.orm import Session
from app.models.caf_solicitud import TBL_CAF_Solicitud, SolicitudStatus
from app.events.domain_events import SolicitudCreada, SolicitudAprobada, SolicitudRechazada
from app.events.event_dispatcher import get_event_dispatcher
import logging

logger = logging.getLogger(__name__)

class CafSolicitudService:
    def __init__(self):
        print("🏗️ Inicializando CafSolicitudService...")
        self.event_dispatcher = get_event_dispatcher()
        print(f"📡 Event dispatcher obtenido con {self.event_dispatcher.get_observers_count()} observers")
    
    def get_detail(self, db: Session, solicitud_id: int):
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        return solicitud
    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        # Remover id_solicitud si viene en los datos (es autoincrement)
        data_clean = {k: v for k, v in data.items() if k != 'id_solicitud'}
        print(f"🧹 Datos limpiados: removido id_solicitud, campos restantes: {len(data_clean)}")
        
        solicitud = TBL_CAF_Solicitud(**data_clean)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        
        # Disparar evento de solicitud creada
        try:
            print(f"🔥 Creando evento SolicitudCreada para solicitud #{solicitud.id_solicitud}")
            event = SolicitudCreada(solicitud=solicitud)
            print(f"🚀 Despachando evento SolicitudCreada para solicitud #{solicitud.id_solicitud}")
            self.event_dispatcher.dispatch(event)
            print(f"✅ Evento SolicitudCreada disparado para solicitud #{solicitud.id_solicitud}")
            logger.info(f"Evento SolicitudCreada disparado para solicitud #{solicitud.id_solicitud}")
        except Exception as e:
            print(f"❌ Error disparando evento SolicitudCreada: {str(e)}")
            logger.error(f"Error disparando evento SolicitudCreada: {str(e)}")
        
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
        
        # Disparar evento según el estado de aprobación
        try:
            if approve_status == 'aprobado':
                event = SolicitudAprobada(
                    solicitud=solicitud,
                    aprobado_por="responsable@empresa.com"  # TODO: Obtener del contexto de usuario
                )
                self.event_dispatcher.dispatch(event)
                logger.info(f"Evento SolicitudAprobada disparado para solicitud #{solicitud.id_solicitud}")
                
            elif approve_status == 'rechazado':
                event = SolicitudRechazada(
                    solicitud=solicitud,
                    rechazado_por="responsable@empresa.com",  # TODO: Obtener del contexto de usuario
                    comentarios=comentarios
                )
                self.event_dispatcher.dispatch(event)
                logger.info(f"Evento SolicitudRechazada disparado para solicitud #{solicitud.id_solicitud}")
                
        except Exception as e:
            logger.error(f"Error disparando evento de aprobación/rechazo: {str(e)}")
        
        return solicitud
