"""
Mock observer para testing de correos sin configuración real.
"""
from typing import Type
import logging
from app.events.event_dispatcher import Observer
from app.events.domain_events import (
    DomainEvent, 
    SolicitudCreada, 
    SolicitudAprobada, 
    SolicitudRechazada
)

logger = logging.getLogger(__name__)


class MockEmailObserver(Observer):
    """Observer mock que simula el envío de correos para testing."""
    
    def __init__(self, frontend_base_url: str = "http://localhost:3000"):
        self.frontend_base_url = frontend_base_url
        self.supported_events = {SolicitudCreada, SolicitudAprobada, SolicitudRechazada}
        self.emails_sent = []  # Para tracking en testing
        print("📧 MockEmailObserver inicializado (modo testing)")
    
    def can_handle(self, event_type: Type[DomainEvent]) -> bool:
        return event_type in self.supported_events
    
    def handle(self, event: DomainEvent) -> None:
        try:
            if isinstance(event, SolicitudCreada):
                self._mock_solicitud_creada(event)
            elif isinstance(event, SolicitudAprobada):
                self._mock_solicitud_aprobada(event)
            elif isinstance(event, SolicitudRechazada):
                self._mock_solicitud_rechazada(event)
        except Exception as e:
            logger.error(f"Error en mock email observer: {str(e)}")
    
    def _mock_solicitud_creada(self, event: SolicitudCreada) -> None:
        email_data = {
            "to": event.responsable,
            "subject": f"Nueva Solicitud CAF #{event.solicitud_id} - Requiere Aprobación",
            "type": "nueva_solicitud",
            "solicitud_id": event.solicitud_id,
            "tipo_contratacion": event.tipo_contratacion,
            "link": f"{self.frontend_base_url}/#/formato-co/{event.solicitud_id}"
        }
        
        self.emails_sent.append(email_data)
        print(f"📧 [MOCK EMAIL] Nueva solicitud #{event.solicitud_id}")
        print(f"   Para: {email_data['to']}")
        print(f"   Asunto: {email_data['subject']}")
        print(f"   Link: {email_data['link']}")
        print(f"   ✅ Email simulado enviado correctamente")
    
    def _mock_solicitud_aprobada(self, event: SolicitudAprobada) -> None:
        email_data = {
            "to": "jose.serna@mpagroup.mx",
            "subject": f"Solicitud CAF #{event.solicitud_id} - Aprobada",
            "type": "aprobada",
            "solicitud_id": event.solicitud_id,
            "aprobado_por": event.aprobado_por
        }
        
        self.emails_sent.append(email_data)
        print(f"📧 [MOCK EMAIL] Solicitud aprobada #{event.solicitud_id}")
        print(f"   Para: {email_data['to']}")
        print(f"   Asunto: {email_data['subject']}")
        print(f"   Aprobado por: {event.aprobado_por}")
        print(f"   ✅ Email de aprobación simulado enviado")
    
    def _mock_solicitud_rechazada(self, event: SolicitudRechazada) -> None:
        email_data = {
            "to": "jose.serna@mpagroup.mx", 
            "subject": f"Solicitud CAF #{event.solicitud_id} - Rechazada",
            "type": "rechazada",
            "solicitud_id": event.solicitud_id,
            "rechazado_por": event.rechazado_por,
            "comentarios": event.comentarios
        }
        
        self.emails_sent.append(email_data)
        print(f"📧 [MOCK EMAIL] Solicitud rechazada #{event.solicitud_id}")
        print(f"   Para: {email_data['to']}")
        print(f"   Asunto: {email_data['subject']}")
        print(f"   Rechazado por: {event.rechazado_por}")
        print(f"   Motivo: {event.comentarios}")
        print(f"   ✅ Email de rechazo simulado enviado")
    
    def get_sent_emails(self):
        """Retorna los emails enviados para testing."""
        return self.emails_sent.copy()
    
    def clear_sent_emails(self):
        """Limpia el historial para testing."""
        self.emails_sent.clear()