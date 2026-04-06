import msal
import requests
from sqlalchemy.orm import Session
from app.core.config import settings
from app.repositories.elegibilidad_repository import ElegibilidadRepository


class UserService:
    """
    Servicio para consultar usuarios del directorio de Azure AD.
    Filtra usuarios por dominios, departamentos y puestos definidos
    en la tabla CAT_Elegibilidad_Usuario.
    """

    def __init__(self, db: Session):
        self._repo = ElegibilidadRepository(db)
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

    def _get_department_priority(self, department: str | None, departamentos: list[str]) -> int:
        """
        Obtiene la prioridad de un departamento para ordenamiento.
        Departamentos al inicio de la lista tienen mayor prioridad (menor número).
        """
        if not department:
            return 999
        try:
            return departamentos.index(department)
        except ValueError:
            return 999

    def list_users(self, max_results: int = 999):
        """
        Lista usuarios del directorio de Azure AD filtrados por dominios,
        departamentos y puestos definidos en CAT_Elegibilidad_Usuario.
        Ordenados por departamento (según Prioridad en BD) y luego por nombre.

        Args:
            max_results: Número máximo de usuarios a retornar (default: 999)

        Returns:
            dict: {"total": int, "users": List[dict]}
        """
        if not self.token:
            self.get_access_token()

        dominios      = self._repo.get_dominios()
        departamentos = self._repo.get_departamentos()
        puestos       = self._repo.get_puestos()

        url = "https://graph.microsoft.com/v1.0/users"
        headers = {"Authorization": f"Bearer {self.token}"}

        params = {
            "$select": "id,displayName,mail,userPrincipalName,jobTitle,department",
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
                params = None
            else:
                raise Exception(f"Error al listar usuarios: {response.status_code} - {response.text}")

        # FILTRO 1: Por dominios permitidos
        filtered_by_domain = [
            user for user in all_users
            if (user.get("mail") and any(user["mail"].endswith(d) for d in dominios)) or
               (user.get("userPrincipalName") and any(user["userPrincipalName"].endswith(d) for d in dominios))
        ]

        # FILTRO 2: Por departamento Y puesto permitidos
        filtered_users = [
            user for user in filtered_by_domain
            if user.get("department") in departamentos
            and user.get("jobTitle") in puestos
        ]

        # ORDENAMIENTO: Por prioridad de departamento (según BD), luego por nombre
        filtered_users.sort(
            key=lambda user: (
                self._get_department_priority(user.get("department"), departamentos),
                user.get("displayName", "").lower()
            )
        )

        if max_results:
            filtered_users = filtered_users[:max_results]

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

    def get_user_by_email(self, email: str):
        """
        Obtiene información de un usuario específico por email.
        No aplica filtros de puesto - solo verifica dominio permitido.

        Args:
            email: Email del usuario a buscar

        Returns:
            dict: Información del usuario o None si no se encuentra
        """
        if not self.token:
            self.get_access_token()

        dominios = self._repo.get_dominios()

        if not any(email.endswith(d) for d in dominios):
            return None

        url = "https://graph.microsoft.com/v1.0/users"
        headers = {"Authorization": f"Bearer {self.token}"}

        params = {
            "$filter": f"mail eq '{email}' or userPrincipalName eq '{email}'",
            "$select": "id,displayName,mail,userPrincipalName,jobTitle,department"
        }

        response = requests.get(url, headers=headers, params=params)

        # Renovar token si expiró
        if response.status_code == 401:
            self.get_access_token()
            headers["Authorization"] = f"Bearer {self.token}"
            response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            data = response.json()
            users = data.get("value", [])

            if users:
                user = users[0]
                return {
                    "id": user["id"],
                    "display_name": user.get("displayName", ""),
                    "email": user.get("mail") or user.get("userPrincipalName"),
                    "job_title": user.get("jobTitle"),
                    "department": user.get("department")
                }

        return None
