from sqlalchemy.orm import Session
from app.models.caf_solicitud import TBL_CAF_Solicitud, SolicitudStatus

class CafSolicitudService:
    def get_detail(self, db: Session, solicitud_id: int):
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        return solicitud
    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        # Se espera que 'approve' ya venga como entero
        solicitud = TBL_CAF_Solicitud(**data)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        return solicitud

    def update(self, db: Session, solicitud_id: int, data: dict) -> TBL_CAF_Solicitud:
        # Buscar la solicitud existente
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        
        # Actualizar campos que lleguen en data
        for field, value in data.items():
            if hasattr(solicitud, field):
                setattr(solicitud, field, value)
        
        db.commit()
        db.refresh(solicitud)
        return solicitud
