from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.user_service import UserService
from app.schemas.user import UserListResponse


router = APIRouter()


@router.get("/users", status_code=status.HTTP_200_OK, response_model=UserListResponse)
def list_directory_users(db: Session = Depends(get_db)):
    """
    Lista usuarios del directorio de Azure AD.

    Requiere permisos:
    - User.Read.All (Application)

    Returns:
        UserListResponse: Lista de usuarios con id, display_name, email y job_title
    """
    try:
        service = UserService(db)
        return service.list_users()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuarios: {str(e)}"
        )


@router.get("/users/by-email/{email}", status_code=status.HTTP_200_OK)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """
    Obtiene información de un usuario específico por email.
    No aplica filtros de puesto.

    Args:
        email: Email del usuario a buscar

    Returns:
        dict: Información del usuario
    """
    try:
        service = UserService(db)
        result = service.get_user_by_email(email)
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado o dominio no permitido"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuario: {str(e)}"
        )
