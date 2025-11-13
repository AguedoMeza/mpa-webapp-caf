"""
Inicializador de observers del sistema CAF.
Se encarga de registrar todos los observers al event dispatcher al inicio de la aplicación.
"""
import logging
from app.core.config import settings
from app.events.event_dispatcher import get_event_dispatcher
from app.events.observers.email_notification_observer import EmailNotificationObserver

logger = logging.getLogger(__name__)


def initialize_observers(frontend_base_url: str = None) -> None:
    """
    Inicializa y registra todos los observers del sistema.
    Args:
        frontend_base_url: URL base del frontend para generar links en correos.
                          Si no se proporciona, se usa FRONTEND_BASE_URL del .env
    """
    # Usar URL del .env si no se proporciona parámetro
    if frontend_base_url is None:
        frontend_base_url = settings.FRONTEND_BASE_URL
    
    logger.info(f"Inicializando observers del sistema CAF con frontend URL: {frontend_base_url}")
    
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