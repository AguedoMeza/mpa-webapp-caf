import axios, { AxiosInstance } from 'axios';
import { 
  CAFSolicitud, 
  CAFSolicitudResponse,
  CAFSolicitudCO,
  CAFSolicitudOS,
  CAFSolicitudOC,
  CAFSolicitudPD,
  CAFSolicitudFD
} from '../types/caf-solicitud.types';

class CAFSolicitudService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Variables de entorno de React (Create React App)
    // Deben comenzar con REACT_APP_
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token si existe
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Crear una nueva solicitud CAF
   */
  async createSolicitud(data: CAFSolicitud): Promise<CAFSolicitudResponse> {
    try {
      const response = await this.api.post<CAFSolicitudResponse>(
        '/caf-solicitud',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear solicitud CAF:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de una solicitud por ID
   */
  async getSolicitudById(id: number): Promise<CAFSolicitudResponse> {
    try {
      const response = await this.api.get<CAFSolicitudResponse>(
        `/caf-solicitud/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitud CAF:', error);
      throw error;
    }
  }

  /**
   * Listar todas las solicitudes
   */
  async listSolicitudes(params?: {
    skip?: number;
    limit?: number;
    tipo_contratacion?: string;
    responsable?: string;
  }): Promise<CAFSolicitudResponse[]> {
    try {
      const response = await this.api.get<CAFSolicitudResponse[]>(
        '/caf-solicitud',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error al listar solicitudes CAF:', error);
      throw error;
    }
  }

  /**
   * Actualizar una solicitud existente
   */
  async updateSolicitud(
    id: number,
    data: Partial<CAFSolicitud>
  ): Promise<CAFSolicitudResponse> {
    try {
      const response = await this.api.put<CAFSolicitudResponse>(
        `/caf-solicitud/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar solicitud CAF:', error);
      throw error;
    }
  }

  /**
   * Aprobar o rechazar una solicitud (versión con números)
   */
  async updateApprovalStatus(
    id: number,
    approve: number, // 0=revision, 1=aprobado, 2=rechazado
    comentarios?: string
  ): Promise<CAFSolicitudResponse> {
    try {
      const response = await this.api.patch<CAFSolicitudResponse>(
        `/caf-solicitud/${id}/approval`,
        { approve, Comentarios: comentarios }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estatus de aprobación:', error);
      throw error;
    }
  }

  /**
   * Aprobar o rechazar una solicitud (versión con strings)
   */
  async approveOrRejectSolicitud(
    id: number,
    approve: 'aprobado' | 'rechazado' | 'revision',
    comentarios?: string
  ): Promise<any> {
    try {
      const response = await this.api.patch(
        `/caf-solicitud/${id}/approval`,
        { approve, comentarios }
      );
      return response.data;
    } catch (error) {
      console.error('Error al aprobar/rechazar solicitud:', error);
      throw error;
    }
  }

  /**
   * Eliminar una solicitud
   */
  async deleteSolicitud(id: number): Promise<void> {
    try {
      await this.api.delete(`/caf-solicitud/${id}`);
    } catch (error) {
      console.error('Error al eliminar solicitud CAF:', error);
      throw error;
    }
  }

  // Métodos específicos por tipo de formulario con validación de tipo

  /**
   * Crear solicitud de Contrato (CO)
   */
  async createSolicitudCO(data: CAFSolicitudCO): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'CO' });
  }

  /**
   * Crear solicitud de Orden de Servicio (OS)
   */
  async createSolicitudOS(data: CAFSolicitudOS): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'OS' });
  }

  /**
   * Crear solicitud de Orden de Cambio (OC)
   */
  async createSolicitudOC(data: CAFSolicitudOC): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'OC' });
  }

  /**
   * Crear solicitud de Pago a Dependencias (PD)
   */
  async createSolicitudPD(data: CAFSolicitudPD): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'PD' });
  }

  /**
   * Crear solicitud de Firma de Documento (FD)
   */
  async createSolicitudFD(data: CAFSolicitudFD): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'FD' });
  }
}


// Exportar instancia única del servicio (Singleton)
export const cafSolicitudService = new CAFSolicitudService();

// También exportar la clase por si se necesita crear instancias personalizadas
export default CAFSolicitudService;