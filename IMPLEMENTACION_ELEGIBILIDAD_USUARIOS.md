# Plan de Implementación: Elegibilidad de Usuarios desde BD

Migrar las reglas de elegibilidad de usuarios (dominios, departamentos, puestos) de listas
hardcodeadas en `UserService` a una tabla de catálogo en SQL Server.

---

## Motivación

**Problema actual (`user_service.py`):**
- `ALLOWED_DOMAINS`, `ALLOWED_DEPARTMENTS`, `ALLOWED_JOB_TITLES` son listas estáticas en código
- Agregar/quitar un puesto o departamento requiere modificar código y hacer deploy
- `UserService` tiene dos razones para cambiar: lógica de Graph API Y reglas de negocio **(viola SRP)**

**Solución:** Catálogo en BD + repositorio separado → `UserService` solo orquesta, no configura.

---

## Arquitectura resultante (Separation of Concerns)

```
┌──────────────────────────────────────────┐
│  API Layer  /api/users                   │
│  users.py — solo HTTP                    │
└──────────────────────────┬───────────────┘
                           ▼
┌──────────────────────────────────────────┐
│  Service Layer                           │
│  UserService — orquesta Graph API        │
│               + aplica reglas            │
└────────────┬─────────────┬──────────────┘
             ▼             ▼
┌────────────────┐  ┌──────────────────────┐
│  Graph API     │  │  ElegibilidadRepo     │
│  (Azure AD)    │  │  Lee CAT_Elegibilidad │
│                │  │  desde SQL Server     │
└────────────────┘  └──────────────────────┘
```

---

## Paso 1 — Script SQL (SQL Server)

```sql
-- ============================================================
-- Tabla catálogo: reglas de elegibilidad de usuarios en AD
-- Tipos de regla: 'dominio', 'departamento', 'puesto'
-- ============================================================
CREATE TABLE CAT_Elegibilidad_Usuario (
    Id_Elegibilidad   INT           NOT NULL IDENTITY(1,1),
    Tipo_Regla        VARCHAR(20)   NOT NULL,   -- 'dominio' | 'departamento' | 'puesto'
    Valor             VARCHAR(100)  NOT NULL,
    Activo            INT           NOT NULL DEFAULT 1,
    Prioridad         INT           NOT NULL DEFAULT 0,  -- menor = aparece primero en el select

    CONSTRAINT PK_CAT_Elegibilidad_Usuario PRIMARY KEY (Id_Elegibilidad),
    CONSTRAINT UQ_Elegibilidad_TipoValor   UNIQUE (Tipo_Regla, Valor),
    CONSTRAINT CK_Elegibilidad_TipoRegla   CHECK (Tipo_Regla IN ('dominio', 'departamento', 'puesto'))
);
GO

-- Índice para filtrar por tipo (query principal)
CREATE NONCLUSTERED INDEX IX_CAT_Elegibilidad_TipoActivo
    ON CAT_Elegibilidad_Usuario (Tipo_Regla, Activo)
    INCLUDE (Valor, Prioridad);
GO

-- ============================================================
-- Datos iniciales (valores actuales del código)
-- ============================================================

-- Dominios
INSERT INTO CAT_Elegibilidad_Usuario (Tipo_Regla, Valor, Activo, Prioridad) VALUES
    ('dominio', '@mpagroup.mx',    1, 0),
    ('dominio', '@macquarie.com',  1, 1);

-- Departamentos (Prioridad define orden en el select del frontend)
INSERT INTO CAT_Elegibilidad_Usuario (Tipo_Regla, Valor, Activo, Prioridad) VALUES
    ('departamento', 'Property Management',    1, 0),
    ('departamento', 'Information Technology', 1, 1),
    ('departamento', 'Engineering',            1, 2);

-- Puestos habilitados
INSERT INTO CAT_Elegibilidad_Usuario (Tipo_Regla, Valor, Activo, Prioridad) VALUES
    ('puesto', 'Admin Property Management', 1, 0),
    ('puesto', 'Jr Property Manager',       1, 1),
    ('puesto', 'Administrative Manager',    1, 2),
    ('puesto', 'Leasing Administrator',     1, 3),
    ('puesto', 'PSP Analyst',               1, 4),
    ('puesto', 'PSP Manager',               1, 5),
    ('puesto', 'PSP Jr. Analyst',           1, 6),
    ('puesto', 'Staff Accountant',          1, 7);

-- Puestos deshabilitados (conservados para historial)
INSERT INTO CAT_Elegibilidad_Usuario (Tipo_Regla, Valor, Activo, Prioridad) VALUES
    ('puesto', 'Property Manager & Park Specialist', 0, 99),
    ('puesto', 'Building Risk Manager',              0, 99),
    ('puesto', 'WHSE Manager',                       0, 99),
    ('puesto', 'Jr. Accountant',                     0, 99);
GO
```

> **Nota SQL Server:** El índice `IX_CAT_Elegibilidad_TipoActivo` es *covering* para la query
> `WHERE Tipo_Regla = ? AND Activo = 1` — evita table scan sin importar el volumen del catálogo.

