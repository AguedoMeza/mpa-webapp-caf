# Arquitectura de Archivos para Sistema de Aprobación/Rechazo CAF
## (Patrón Observer + Microsoft Graph Email)

## Backend (FastAPI + SQLAlchemy)

### 1. Domain Events / Observer Pattern
```
backend/app/events/
├── __init__.py
├── domain_events.py          # Eventos: SolicitudCreada, SolicitudAprobada, SolicitudRechazada
├── event_dispatcher.py       # Despachador central de eventos (Subject)
└── observers/
    ├── __init__.py
    └── email_notification_observer.py    # Observer para envío de correos
```

### 2. Servicios de Notificación
```
backend/app/services/
├── caf_solicitud_service.py             # (Existente - modificar para disparar eventos)
├── email_service.py                     # Servicio para Microsoft Graph API
└── notification_service.py              # Orquestador de notificaciones
```

### 3. APIs
```
backend/app/api/
├── caf_solicitud.py                     # (Existente - agregar endpoint PATCH /approval)
└── approval.py                          # Endpoints específicos de aprobación/rechazo
```

### 4. Configuración
```
backend/app/config/
├── __init__.py
├── settings.py                          # Configuración de Microsoft Graph
└── email_templates.py                  # Plantillas de correo HTML
```

## Frontend (React + TypeScript)

### 1. Componentes de Aprobación
```
frontend/src/components/Approval/
├── ApprovalSection.tsx                  # Sección con botones Aprobar/Rechazar
├── ApprovalStatus.tsx                   # Indicador visual del estado actual
└── RejectModal.tsx                      # Modal para capturar comentarios de rechazo
```

### 2. Servicios
```
frontend/src/services/
└── caf-solicitud.service.ts             # (Existente - usar método updateApprovalStatus)
```

### 3. Tipos
```
frontend/src/types/
├── caf-solicitud.types.ts               # (Existente - agregar enum ApprovalStatus)
└── approval.types.ts                    # Tipos específicos del flujo de aprobación
```

### 4. Vista Especial para Responsables
```
frontend/src/components/ApprovalView/
└── ApprovalView.tsx                     # Vista de solo lectura + botones de acción
```

## Configuración y Variables de Entorno

### Backend
```
backend/.env
# Agregar variables de Microsoft Graph:
# GRAPH_CLIENT_ID=...
# GRAPH_CLIENT_SECRET=...
# GRAPH_TENANT_ID=...
# EMAIL_FROM=...
# FRONTEND_BASE_URL=http://localhost:3000
```

### Frontend
```
frontend/.env
# (Mantener existentes)
# REACT_APP_API_URL=http://localhost:8000
```

## Flujo del Patrón Observer

### 1. **Subject (Observable)**
- `EventDispatcher` mantiene lista de observers
- Dispara eventos cuando cambia el estado de solicitudes

### 2. **Observers**
- `EmailNotificationObserver` se suscribe a eventos específicos
- Reacciona automáticamente enviando correos

### 3. **Events (Notifications)**
- `SolicitudCreada` → Enviar correo de notificación al Responsable
- `SolicitudAprobada` → Enviar correo de confirmación de aprobación
- `SolicitudRechazada` → Enviar correo de notificación de rechazo

### 4. **Publishers**
- `CafSolicitudService` dispara eventos sin conocer a los observers (desacoplamiento)

## Flujo Principal Simplificado

1. **Creación** → `CafSolicitudService.create()` → dispara `SolicitudCreada` → `EmailNotificationObserver` → envía correo al Responsable con link
2. **Aprobación** → Botón "Aprobar" → API PATCH `/caf-solicitud/{id}/approval` → Service dispara `SolicitudAprobada` → Observer notifica por correo
3. **Rechazo** → Botón "Rechazar" → Modal captura comentarios → API PATCH con comentarios → Service dispara `SolicitudRechazada` → Observer notifica por correo con comentarios
4. **Acceso por URL** → Responsable accede via link → `ApprovalView` carga datos → Botones de acción

## Detalle del Flujo de Estados

```mermaid
graph TD
    A[Usuario crea solicitud] --> B[CafSolicitudService.create()]
    B --> C[Estado: revision = 0]
    B --> D[Dispara SolicitudCreada]
    D --> E[EmailNotificationObserver]
    E --> F[Envía correo al Responsable]
    F --> G[Responsable recibe link: /formato-xx/ID]
    G --> H[Responsable accede y ve datos]
    H --> I{Decisión}
    I -->|Aprobar| J[PATCH /approval - approve=1]
    I -->|Rechazar| K[PATCH /approval - approve=2]
    J --> L[Dispara SolicitudAprobada]
    K --> M[Dispara SolicitudRechazada]
    L --> N[Correo de confirmación]
    M --> O[Correo de rechazo]
```

## Estructura de Correos

### Correo de Notificación (SolicitudCreada)
```html
Asunto: Nueva Solicitud CAF #{id} - Requiere Aprobación
Contenido: 
- Detalles de la solicitud
- Link directo: http://localhost:3000/#/formato-co/{id}
- Botones: Aprobar | Rechazar
```

### Correo de Resultado (Aprobada/Rechazada)
```html
Asunto: Solicitud CAF #{id} - {Estado}
Contenido:
- Confirmación de la decisión
- Detalles finales
- Comentarios del rechazo (solo si fue rechazada)
- Próximos pasos (si aplica)
```

## Ventajas de esta Arquitectura

- ✅ **Desacoplamiento**: Service no conoce directamente el sistema de correos
- ✅ **Extensibilidad**: Fácil agregar nuevos observers (SMS, push notifications, etc)
- ✅ **Mantenibilidad**: Cada componente tiene una responsabilidad específica
- ✅ **Testabilidad**: Observers se pueden probar independientemente
- ✅ **Clean Code**: Nomenclatura estándar del patrón Observer
- ✅ **Escalabilidad**: Múltiples observers pueden reaccionar al mismo evento

## Implementación por Fases

### Fase 1: Base del Observer Pattern
- [ ] `domain_events.py`
- [ ] `event_dispatcher.py`
- [ ] Modificar `caf_solicitud_service.py`

### Fase 2: Email Observer
- [ ] `email_notification_observer.py`
- [ ] `email_service.py` (Microsoft Graph)
- [ ] `email_templates.py`

### Fase 3: API de Aprobación
- [ ] Endpoint PATCH `/caf-solicitud/{id}/approval`
- [ ] `approval.py` (endpoints adicionales)

### Fase 4: Frontend
- [ ] `ApprovalSection.tsx`
- [ ] `ApprovalStatus.tsx`
- [ ] `ApprovalView.tsx`
- [ ] `RejectModal.tsx` (modal para capturar comentarios de rechazo)
- [ ] Integrar en formularios existentes

**Total estimado:** ~10-12 archivos nuevos/modificados