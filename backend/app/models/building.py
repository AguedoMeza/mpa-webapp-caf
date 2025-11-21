from sqlalchemy import Column, String
from app.core.database import Base


class CAT_BUILDINGS(Base):
    """
    Modelo ligero para el catálogo de edificios.
    Solo campos necesarios para el select.
    Tabla ubicada en BD_MPA_VCAP.dbo.CAT_BUILDINGS
    """
    __tablename__ = "CAT_BUILDINGS"
    __table_args__ = {"schema": "BD_MPA_VCAP.dbo"}
    
    BLDGID = Column(String(6), primary_key=True, nullable=False)
    BLDGNAME = Column(String(255), nullable=True)
    CITY = Column(String(255), nullable=True)
    STATE = Column(String(10), nullable=True)
    INACTIVE = Column(String(1), nullable=True)
    
    def to_select_option(self):
        """Formato para React Select"""
        label = f"{self.BLDGID}"
        if self.BLDGNAME:
            label += f" - {self.BLDGNAME}"
        if self.CITY:
            label += f" - {self.CITY}"
        if self.STATE:
            label += f", {self.STATE}"
        
        return {
            "value": self.BLDGID,
            "label": label
        }
