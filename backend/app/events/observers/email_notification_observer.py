from typing import Type
import logging
from app.events.event_dispatcher import Observer
from app.events.domain_events import (
    DomainEvent, 
    SolicitudCreada, 
    SolicitudAprobada, 
    SolicitudRechazada
)
from app.services.email_service import email_service

# Configurar logging
logger = logging.getLogger(__name__)


class EmailNotificationObserver(Observer):
    """
    Observer que maneja el envío de correos electrónicos cuando ocurren eventos de solicitudes CAF.
    Se suscribe a: SolicitudCreada, SolicitudAprobada, SolicitudRechazada
    """
    
    def __init__(self, frontend_base_url: str = "http://localhost:3000"):
        """
        Inicializa el observer de notificaciones por correo.
        Args:
            frontend_base_url: URL base del frontend para generar links
        """
        self.frontend_base_url = frontend_base_url
        self.supported_events = {
            SolicitudCreada,
            SolicitudAprobada, 
            SolicitudRechazada
        }
        logger.info(f"EmailNotificationObserver inicializado con frontend: {frontend_base_url}")
    
    def can_handle(self, event_type: Type[DomainEvent]) -> bool:
        """
        Determina si este observer puede manejar el tipo de evento.
        Args:
            event_type: Tipo de evento del dominio
        Returns:
            bool: True si puede manejar el evento
        """
        return event_type in self.supported_events
    
    def handle(self, event: DomainEvent) -> None:
        """
        Maneja el evento recibido enviando el correo correspondiente.
        Args:
            event: El evento del dominio a procesar
        """
        try:
            if isinstance(event, SolicitudCreada):
                self._handle_solicitud_creada(event)
            elif isinstance(event, SolicitudAprobada):
                self._handle_solicitud_aprobada(event)
            elif isinstance(event, SolicitudRechazada):
                self._handle_solicitud_rechazada(event)
            else:
                logger.warning(f"Tipo de evento no soportado: {type(event).__name__}")
        except Exception as e:
            logger.error(f"Error procesando evento {type(event).__name__}: {str(e)}")
            raise
    
    def _handle_solicitud_creada(self, event: SolicitudCreada) -> None:
        """
        Envía correo de notificación cuando se crea una nueva solicitud.
        Args:
            event: Evento de solicitud creada
        """
        logger.info(f"Enviando correo de notificación para solicitud creada #{event.solicitud_id}")
        
        # TODO: Obtener email del responsable desde la base de datos o configuración
        # Por ahora usar el email del responsable de la solicitud
        responsable_email = event.responsable or "jose.serna@mpagroup.mx"  # Usar el responsable real
        
        try:
            result = email_service.send_caf_notification(
                to_email=responsable_email,
                solicitud_id=event.solicitud_id,
                tipo_contratacion=event.tipo_contratacion,
                responsable=event.responsable,
                frontend_base_url=self.frontend_base_url
            )
            
            if result.get("status") == "success":
                logger.info(f"Correo de notificación enviado exitosamente para solicitud #{event.solicitud_id}")
            else:
                logger.error(f"Error enviando correo de notificación: {result}")
                
        except Exception as e:
            logger.error(f"Excepción enviando correo de notificación: {str(e)}")
            raise
    
    def _handle_solicitud_aprobada(self, event: SolicitudAprobada) -> None:
        """
        Envía correo de confirmación cuando se aprueba una solicitud.
        Args:
            event: Evento de solicitud aprobada
        """
        logger.info(f"Enviando correo de aprobación para solicitud #{event.solicitud_id}")
        
        # TODO: Obtener email del solicitante original desde la base de datos
        solicitante_email = "jose.serna@mpagroup.mx"  # Por ahora usar email fijo
        
        try:
            result = email_service.send_caf_approval_result(
                to_email=solicitante_email,
                solicitud_id=event.solicitud_id,
                tipo_contratacion=event.tipo_contratacion,
                approved=True,
                responsable=event.aprobado_por,
                comentarios=None
            )
            
            if result.get("status") == "success":
                logger.info(f"Correo de aprobación enviado exitosamente para solicitud #{event.solicitud_id}")
            else:
                logger.error(f"Error enviando correo de aprobación: {result}")
                
        except Exception as e:
            logger.error(f"Excepción enviando correo de aprobación: {str(e)}")
            raise
    
    def _handle_solicitud_rechazada(self, event: SolicitudRechazada) -> None:
        """
        Envía correo de notificación cuando se rechaza una solicitud.
        Args:
            event: Evento de solicitud rechazada
        """
        logger.info(f"Enviando correo de rechazo para solicitud #{event.solicitud_id}")
        
        # TODO: Obtener email del solicitante original desde la base de datos
        solicitante_email = "jose.serna@mpagroup.mx"  # Por ahora usar email fijo
        
        try:
            result = email_service.send_caf_approval_result(
                to_email=solicitante_email,
                solicitud_id=event.solicitud_id,
                tipo_contratacion=event.tipo_contratacion,
                approved=False,
                responsable=event.rechazado_por,
                comentarios=event.comentarios
            )
            
            if result.get("status") == "success":
                logger.info(f"Correo de rechazo enviado exitosamente para solicitud #{event.solicitud_id}")
            else:
                logger.error(f"Error enviando correo de rechazo: {result}")
                
        except Exception as e:
            logger.error(f"Excepción enviando correo de rechazo: {str(e)}")
            raise