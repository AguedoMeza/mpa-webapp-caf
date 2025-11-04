import os
from typing import Dict
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Settings:
    """
    Configuración de la aplicación.
    Centraliza todas las variables de entorno y configuraciones.
    """
    
    # Configuración de SharePoint
    SHAREPOINT_CONFIG: Dict[str, str] = {
        "client_id": os.getenv("SP_CLIENT_ID"),
        "client_secret": os.getenv("SP_CLIENT_SECRET"),
        "tenant_id": os.getenv("SP_TENANT_ID"),
        "site_url": os.getenv("SP_SITE_URL"),
        "site_path": os.getenv("SP_SITE_PATH"),
        "authority": os.getenv("SP_AUTHORITY"),
        "scope": ["https://graph.microsoft.com/.default"]
    }
    
    # Configuración de Microsoft Graph para correos
    GRAPH_CONFIG: Dict[str, str] = {
        "client_id": os.getenv("GRAPH_CLIENT_ID"),
        "client_secret": os.getenv("GRAPH_CLIENT_SECRET"),
        "tenant_id": os.getenv("GRAPH_TENANT_ID"),
        "authority": os.getenv("GRAPH_AUTHORITY"),
        "scope": ["https://graph.microsoft.com/.default"],
        "sender_email": os.getenv("GRAPH_SENDER_EMAIL", "noreply@empresa.com")
    }
    
    # URL base del frontend para links en correos
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    
   
# Instancia singleton de configuración
settings = Settings()
