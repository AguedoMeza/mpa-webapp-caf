"""
Test simple para validar el patrón Observer sin base de datos.
"""
import sys
import os

# Agregar el directorio padre al path para importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.events.domain_events import SolicitudCreada, SolicitudAprobada, SolicitudRechazada
from app.events.event_dispatcher import EventDispatcher, Observer
from app.events.observers.email_notification_observer import EmailNotificationObserver
from datetime import datetime


class MockSolicitud:
    """Mock de TBL_CAF_Solicitud para testing."""
    def __init__(self, id_solicitud=1, tipo_contratacion="CO", responsable="Juan Pérez"):
        self.id_solicitud = id_solicitud
        self.Tipo_Contratacion = tipo_contratacion
        self.Responsable = responsable


class TestObserver(Observer):
    """Observer de prueba que solo registra eventos."""
    def __init__(self):
        self.events_received = []
    
    def can_handle(self, event_type):
        return True  # Acepta todos los eventos
    
    def handle(self, event):
        self.events_received.append(event)
        print(f"✅ TestObserver recibió: {event.__class__.__name__}")


def test_observer_pattern():
    """Test básico del patrón Observer."""
    print("🧪 Iniciando test del patrón Observer...")
    
    # 1. Crear dispatcher y observers
    dispatcher = EventDispatcher()
    test_observer = TestObserver()
    
    # 2. Suscribir observers
    dispatcher.subscribe(test_observer)
    print(f"✅ Observers suscritos: {dispatcher.get_observers_count()}")
    
    # 3. Crear solicitud mock
    solicitud_mock = MockSolicitud()
    
    # 4. Crear y despachar eventos
    events = [
        SolicitudCreada(solicitud=solicitud_mock),
        SolicitudAprobada(solicitud=solicitud_mock, aprobado_por="admin@test.com"),
        SolicitudRechazada(solicitud=solicitud_mock, rechazado_por="admin@test.com", comentarios="Faltan documentos")
    ]
    
    for event in events:
        dispatcher.dispatch(event)
    
    # 5. Verificar resultados
    print(f"✅ Eventos procesados: {len(test_observer.events_received)}")
    print(f"✅ Historial del dispatcher: {len(dispatcher.get_event_history())}")
    
    # 6. Mostrar detalles
    for i, event in enumerate(test_observer.events_received):
        print(f"   {i+1}. {event.__class__.__name__} - Solicitud #{event.solicitud_id}")
    
    print("🎉 Test del patrón Observer completado exitosamente!")


if __name__ == "__main__":
    test_observer_pattern()