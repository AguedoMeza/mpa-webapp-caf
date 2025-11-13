// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { SAMLUser } from '../types/authTypes';

/**
 * Hook para manejar autenticación SAML
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<SAMLUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar estado de autenticación al montar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Monitoreo periódico de la sesión (cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authStatus = await AuthService.checkAuthStatus();
      
      setIsAuthenticated(authStatus.authenticated);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout local
      AuthService.clearUserFromStorage();
      window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/login`;
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout,
    checkAuthStatus
  };
};
