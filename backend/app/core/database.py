from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import pyodbc
import urllib.parse

# Cargar variables de entorno
load_dotenv()



# Selección automática del mejor driver disponible
def get_best_driver():
    """Detecta el mejor driver disponible para SQL Server"""
    available_drivers = ["ODBC Driver 18 for SQL Server", "ODBC Driver 17 for SQL Server", "SQL Server"]
    installed_drivers = pyodbc.drivers()
    for driver in available_drivers:
        if driver in installed_drivers:
            return driver
    raise Exception("No se encontró driver SQL Server compatible")



# Crear connection string usando tu configuración
driver = get_best_driver()
server = f"{os.getenv('MASTER_DB_SERVER')},{os.getenv('MASTER_DB_PORT', '1433')}"
database = os.getenv("MASTER_DB_NAME")
db_user = os.getenv("MASTER_DB_USER")
db_pass = os.getenv("MASTER_DB_PASSWORD")
# Escapar usuario y password para la URL
db_user_escaped = urllib.parse.quote_plus(db_user)
db_pass_escaped = urllib.parse.quote_plus(db_pass)

# DEBUG: Imprimir valores de conexión
print("[DEBUG] Conexión SQL Server:")
print(f"  SERVER: {server}")
print(f"  DATABASE: {database}")
print(f"  USER: {db_user}")
print(f"  DRIVER: {driver}")

# Usar siempre autenticación SQL Server (usuario y contraseña)
if not (db_user and db_pass):
    raise Exception("Debes definir MASTER_DB_USER y MASTER_DB_PASSWORD en el .env para usar autenticación SQL Server.")


# Siempre usar TrustServerCertificate para evitar problemas de SSL
DATABASE_URL = f"mssql+pyodbc://{db_user_escaped}:{db_pass_escaped}@{server}/{database}?driver={urllib.parse.quote_plus(driver)}&TrustServerCertificate=yes"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()