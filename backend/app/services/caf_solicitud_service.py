from sqlalchemy.orm import Session
from app.models.caf_solicitud import TBL_CAF_Solicitud, SolicitudStatus

class CafSolicitudService:
    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        approve_value = data.get("approve")
        if approve_value is not None:
            if isinstance(approve_value, int) and approve_value in [e.value for e in SolicitudStatus]:
                data["approve"] = SolicitudStatus(approve_value)
            else:
                data["approve"] = SolicitudStatus.revision
        solicitud = TBL_CAF_Solicitud(**data)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        return solicitud
