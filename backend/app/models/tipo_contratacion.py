from sqlalchemy import Column, Integer, String
from app.core.database import Base

class CAT_Tipo_Contratacion(Base):
    __tablename__ = "CAT_Tipo_Contratacion"

    Id_Tipo_Contratacion = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    Tipo_Contratacion = Column(String(100), nullable=True)
    Activo = Column(Integer, nullable=True)
    Cve_Tipo = Column(String(10), nullable=True)
