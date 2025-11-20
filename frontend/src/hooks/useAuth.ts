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
        checkAuthStatus(true); // ← Silent: no afecta isLoading
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkAuthStatus = async (silent: boolean = false) => {
    try {
      // Solo mostrar loading en verificaciones explícitas (login inicial)
      if (!silent) setIsLoading(true);
      
      const authStatus = await AuthService.checkAuthStatus();
      
      setIsAuthenticated(authStatus.authenticated);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      if (!silent) setIsLoading(false);
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
