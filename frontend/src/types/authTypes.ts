// types/authTypes.ts

/**
 * Interface para datos del usuario SAML
 */
export interface SAMLUser {
  name_id: string;
  name: string;
  email: string;
  given_name: string;
  family_name: string;
  groups: string[];
  oid: string;
  session_index?: string;
}

/**
 * Interface para respuesta del endpoint /api/auth/status
 */
export interface AuthStatusResponse {
  authenticated: boolean;
  azure_ad_ready: boolean;
  user: SAMLUser | null;
  login_time: string | null;
  tenant: string;
}

/**
 * Interface para respuesta del endpoint /api/auth/login
 */
export interface LoginResponse {
  authenticated?: boolean;
  user?: SAMLUser;
  saml_redirect_url?: string;
  error?: string;
}

/**
 * Interface para respuesta del endpoint /api/auth/logout
 */
export interface LogoutResponse {
  logged_out?: boolean;
  saml_logout_url?: string;
}
