import React, { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { AuthService } from '../../services/AuthService';
import { userService, User } from '../../services/user.service';

/**
 * Componente que muestra el Ingeniero Responsable (usuario en sesión)
 * como información de solo lectura con el mismo formato que ResponsableSelect
 */
const IngenieroResponsableLabel: React.FC = () => {
  const currentUser = AuthService.getCurrentUser();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentEmail = currentUser?.email || '';
  
  // Obtener información completa del usuario actual desde Azure AD
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentEmail) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await userService.getUserByEmail(currentEmail);
        setUserDetails(userData);
      } catch (error) {
        console.error('Error obteniendo detalles del usuario:', error);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [currentEmail]);
  
  // Formato igual a ResponsableSelect: "Nombre - Departamento (email)"
  let formattedUser = 'Usuario no identificado';
  
  if (userDetails) {
    // Usar datos completos de Azure AD con departamento
    const namePart = userDetails.display_name;
    const deptPart = userDetails.department ? ` - ${userDetails.department}` : '';
    const emailPart = userDetails.email ? ` (${userDetails.email})` : '';
    formattedUser = `${namePart}${deptPart}${emailPart}`;
  } else if (currentUser && !loading) {
    // Fallback: mostrar lo que tengamos del usuario SAML (sin departamento)
    const displayName = currentUser.given_name && currentUser.family_name 
      ? `${currentUser.given_name} ${currentUser.family_name}`
      : currentUser.name;
    formattedUser = currentEmail ? `${displayName} (${currentEmail})` : displayName;
  }

  return (
    <Form.Group className="mb-2">
      <Form.Label>
        Ingeniero Responsable (Solicitante)
      </Form.Label>
      <div className="d-flex align-items-center p-2 border rounded bg-light">
        <i className="fas fa-user-check me-2 text-primary"></i>
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="text-muted">Cargando...</span>
          </>
        ) : (
          <span>{formattedUser}</span>
        )}
      </div>
      <Form.Text className="text-muted">
        Usuario actualmente autenticado en el sistema
      </Form.Text>
    </Form.Group>
  );
};

export default IngenieroResponsableLabel;
