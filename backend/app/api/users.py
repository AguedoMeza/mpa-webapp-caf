from fastapi import APIRouter, HTTPException, status
from app.services.user_service import user_service
from app.schemas.user import UserListResponse


router = APIRouter()


@router.get("/users", status_code=status.HTTP_200_OK, response_model=UserListResponse)
def list_directory_users():
    """
    Lista usuarios del directorio de Azure AD.
    
    Requiere permisos:
    - User.Read.All (Application)
    
    Returns:
        UserListResponse: Lista de usuarios con id, display_name, email y job_title
    """
    try:
        result = user_service.list_users()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuarios: {str(e)}"
        )


@router.get("/users/by-email/{email}", status_code=status.HTTP_200_OK)
def get_user_by_email(email: str):
    """
    Obtiene información de un usuario específico por email.
    No aplica filtros de job title.
    
    Args:
        email: Email del usuario a buscar
    
    Returns:
        dict: Información del usuario
    """
    try:
        result = user_service.get_user_by_email(email)
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario no encontrado o dominio no permitido"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuario: {str(e)}"
        )