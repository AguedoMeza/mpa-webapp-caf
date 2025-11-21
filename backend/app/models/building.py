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
    ADDRESS1 = Column(String(255), nullable=True)
    ZIPCODE = Column(String(10), nullable=True)
    INACTIVE = Column(String(1), nullable=True)
    
    def to_select_option(self):
        """Formato para React Select con información adicional para evitar duplicados"""
        # Formato: BLDGID - ADDRESS1 - CITY, STATE - ZIPCODE
        label_parts = [self.BLDGID]
        
        if self.ADDRESS1:
            label_parts.append(self.ADDRESS1)
        
        # Ciudad y estado juntos
        location = []
        if self.CITY:
            location.append(self.CITY)
        if self.STATE:
            location.append(self.STATE)
        if location:
            label_parts.append(", ".join(location))
        
        if self.ZIPCODE:
            label_parts.append(self.ZIPCODE)
        
        label = " - ".join(label_parts)
        
        return {
            "value": self.BLDGID,
            "label": label
        }
