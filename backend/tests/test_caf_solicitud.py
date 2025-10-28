import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import pytest
from sqlalchemy.orm import Session
from app.core.database import engine
from app.models.caf_solicitud import TBL_CAF_Solicitud

# ...resto del código...

# Test básico para verificar SELECT y conexión

def test_select_caf_solicitud():
    session = Session(bind=engine)
    try:
        # Realiza un SELECT * LIMIT 5
        results = session.query(TBL_CAF_Solicitud).limit(5).all()
        print("Registros encontrados:", results)
        # No se espera un tipo específico, solo que la consulta no falle
        assert isinstance(results, list)
    finally:
        session.close()
