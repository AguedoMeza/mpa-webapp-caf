from fastapi import APIRouter
from app.events.observer_initializer import get_observers_status
from app.events.event_dispatcher import get_event_dispatcher

router = APIRouter()


@router.get("/observers/status")
def get_observer_status():
    """
    Endpoint de debugging para ver el estado de los observers.
    """
    return get_observers_status()


@router.get("/observers/events")
def get_event_history():
    """
    Endpoint de debugging para ver el historial de eventos procesados.
    """
    dispatcher = get_event_dispatcher()
    events = dispatcher.get_event_history()
    
    return {
        "total_events": len(events),
        "events": [
            {
                "type": event.__class__.__name__,
                "timestamp": event.timestamp.isoformat(),
                "solicitud_id": getattr(event, 'solicitud_id', None)
            }
            for event in events[-10:]  # Últimos 10 eventos
        ]
    }


@router.post("/observers/clear-history")
def clear_event_history():
    """
    Endpoint de debugging para limpiar el historial de eventos.
    """
    dispatcher = get_event_dispatcher()
    dispatcher.clear_history()
    return {"message": "Historial de eventos limpiado"}