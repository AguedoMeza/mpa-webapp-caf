from sqlalchemy.orm import Session
from app.models.caf_solicitud import TBL_CAF_Solicitud, SolicitudStatus

class CafSolicitudService:
    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        # Se espera que 'approve' ya venga como entero
        solicitud = TBL_CAF_Solicitud(**data)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        return solicitud
