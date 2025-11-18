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

    def list_users(self, max_results: int = 999):
        """
        Lista usuarios del directorio de Azure AD con soporte de paginación.
        
        Args:
            max_results: Número máximo de usuarios a retornar (default: 999, usa None para todos)
        
        Returns:
            dict: {"total": int, "users": List[dict]}
        """
        if not self.token:
            self.get_access_token()

        url = "https://graph.microsoft.com/v1.0/users"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Seleccionar solo los campos necesarios
        # $top controla cuántos usuarios por página (máx 999)
        params = {
            "$select": "id,displayName,mail,jobTitle",
            "$orderby": "displayName",
            "$top": min(max_results, 999) if max_results else 999  # Graph API máximo 999 por página
        }
        
        all_users = []
        
        # Iterar a través de todas las páginas
        while url:
            response = requests.get(url, headers=headers, params=params if url.startswith("https://graph.microsoft.com/v1.0/users") else None)
            
            # Si el token expiró, renovarlo y reintentar
            if response.status_code == 401:
                self.get_access_token()
                headers["Authorization"] = f"Bearer {self.token}"
                response = requests.get(url, headers=headers, params=params if url.startswith("https://graph.microsoft.com/v1.0/users") else None)
            
            if response.status_code == 200:
                data = response.json()
                users = data.get("value", [])
                
                # Agregar usuarios de esta página
                all_users.extend(users)
                
                # Verificar si hay más páginas
                url = data.get("@odata.nextLink")
                
                # Si se alcanzó el límite máximo, detener
                if max_results and len(all_users) >= max_results:
                    all_users = all_users[:max_results]
                    break
                    
                # Limpiar params después de la primera llamada (nextLink ya incluye params)
                params = None
            else:
                raise Exception(f"Error al listar usuarios: {response.status_code} - {response.text}")
        
        # Normalizar estructura de respuesta
        normalized_users = [
            {
                "id": user["id"],
                "display_name": user.get("displayName", ""),
                "email": user.get("mail"),
                "job_title": user.get("jobTitle")
            }
            for user in all_users
        ]
        
        return {
            "total": len(normalized_users),
            "users": normalized_users
        }


# Instancia singleton
user_service = UserService()