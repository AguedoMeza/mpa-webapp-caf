from sqlalchemy.orm import Session
from app.models.caf_solicitud import TBL_CAF_Solicitud

class CafSolicitudService:
    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        solicitud = TBL_CAF_Solicitud(**data)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        return solicitud