---

## Paso 2 — Modelo SQLAlchemy

**Archivo:** `backend/app/models/elegibilidad_usuario.py`

```python
from sqlalchemy import Column, Integer, String
from app.core.database import Base


class CAT_Elegibilidad_Usuario(Base):
    __tablename__ = "CAT_Elegibilidad_Usuario"

    Id_Elegibilidad = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    Tipo_Regla      = Column(String(20),  nullable=False)   # 'dominio' | 'departamento' | 'puesto'
    Valor           = Column(String(100), nullable=False)
    Activo          = Column(Integer,     nullable=False, default=1)
    Prioridad       = Column(Integer,     nullable=False, default=0)
```

Registrar en `backend/app/models/__init__.py`:
```python
from .elegibilidad_usuario import CAT_Elegibilidad_Usuario
```

---

## Paso 3 — Repositorio de elegibilidad (SRP)

**Archivo:** `backend/app/repositories/elegibilidad_repository.py`

> Separar acceso a datos del servicio sigue el principio de **Single Responsibility**:
> el repositorio tiene una sola razón para cambiar (estructura de BD), el servicio tiene otra
> (lógica de filtrado con Graph API).

```python
from sqlalchemy.orm import Session
from app.models.elegibilidad_usuario import CAT_Elegibilidad_Usuario


class ElegibilidadRepository:
    """Acceso a datos para reglas de elegibilidad de usuarios."""

    def __init__(self, db: Session):
        self._db = db

    def _get_valores(self, tipo_regla: str) -> list[str]:
        rows = (
            self._db.query(CAT_Elegibilidad_Usuario.Valor)
            .filter(
                CAT_Elegibilidad_Usuario.Tipo_Regla == tipo_regla,
                CAT_Elegibilidad_Usuario.Activo == 1,
            )
            .order_by(CAT_Elegibilidad_Usuario.Prioridad)
            .all()
        )
        return [row.Valor for row in rows]

    def get_dominios(self) -> list[str]:
        return self._get_valores("dominio")

    def get_departamentos(self) -> list[str]:
        """Retorna departamentos ordenados por Prioridad (define orden en el select)."""
        return self._get_valores("departamento")

    def get_puestos(self) -> list[str]:
        return self._get_valores("puesto")
```

---

## Paso 4 — Modificar `UserService`

**Cambios en** `backend/app/services/user_service.py`:

- Eliminar `ALLOWED_DOMAINS`, `ALLOWED_DEPARTMENTS`, `ALLOWED_JOB_TITLES`
- Recibir `db: Session` por inyección de dependencia (constructor)
- Delegar lectura de reglas al repositorio

```python
# ANTES (listas hardcodeadas en clase)
class UserService:
    ALLOWED_DOMAINS = ["@mpagroup.mx", "@macquarie.com"]
    ALLOWED_DEPARTMENTS = ["Property Management", ...]
    ALLOWED_JOB_TITLES = ["Admin Property Management", ...]

# DESPUÉS (composición con repositorio)
class UserService:
    def __init__(self, db: Session):
        self._repo = ElegibilidadRepository(db)
        # ... config de Graph API igual que antes

    def list_users(self, max_results: int = 999):
        dominios     = self._repo.get_dominios()
        departamentos = self._repo.get_departamentos()   # ya vienen ordenados por Prioridad
        puestos      = self._repo.get_puestos()

        # lógica de filtrado igual, usando variables locales en vez de self.ALLOWED_*
        ...
```

---

## Paso 5 — Actualizar endpoint

**En** `backend/app/api/users.py`, inyectar `db` con `Depends(get_db)`:

```python
from app.core.database import get_db
from sqlalchemy.orm import Session

@router.get("/users", status_code=status.HTTP_200_OK, response_model=UserListResponse)
def list_directory_users(db: Session = Depends(get_db)):
    try:
        service = UserService(db)
        return service.list_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener usuarios: {str(e)}")
```

> El singleton `user_service = UserService()` al final del archivo se elimina.

---

## Resumen de archivos afectados

| Acción     | Archivo                                              |
|------------|------------------------------------------------------|
| CREAR      | `backend/app/models/elegibilidad_usuario.py`         |
| CREAR      | `backend/app/repositories/elegibilidad_repository.py`|
| MODIFICAR  | `backend/app/services/user_service.py`               |
| MODIFICAR  | `backend/app/api/users.py`                           |
| MODIFICAR  | `backend/app/models/__init__.py`                     |
| EJECUTAR   | Script SQL en la base de datos del proyecto          |

---

## Para agregar un nuevo puesto sin tocar código

```sql
-- Habilitar puesto existente
UPDATE CAT_Elegibilidad_Usuario
SET Activo = 1
WHERE Tipo_Regla = 'puesto' AND Valor = 'Building Risk Manager';

-- Agregar puesto nuevo
INSERT INTO CAT_Elegibilidad_Usuario (Tipo_Regla, Valor, Activo, Prioridad)
VALUES ('puesto', 'Facilities Manager', 1, 8);
```

Sin deploy. Sin modificar código Python.
