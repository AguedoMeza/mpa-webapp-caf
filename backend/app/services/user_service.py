import msal
import requests
from typing import List
from app.core.config import settings


class UserService:
    """
    Servicio para consultar usuarios del directorio de Azure AD.
    Filtra usuarios por dominios permitidos.
    """
    
    # Dominios permitidos
    ALLOWED_DOMAINS = ["@mpagroup.mx", "@macquarie.com"]
    
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
        Lista usuarios del directorio de Azure AD filtrados por dominios permitidos.
        
        Args:
            max_results: Número máximo de usuarios a retornar (default: 999)
        
        Returns:
            dict: {"total": int, "users": List[dict]}
        """
        if not self.token:
            self.get_access_token()

        url = "https://graph.microsoft.com/v1.0/users"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        params = {
            "$select": "id,displayName,mail,userPrincipalName,jobTitle",
            "$orderby": "displayName",
            "$top": 999
        }
        
        all_users = []
        
        # Paginación: iterar todas las páginas
        while url:
            response = requests.get(
                url, 
                headers=headers, 
                params=params if url.startswith("https://graph.microsoft.com/v1.0/users") else None
            )
            
            # Renovar token si expiró
            if response.status_code == 401:
                self.get_access_token()
                headers["Authorization"] = f"Bearer {self.token}"
                response = requests.get(
                    url, 
                    headers=headers, 
                    params=params if url.startswith("https://graph.microsoft.com/v1.0/users") else None
                )
            
            if response.status_code == 200:
                data = response.json()
                all_users.extend(data.get("value", []))
                url = data.get("@odata.nextLink")
                params = None  # nextLink ya incluye los params
            else:
                raise Exception(f"Error al listar usuarios: {response.status_code} - {response.text}")
        
        # Filtrar por dominios permitidos (mail O userPrincipalName)
        filtered_users = [
            user for user in all_users
            if (user.get("mail") and any(user["mail"].endswith(domain) for domain in self.ALLOWED_DOMAINS)) or
               (user.get("userPrincipalName") and any(user["userPrincipalName"].endswith(domain) for domain in self.ALLOWED_DOMAINS))
        ]
        
        # Limitar resultados si se especifica
        if max_results:
            filtered_users = filtered_users[:max_results]
        
        # Normalizar estructura de respuesta
        normalized_users = [
            {
                "id": user["id"],
                "display_name": user.get("displayName", ""),
                "email": user.get("mail") or user.get("userPrincipalName"),
                "job_title": user.get("jobTitle")
            }
            for user in filtered_users
        ]
        
        return {
            "total": len(normalized_users),
            "users": normalized_users
        }


# Instancia singleton
user_service = UserService()