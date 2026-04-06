from sqlalchemy.orm import Session
from app.models.elegibilidad_usuario import CAT_Elegibilidad_Usuario


class ElegibilidadRepository:
    """Acceso a datos para reglas de elegibilidad de usuarios en Azure AD."""

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
        """Retorna departamentos ordenados por Prioridad (define orden en el select del frontend)."""
        return self._get_valores("departamento")

    def get_puestos(self) -> list[str]:
        return self._get_valores("puesto")
