from sqlalchemy import Column, Integer, String
from app.core.database import Base

class CAT_Tipo_Trabajo(Base):
    __tablename__ = "CAT_Tipo_Trabajo"

    Id_Tipo_Trabajo = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    Tipo_Trabajo = Column(String(100), nullable=True)
    Activo = Column(Integer, nullable=True)
