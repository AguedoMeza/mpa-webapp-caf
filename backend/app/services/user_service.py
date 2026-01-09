import msal
import requests
from typing import List
from app.core.config import settings


class UserService:
    """
    Servicio para consultar usuarios del directorio de Azure AD.
    Filtra usuarios por dominios y departamentos permitidos.
    """
    
    # Dominios permitidos
    ALLOWED_DOMAINS = ["@mpagroup.mx", "@macquarie.com"]
    
    # Departamentos permitidos (el orden define la prioridad en los resultados)
    ALLOWED_DEPARTMENTS = [
        "Property Management",      # ← Aparecerá primero
        "Information Technology",   # ← Aparecerá después
        "Engineering"               # ← Nuevo departamento permitido
    ]
    
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

    def _get_department_priority(self, department: str | None) -> int:
        """
        Obtiene la prioridad de un departamento para ordenamiento.
        Departamentos al inicio de ALLOWED_DEPARTMENTS tienen mayor prioridad (menor número).
        
        Args:
            department: Nombre del departamento
        
        Returns:
            int: Índice de prioridad (0 = mayor prioridad)
        """
        if not department:
            return 999  # Sin departamento va al final
        
        try:
            return self.ALLOWED_DEPARTMENTS.index(department)
        except ValueError:
            return 999  # Departamento no encontrado va al final

    # Job titles permitidos
    ALLOWED_JOB_TITLES = [
        "Admin Property Management",
        "Engineering Analyst"
    ]

    def list_users(self, max_results: int = 999):
        """
        Lista usuarios del directorio de Azure AD filtrados por dominios y departamentos permitidos.
        Ordenados por departamento (Property Management primero) y luego por nombre.
        
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
            "$select": "id,displayName,mail,userPrincipalName,jobTitle,department",
            "$orderby": "displayName",  # Ordenamiento inicial por nombre
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
                params = None
            else:
                raise Exception(f"Error al listar usuarios: {response.status_code} - {response.text}")
        
        # FILTRO 1: Por dominios permitidos
        filtered_by_domain = [
            user for user in all_users
            if (user.get("mail") and any(user["mail"].endswith(domain) for domain in self.ALLOWED_DOMAINS)) or
               (user.get("userPrincipalName") and any(user["userPrincipalName"].endswith(domain) for domain in self.ALLOWED_DOMAINS))
        ]
        
        # FILTRO 2: Por departamentos permitidos
        filtered_users = [
            user for user in filtered_by_domain
            if user.get("department") and user["department"] in self.ALLOWED_DEPARTMENTS
            and user.get("jobTitle") in self.ALLOWED_JOB_TITLES
        ]
        
        # ORDENAMIENTO: Primero por departamento (prioridad), luego por nombre
        filtered_users.sort(
            key=lambda user: (
                self._get_department_priority(user.get("department")),  # Prioridad por departamento
                user.get("displayName", "").lower()  # Luego alfabéticamente por nombre
            )
        )
        
        # Limitar resultados si se especifica
        if max_results:
            filtered_users = filtered_users[:max_results]
        
        # Normalizar estructura de respuesta
        normalized_users = [
            {
                "id": user["id"],
                "display_name": user.get("displayName", ""),
                "email": user.get("mail") or user.get("userPrincipalName"),
                "job_title": user.get("jobTitle"),
                "department": user.get("department")
            }
            for user in filtered_users
        ]
        
        return {
            "total": len(normalized_users),
            "users": normalized_users
        }


# Instancia singleton
user_service = UserService()