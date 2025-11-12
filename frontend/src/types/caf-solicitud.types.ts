// Interfaz base con campos comunes a todos los formularios
export interface CAFSolicitudBase {
  // Información General
  Tipo_Contratacion?: string;
  Responsable?: string;
  Fecha?: string; // formato: "YYYY-MM-DD"
  Cliente?: string;
  Building?: string;
  Direccion?: string;
  Proveedor?: string;
  Descripcion_trabajo_servicio?: string;
  Justificacion_trabajo?: string;
  Enlace_sharepoint?: string;
  
  // Documentos comunes (checkboxes como 0 o 1)
  Cotizacion_MPA_CP?: number;
  AprobacionCorreoConcurso?: number;
  AnalisisRiesgosWHSE_VOBO?: number;
  DibujosEspecificaciones?: number;
  ProgramaObra?: number;
  
  // Metadata
  approve?: number; // 0=revision, 1=aprobado, 2=rechazado
  Comentarios?: string;
  Mode?: string;
  Usuario?: string;
}

// Interfaz para datos de trabajos/servicios (común en CO, OS, OC)
export interface DatosTrabajoServicio {
  Fecha_inicio?: string;
  FechaTerminacionFinalServ?: string;
  MontoMXNsubtotal?: string;
  MontoUSDsubtotal?: string;
  TDC?: string;
  Anticipo?: string;
  Fuerza_trabajo?: string;
  Presupuesto_existente?: string;
  Tipo_trabajo?: string;
  Recuperable?: string;
}

// Interfaz para datos exclusivos de contratos
export interface DatosContrato {
  Fecha_Ocupacion_Benefica?: string;
  Fecha_Terminacion_Sustancial?: string;
  FechaTerminacionFinalCont?: string;
  Fianza_Anticipo?: string;
  FianzaCumplimiento_BuenaCalidad?: string;
  Fianza_Pasivos_Contingentes?: string;
  
  // Documentos exclusivos de contratos
  Acta_Constitutiva?: number;
  Poder_Notarial?: number;
  INE_Rep_Legal?: number;
  AltaIMSS_REPSE?: number;
  InfoBancariaContrato?: number;
}

// Interfaz para Formato CO (Contrato)
export interface CAFSolicitudCO extends CAFSolicitudBase, DatosTrabajoServicio, DatosContrato {
  CveSol?: string;
}

// Interfaz para Formato OS (Orden de Servicio)
export interface CAFSolicitudOS extends CAFSolicitudBase, DatosTrabajoServicio {
  // OS no tiene campos adicionales específicos más allá de base + trabajos
}

// Interfaz para Formato OC (Orden de Cambio)
export interface CAFSolicitudOC extends CAFSolicitudBase, DatosTrabajoServicio {
  // Campos exclusivos de Órdenes de Cambio
  MontoOriginalMXN?: string;
  MontoOriginalUSD?: string;
  MontoActualizadoMXN?: string;
  MontoActualizadoUSD?: string;
  NuevaOcupacionBenefica?: string;
  NuevaTerminacionSust?: string;
  NuevaTerminacionFinal?: string;
  TiempoDias?: string;
}

// Interfaz para Formato PD (Pago a Dependencias)
export interface CAFSolicitudPD extends CAFSolicitudBase {
  MontoMXNsubtotal?: string;
  Presupuesto_existente?: string;
  Tipo_trabajo?: string;
  
  // Documentos exclusivos de PD
  VOBO_LegalPagoDep?: number;
  FichaPago?: number;
  InfoBancariaPagoDep?: number;
}

// Interfaz para Formato FD (Firma de Documento)
export interface CAFSolicitudFD extends CAFSolicitudBase {
  // Documentos exclusivos de FD
  VOBO_LegalFirma?: number;
  DocumentoFirmar?: number;
}

// Tipo union para cualquier solicitud CAF
export type CAFSolicitud = 
  | CAFSolicitudCO 
  | CAFSolicitudOS 
  | CAFSolicitudOC 
  | CAFSolicitudPD 
  | CAFSolicitudFD;

// Response del API
export interface CAFSolicitudResponse {
  id_solicitud: number;
  Tipo_Contratacion?: string;
  Responsable?: string;
  Fecha?: string;
  Cliente?: string;
  // ... incluir todos los campos según necesites
  approve?: number;
  Mode?: string;  // Campo para control de edición
}