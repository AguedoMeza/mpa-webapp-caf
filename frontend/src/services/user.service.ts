import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  display_name: string;
  email: string | null;
  job_title: string | null;
}

export interface UserListResponse {
  total: number;
  users: User[];
}

class UserService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8002';
    
    this.api = axios.create({
      baseURL: `${baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para token (igual que caf-solicitud.service)
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Lista todos los usuarios del directorio de Azure AD
   */
  async listUsers(): Promise<UserListResponse> {
    try {
      const response = await this.api.get<UserListResponse>('/users');
      return response.data;
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  }
}

// Singleton
export const userService = new UserService();
export default UserService;