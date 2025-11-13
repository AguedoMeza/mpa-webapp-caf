// layout/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Puedes personalizar este loader
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // TODO: Add role-based access control here if needed
  // For now, just check if user is authenticated

  return <>{children}</>;
};

export default ProtectedRoute;
