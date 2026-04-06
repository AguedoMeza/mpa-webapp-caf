from sqlalchemy import Column, Integer, String
from app.core.database import Base


class CAT_Elegibilidad_Usuario(Base):
    __tablename__ = "CAT_Elegibilidad_Usuario"
    __table_args__ = {"schema": "BD_AppsHub.dbo"}

    Id_Elegibilidad = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    Tipo_Regla      = Column(String(20),  nullable=False)   # 'dominio' | 'departamento' | 'puesto'
    Valor           = Column(String(100), nullable=False)
    Activo          = Column(Integer,     nullable=False, default=1)
    Prioridad       = Column(Integer,     nullable=False, default=0)
