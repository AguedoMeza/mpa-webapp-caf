import msal
import requests
from app.core.config import settings


class UserService:
    """
    Servicio para consultar usuarios del directorio de Azure AD.
    Reutiliza la configuración de Graph API existente.
    """
    
    def __init__(self):
        self.client_id = settings.GRAPH_CONFIG["client_id"]
        self.client_secret = settings.GRAPH_CONFIG["client_secret"]
        self.authority = settings.GRAPH_CONFIG["authority"]
        self.scope = settings.GRAPH_CONFIG["scope"]
        self.token = None

    def get_access_token(self):
        """Obtiene token de acceso para Graph API."""
        app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
        result = app.acquire_token_for_client(scopes=self.scope)
        
        if "access_token" in result:
            self.token = result["access_token"]
            return self.token
        else:
            raise Exception(f"Error al obtener token: {result.get('error_description')}")

    def list_users(self):
        """
        Lista usuarios del directorio de Azure AD.
        
        Returns:
            dict: {"total": int, "users": List[dict]}
        """
        if not self.token:
            self.get_access_token()

        url = "https://graph.microsoft.com/v1.0/users"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Seleccionar solo los campos necesarios
        params = {
            "$select": "id,displayName,mail,jobTitle",
            "$orderby": "displayName"
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        # Si el token expiró, renovarlo y reintentar
        if response.status_code == 401:
            self.get_access_token()
            headers["Authorization"] = f"Bearer {self.token}"
            response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            users = data.get("value", [])
            
            # Normalizar estructura de respuesta
            normalized_users = [
                {
                    "id": user["id"],
                    "display_name": user.get("displayName", ""),
                    "email": user.get("mail"),
                    "job_title": user.get("jobTitle")
                }
                for user in users
            ]
            
            return {
                "total": len(normalized_users),
                "users": normalized_users
            }
        else:
            raise Exception(f"Error al listar usuarios: {response.status_code} - {response.text}")


# Instancia singleton
user_service = UserService()