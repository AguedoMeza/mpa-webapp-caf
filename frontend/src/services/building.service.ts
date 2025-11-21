import axios, { AxiosInstance } from 'axios';

export interface Building {
  value: string;
  label: string;
}

export interface BuildingListResponse {
  buildings: Building[];
}

class BuildingService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    this.api = axios.create({
      baseURL: `${baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para token de autenticación
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
   * Obtiene la lista de buildings para el select
   * El endpoint ya retorna el formato correcto para react-select
   */
  async listBuildings(): Promise<Building[]> {
    try {
      const response = await this.api.get<Building[]>('/buildings/select');
      return response.data;
    } catch (error) {
      console.error('Error al listar buildings:', error);
      throw error;
    }
  }
}

// Singleton
export const buildingService = new BuildingService();
export default BuildingService;