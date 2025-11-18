from pydantic import BaseModel
from typing import List


class User(BaseModel):
    """Representa un usuario del directorio de Azure AD"""
    id: str
    display_name: str
    email: str | None
    job_title: str | None


class UserListResponse(BaseModel):
    """Respuesta al listar usuarios"""
    total: int
    users: List[User]