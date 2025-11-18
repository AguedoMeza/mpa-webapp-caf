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