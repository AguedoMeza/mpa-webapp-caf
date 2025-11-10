from abc import ABC, abstractmethod
from typing import List, Dict, Type
from app.events.domain_events import DomainEvent
import logging

# Configurar logging
logger = logging.getLogger(__name__)


class Observer(ABC):
    """Interfaz base para todos los observers."""
    
    @abstractmethod
    def handle(self, event: DomainEvent) -> None:
        """
        Maneja el evento recibido.
        Args:
            event: El evento del dominio a procesar
        """
        pass
    
    @abstractmethod
    def can_handle(self, event_type: Type[DomainEvent]) -> bool:
        """
        Determina si este observer puede manejar el tipo de evento.
        Args:
            event_type: Tipo de evento del dominio
        Returns:
            bool: True si puede manejar el evento
        """
        pass


class EventDispatcher:
    """
    Despachador central de eventos (Subject del patrón Observer).
    Mantiene la lista de observers y los notifica cuando ocurren eventos.
    """
    
    def __init__(self):
        self._observers: List[Observer] = []
        self._event_history: List[DomainEvent] = []  # Para debugging/auditoría
    
    def subscribe(self, observer: Observer) -> None:
        """
        Suscribe un observer para recibir notificaciones de eventos.
        Args:
            observer: Observer a suscribir
        """
        if observer not in self._observers:
            self._observers.append(observer)
            logger.info(f"Observer {observer.__class__.__name__} suscrito correctamente")
        else:
            logger.warning(f"Observer {observer.__class__.__name__} ya está suscrito")
    
    def unsubscribe(self, observer: Observer) -> None:
        """
        Desuscribe un observer.
        Args:
            observer: Observer a desuscribir
        """
        try:
            self._observers.remove(observer)
            logger.info(f"Observer {observer.__class__.__name__} desuscrito correctamente")
        except ValueError:
            logger.warning(f"Observer {observer.__class__.__name__} no estaba suscrito")
    
    def dispatch(self, event: DomainEvent) -> None:
        """
        Despacha un evento a todos los observers que puedan manejarlo.
        Args:
            event: Evento del dominio a despachar
        """
        logger.info(f"Despachando evento {event.__class__.__name__} - ID: {getattr(event, 'solicitud_id', 'N/A')}")
        
        # Guardar en historial para auditoría
        self._event_history.append(event)
        
        # Notificar a observers interesados
        handled_count = 0
        for observer in self._observers:
            try:
                if observer.can_handle(type(event)):
                    observer.handle(event)
                    handled_count += 1
                    logger.debug(f"Observer {observer.__class__.__name__} procesó {event.__class__.__name__}")
            except Exception as e:
                # Log del error pero no detener el flujo para otros observers
                logger.error(f"Error en observer {observer.__class__.__name__}: {str(e)}")
        
        logger.info(f"Evento {event.__class__.__name__} procesado por {handled_count} observers")
    
    def get_observers_count(self) -> int:
        """Retorna el número de observers suscritos."""
        return len(self._observers)
    
    def get_event_history(self) -> List[DomainEvent]:
        """Retorna el historial de eventos para debugging."""
        return self._event_history.copy()
    
    def clear_history(self) -> None:
        """Limpia el historial de eventos."""
        self._event_history.clear()
        logger.info("Historial de eventos limpiado")


# Singleton global del event dispatcher
_event_dispatcher_instance = None

def get_event_dispatcher() -> EventDispatcher:
    """
    Obtiene la instancia singleton del event dispatcher.
    Returns:
        EventDispatcher: Instancia única del despachador
    """
    global _event_dispatcher_instance
    if _event_dispatcher_instance is None:
        _event_dispatcher_instance = EventDispatcher()
        logger.info("EventDispatcher singleton inicializado")
    return _event_dispatcher_instance