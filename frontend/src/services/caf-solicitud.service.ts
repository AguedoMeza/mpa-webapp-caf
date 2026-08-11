import axios, { AxiosInstance } from 'axios';
import { 
  CAFSolicitud,
  CAFSolicitudResponse,
  CAFSolicitudListItem,
  CAFSolicitudPage,
  CAFEstadoFiltro,
  CAFResponsableOpcion,
  CAFSolicitudCO,
  CAFSolicitudOS,
  CAFSolicitudOC,
  CAFSolicitudPD,
  CAFSolicitudFD
} from '../types/caf-solicitud.types';

/**
 * Distingue una petición abortada de un error real. El listado cancela la
 * petición anterior cada vez que cambian los filtros o la página.
 */
export const esCancelacion = (error: unknown): boolean => axios.isCancel(error);

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
   * El campo 'approve' se deja como NULL (pendiente) automáticamente
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
  async listSolicitudes(
    params?: {
      page?: number;
      page_size?: number;
      search?: string;
      tipo_contratacion?: string;
      estado?: CAFEstadoFiltro;
      responsable?: string;
    },
    signal?: AbortSignal
  ): Promise<CAFSolicitudPage> {
    try {
      const response = await this.api.get<CAFSolicitudPage>(
        '/caf-solicitud',
        { params, signal }
      );
      return response.data;
    } catch (error) {
      // Una petición cancelada no es un fallo: pasa cada vez que el usuario
      // teclea o cambia de página antes de que responda la anterior.
      if (!esCancelacion(error)) {
        console.error('Error al listar solicitudes CAF:', error);
      }
      throw error;
    }
  }

  /**
   * Responsables que aparecen en las solicitudes, con su conteo.
   * Alimenta el filtro de Admin Responsable del listado.
   */
  async listResponsables(signal?: AbortSignal): Promise<CAFResponsableOpcion[]> {
    try {
      const response = await this.api.get<CAFResponsableOpcion[]>(
        '/caf-solicitud/responsables',
        { signal }
      );
      return response.data;
    } catch (error) {
      if (!esCancelacion(error)) {
        console.error('Error al listar responsables:', error);
      }
      throw error;
    }
  }

  /**
   * Cambia el Admin Responsable de una solicitud y lo deja en su historial.
   *
   * El backend no valida quién ejecuta el cambio: 'usuario' se guarda tal como
   * lo manda el cliente.
   */
  async reasignarResponsable(
    id: number,
    data: {
      responsable: string;
      usuario: string;
      motivo?: string;
      notificar?: boolean;
    }
  ): Promise<any> {
    try {
      const response = await this.api.patch(`/caf-solicitud/${id}/responsable`, data);
      return response.data;
    } catch (error) {
      console.error('Error al reasignar responsable:', error);
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
   * Aprobar, rechazar o solicitar correcciones en una solicitud
   * 
   * Estados:
   * - 'requiere_correcciones': Solicita correcciones (comentarios OBLIGATORIOS)
   * - 'aprobado': Aprueba definitivamente
   * - 'rechazado_definitivo': Rechaza definitivamente (comentarios OPCIONALES)
   */
  async approveOrRejectSolicitud(
    id: number,
    approve: 'requiere_correcciones' | 'aprobado' | 'rechazado_definitivo',
    comentarios?: string
  ): Promise<any> {
    try {
      const payload: any = { approve };
      
      // Solo incluir comentarios si se proporcionan
      if (comentarios !== undefined && comentarios !== null) {
        payload.comentarios = comentarios;
      }
      
      const response = await this.api.patch(
        `/caf-solicitud/${id}/approval`,
        payload
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
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'Contrato de Obra' });
  }

  /**
   * Crear solicitud de Orden de Servicio (OS)
   */
  async createSolicitudOS(data: CAFSolicitudOS): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'Orden de Servicio' });
  }

  /**
   * Crear solicitud de Orden de Cambio (OC)
   */
  async createSolicitudOC(data: CAFSolicitudOC): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'Orden de Cambio' });
  }

  /**
   * Crear solicitud de Pago a Dependencias (PD)
   */
  async createSolicitudPD(data: CAFSolicitudPD): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'Pago a Dependencia' });
  }

  /**
   * Crear solicitud de Firma de Documento (FD)
   */
  async createSolicitudFD(data: CAFSolicitudFD): Promise<CAFSolicitudResponse> {
    return this.createSolicitud({ ...data, Tipo_Contratacion: 'Firma de Documento' });
  }

  /**
   * Helper: Obtiene la etiqueta legible del estado
   */
  getStatusLabel(approve: number | null | undefined): string {
    if (approve === null || approve === undefined) {
      return 'Pendiente de Revisión';
    }
    switch (approve) {
      case 0:
        return 'Requiere Correcciones';
      case 1:
        return 'Aprobado';
      case 2:
        return 'Rechazado Definitivamente';
      default:
        return 'Estado Desconocido';
    }
  }

  /**
   * Helper: Obtiene el color del badge según el estado
   */
  getStatusColor(approve: number | null | undefined): string {
    if (approve === null || approve === undefined) {
      return 'warning';
    }
    switch (approve) {
      case 0:
        return 'info';
      case 1:
        return 'success';
      case 2:
        return 'danger';
      default:
        return 'secondary';
    }
  }
}

// Exportar instancia única del servicio (Singleton)
export const cafSolicitudService = new CAFSolicitudService();

// También exportar la clase por si se necesita crear instancias personalizadas
export default CAFSolicitudService;