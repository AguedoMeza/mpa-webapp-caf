// layout/ProtectedRoute.tsx
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Sin autenticación, solo renderiza children
  return <>{children}</>;
};

export default ProtectedRoute;
