// services/AuthService.ts
import config from "../config/config";
import { SAMLUser, AuthStatusResponse, LoginResponse, LogoutResponse } from "../types/authTypes";

export const AuthService = {
  /**
   * Iniciar login SSO con Azure AD
   */
  async startSAMLLogin(): Promise<void> {
    try {
      // Construye la URL base actual de la app (por ejemplo, https://webapplication.mpagroup.mx/aml o /trabajos-whse)
      const redirectUrl = window.location.origin + window.location.pathname.replace(/\/$/, "");
      const response = await fetch(
        `${config.API_URL_AML}/api/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`
      );
      const data: LoginResponse = await response.json();

      if (data.saml_redirect_url) {
        // Redirigir a Azure AD
        window.location.href = data.saml_redirect_url;
      } else if (data.authenticated && data.user) {
        // Ya está autenticado
        this.saveUserToStorage(data.user);
        window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/`;
      }
    } catch (error) {
      console.error("Error iniciando login SAML:", error);
      throw new Error("Error conectando con Azure AD");
    }
  },

  /**
   * Verificar estado de autenticación
   */
  async checkAuthStatus(): Promise<AuthStatusResponse> {
    try {
      const response = await fetch(`${config.API_URL_AML}/api/auth/status`, {
        credentials: 'include' // Importante para enviar cookies de sesión
      });
      
      if (!response.ok) {
        throw new Error('Error verificando autenticación');
      }
      
      const authStatus: AuthStatusResponse = await response.json();
      
      // Si está autenticado, guardar datos en localStorage
      if (authStatus.authenticated && authStatus.user) {
        this.saveUserToStorage(authStatus.user);
      } else {
        this.clearUserFromStorage();
      }
      
      return authStatus;
    } catch (error) {
      console.error("Error verificando estado:", error);
      throw error;
    }
  },

  /**
   * Cerrar sesión SAML
   */
  async logout(): Promise<void> {
  try {
    const redirectUrl = window.location.origin + window.location.pathname.replace(/\/$/, "");
    const response = await fetch(
      `${config.API_URL_AML}/api/auth/logout?redirect_url=${encodeURIComponent(redirectUrl)}`,
      { credentials: 'include' }
    );
    const data: LogoutResponse = await response.json();

    this.clearUserFromStorage();

    if (data.saml_logout_url) {
      window.location.href = data.saml_logout_url;
    } else {
      window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/login`;
    }
  } catch (error) {
    console.error("Error en logout:", error);
    this.clearUserFromStorage();
    window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/login`;
  }
},

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const userData = localStorage.getItem("saml_user");
    const loginTime = localStorage.getItem("saml_login_time");
    return !!(userData && loginTime);
  },

  /**
   * Obtener datos del usuario actual
   */
  getCurrentUser(): SAMLUser | null {
    const userData = localStorage.getItem("saml_user");
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Guardar datos del usuario en localStorage
   */
  saveUserToStorage(user: SAMLUser): void {
    localStorage.setItem("saml_user", JSON.stringify(user));
    localStorage.setItem("saml_login_time", new Date().toISOString());
    localStorage.setItem("saml_authenticated", "true");
  },

  /**
   * Limpiar datos del usuario del localStorage
   */
  clearUserFromStorage(): void {
    localStorage.removeItem("saml_user");
    localStorage.removeItem("saml_login_time");
    localStorage.removeItem("saml_authenticated");
  },

  /**
   * Manejar redirección después del login SAML
   */
  handleSAMLCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    
    if (authSuccess === 'success') {
      // Verificar estado y obtener datos del usuario
      this.checkAuthStatus().then(() => {
        // Limpiar URL y redirigir a página principal
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/`;
      }).catch(() => {
        // En caso de error, redirigir a login
        window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/login`;
      });
    }
  }
};
