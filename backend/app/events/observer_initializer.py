"""
Inicializador de observers del sistema CAF.
Se encarga de registrar todos los observers al event dispatcher al inicio de la aplicación.
"""
import logging
from app.events.event_dispatcher import get_event_dispatcher
from app.events.observers.email_notification_observer import EmailNotificationObserver

logger = logging.getLogger(__name__)


def initialize_observers(frontend_base_url: str = "http://localhost:3000") -> None:
    """
    Inicializa y registra todos los observers del sistema.
    Args:
        frontend_base_url: URL base del frontend para generar links en correos
    """
    logger.info("Inicializando observers del sistema CAF...")
    
    # Obtener el event dispatcher singleton
    dispatcher = get_event_dispatcher()
    
    # Crear y registrar observer de correos
    email_observer = EmailNotificationObserver(frontend_base_url=frontend_base_url)
    dispatcher.subscribe(email_observer)
    
    logger.info(f"Observers inicializados correctamente. Total: {dispatcher.get_observers_count()}")


def get_observers_status() -> dict:
    """
    Retorna el estado actual de los observers registrados.
    Returns:
        dict: Información sobre observers y eventos
    """
    dispatcher = get_event_dispatcher()
    return {
        "observers_count": dispatcher.get_observers_count(),
        "events_processed": len(dispatcher.get_event_history()),
        "status": "active"
    }