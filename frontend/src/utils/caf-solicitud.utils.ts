import {
  CAFSolicitudCO,
  CAFSolicitudOS,
  CAFSolicitudOC,
  CAFSolicitudPD,
  CAFSolicitudFD,
} from '../types/caf-solicitud.types';

/**
 * Convierte valores de checkbox a número (1 o 0)
 */
export const checkboxToNumber = (value: boolean | undefined): number => {
  return value ? 1 : 0;
};

/**
 * Convierte número (del API) a boolean (para checkbox)
 */
export const numberToCheckbox = (value: number | undefined): boolean => {
  return value === 1;
};

/**
 * Formatea fecha de input a formato YYYY-MM-DD
 */
export const formatDateForAPI = (date: string | undefined): string | undefined => {
  if (!date) return undefined;
  // Si ya está en formato correcto, retornar
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Si es otro formato, convertir
  const d = new Date(date);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split('T')[0];
};

/**
 * Mapea datos del formulario CO a la estructura del API
 * IMPORTANTE: NO establece approve, se deja como NULL (pendiente) por defecto
 */
export const mapFormatoCOToAPI = (formData: any): CAFSolicitudCO => {
  return {
    // Información base
    Tipo_Contratacion: 'CO',
    Responsable: formData.responsable,
    Fecha: formatDateForAPI(formData.fecha),
    Cliente: formData.cliente,
    Building: formData.buildingId,
    Direccion: formData.direccion,
    Proveedor: formData.proveedor,
    Descripcion_trabajo_servicio: formData.descripcion,
    Justificacion_trabajo: formData.justificacion,
    Enlace_sharepoint: formData.sharepoint,

    // Datos de trabajos/servicios
    Fecha_inicio: formatDateForAPI(formData.fechaInicio),
    FechaTerminacionFinalServ: formatDateForAPI(formData.fechaFin),
    MontoMXNsubtotal: formData.montoPesos,
    MontoUSDsubtotal: formData.montoDolares,
    TDC: formData.tdc,
    Anticipo: formData.anticipo,
    Fuerza_trabajo: formData.fuerzaTrabajo,
    Presupuesto_existente: formData.presupuesto,
    Tipo_trabajo: formData.tipoTrabajo,
    Recuperable: formData.recuperable,

    // Datos exclusivos de contratos
    Fecha_Ocupacion_Benefica: formatDateForAPI(formData.fechaOcupacion),
    Fecha_Terminacion_Sustancial: formatDateForAPI(formData.fechaSustancial),
    FechaTerminacionFinalCont: formatDateForAPI(formData.fechaFinalContratos),
    Fianza_Anticipo: formData.fianzaAnticipo,
    FianzaCumplimiento_BuenaCalidad: formData.fianzaCumplimiento,
    Fianza_Pasivos_Contingentes: formData.fianzaPasivos,

    // Documentos (checkboxes)
    Cotizacion_MPA_CP: checkboxToNumber(formData.docCotizacion),
    AprobacionCorreoConcurso: checkboxToNumber(formData.docAprobacion),
    AnalisisRiesgosWHSE_VOBO: checkboxToNumber(formData.docAnalisisRiesgos),
    DibujosEspecificaciones: checkboxToNumber(formData.docDibujos),
    ProgramaObra: checkboxToNumber(formData.docProgramaObra),
    Acta_Constitutiva: checkboxToNumber(formData.docActaConstitutiva),
    Poder_Notarial: checkboxToNumber(formData.docPoderNotarial),
    INE_Rep_Legal: checkboxToNumber(formData.docINE),
    AltaIMSS_REPSE: checkboxToNumber(formData.docAltaIMSS),
    InfoBancariaContrato: checkboxToNumber(formData.docInfoBancaria),

    // Metadata
    // IMPORTANTE: NO establecer approve aquí, se deja NULL en el backend
    // approve: undefined, // Se omite para que quede NULL
    Usuario: localStorage.getItem('username') || formData.responsable,
    Mode: 'Normal',
  };
};

/**
 * Mapea datos del formulario OS a la estructura del API
 */
export const mapFormatoOSToAPI = (formData: any): CAFSolicitudOS => {
  return {
    // Información base
    Tipo_Contratacion: 'OS',
    Responsable: formData.responsable,
    Fecha: formatDateForAPI(formData.fecha),
    Cliente: formData.cliente,
    Building: formData.buildingId,
    Direccion: formData.direccion,
    Proveedor: formData.proveedor,
    Descripcion_trabajo_servicio: formData.descripcion,
    Justificacion_trabajo: formData.justificacion,
    Enlace_sharepoint: formData.sharepoint,

    // Datos de trabajos/servicios
    Fecha_inicio: formatDateForAPI(formData.fechaInicio),
    FechaTerminacionFinalServ: formatDateForAPI(formData.fechaFin),
    MontoMXNsubtotal: formData.montoPesos,
    MontoUSDsubtotal: formData.montoDolares,
    TDC: formData.tdc,
    Anticipo: formData.anticipo,
    Fuerza_trabajo: formData.fuerzaTrabajo,
    Presupuesto_existente: formData.presupuesto,
    Tipo_trabajo: formData.tipoTrabajo,
    Recuperable: formData.recuperable,

    // Documentos
    Cotizacion_MPA_CP: checkboxToNumber(formData.docCotizacion),
    AprobacionCorreoConcurso: checkboxToNumber(formData.docAprobacion),
    AnalisisRiesgosWHSE_VOBO: checkboxToNumber(formData.docAnalisisRiesgos),
    DibujosEspecificaciones: checkboxToNumber(formData.docDibujos),
    ProgramaObra: checkboxToNumber(formData.docProgramaObra),

    // Metadata - NO establecer approve
    Usuario: localStorage.getItem('username') || formData.responsable,
    Mode: 'Normal',
  };
};

/**
 * Mapea datos del formulario OC a la estructura del API
 */
export const mapFormatoOCToAPI = (formData: any): CAFSolicitudOC => {
  return {
    // Información base
    Tipo_Contratacion: 'OC',
    Responsable: formData.responsable,
    Fecha: formatDateForAPI(formData.fecha),
    Cliente: formData.cliente,
    Building: formData.buildingId,
    Direccion: formData.direccion,
    Proveedor: formData.proveedor,
    Descripcion_trabajo_servicio: formData.descripcion,
    Justificacion_trabajo: formData.justificacion,
    Enlace_sharepoint: formData.sharepoint,

    // Datos de trabajos/servicios
    Fecha_inicio: formatDateForAPI(formData.fechaInicio),
    FechaTerminacionFinalServ: formatDateForAPI(formData.fechaFin),
    MontoMXNsubtotal: formData.montoPesos,
    MontoUSDsubtotal: formData.montoDolares,
    TDC: formData.tdc,
    Anticipo: formData.anticipo,
    Fuerza_trabajo: formData.fuerzaTrabajo,
    Presupuesto_existente: formData.presupuesto,
    Tipo_trabajo: formData.tipoTrabajo,
    Recuperable: formData.recuperable,

    // Datos exclusivos de OC
    MontoOriginalMXN: formData.montoOriginalPesos,
    MontoOriginalUSD: formData.montoOriginalDolares,
    MontoActualizadoMXN: formData.montoActualizado,
    MontoActualizadoUSD: formData.montoActualizadoUSD,
    NuevaOcupacionBenefica: formData.nuevaOcupacion,
    NuevaTerminacionSust: formData.nuevaSustancial,
    NuevaTerminacionFinal: formData.nuevaFinal,
    TiempoDias: formData.tiempoDias,

    // Documentos
    Cotizacion_MPA_CP: checkboxToNumber(formData.docCotizacion),
    AprobacionCorreoConcurso: checkboxToNumber(formData.docAprobacion),
    AnalisisRiesgosWHSE_VOBO: checkboxToNumber(formData.docAnalisisRiesgos),
    DibujosEspecificaciones: checkboxToNumber(formData.docDibujos),
    ProgramaObra: checkboxToNumber(formData.docProgramaObra),

    // Metadata - NO establecer approve
    Usuario: localStorage.getItem('username') || formData.responsable,
    Mode: 'Normal',
  };
};

/**
 * Mapea datos del formulario PD a la estructura del API
 */
export const mapFormatoPDToAPI = (formData: any): CAFSolicitudPD => {
  return {
    // Información base
    Tipo_Contratacion: 'PD',
    Responsable: formData.responsable,
    Fecha: formatDateForAPI(formData.fecha),
    Cliente: formData.cliente,
    Building: formData.buildingId,
    Direccion: formData.direccion,
    Proveedor: formData.proveedor,
    Descripcion_trabajo_servicio: formData.descripcion,
    Justificacion_trabajo: formData.justificacion,
    Enlace_sharepoint: formData.sharepoint,

    // Datos específicos
    MontoMXNsubtotal: formData.montoPesos,
    Presupuesto_existente: formData.presupuesto,
    Tipo_trabajo: formData.tipoTrabajo,

    // Documentos comunes
    Cotizacion_MPA_CP: checkboxToNumber(formData.docCotizacion),
    AprobacionCorreoConcurso: checkboxToNumber(formData.docAprobacion),
    AnalisisRiesgosWHSE_VOBO: checkboxToNumber(formData.docAnalisisRiesgos),
    DibujosEspecificaciones: checkboxToNumber(formData.docDibujos),
    ProgramaObra: checkboxToNumber(formData.docProgramaObra),

    // Documentos exclusivos PD
    VOBO_LegalPagoDep: checkboxToNumber(formData.docVOBOLegal),
    FichaPago: checkboxToNumber(formData.docFichaPago),
    InfoBancariaPagoDep: checkboxToNumber(formData.docInfoBancaria),

    // Metadata - NO establecer approve
    Usuario: localStorage.getItem('username') || formData.responsable,
    Mode: 'Normal',
  };
};

/**
 * Mapea datos del formulario FD a la estructura del API
 */
export const mapFormatoFDToAPI = (formData: any): CAFSolicitudFD => {
  return {
    // Información base
    Tipo_Contratacion: 'FD',
    Responsable: formData.responsable,
    Fecha: formatDateForAPI(formData.fecha),
    Cliente: formData.cliente,
    Building: formData.buildingId,
    Direccion: formData.direccion,
    Proveedor: formData.proveedor,
    Descripcion_trabajo_servicio: formData.descripcion,
    Justificacion_trabajo: formData.justificacion,
    Enlace_sharepoint: formData.sharepoint,

    // Documentos comunes
    Cotizacion_MPA_CP: checkboxToNumber(formData.docCotizacion),
    AprobacionCorreoConcurso: checkboxToNumber(formData.docAprobacion),
    AnalisisRiesgosWHSE_VOBO: checkboxToNumber(formData.docAnalisisRiesgos),
    DibujosEspecificaciones: checkboxToNumber(formData.docDibujos),
    ProgramaObra: checkboxToNumber(formData.docProgramaObra),

    // Documentos exclusivos FD
    VOBO_LegalFirma: checkboxToNumber(formData.docVOBOLegal),
    DocumentoFirmar: checkboxToNumber(formData.docDocumentoFirmar),

    // Metadata - NO establecer approve
    Usuario: localStorage.getItem('username') || formData.responsable,
    Mode: 'Normal',
  };
};

// Las funciones de mapeo del API al formulario permanecen igual
export const mapAPIToFormatoCO = (apiData: any): any => {
  return {
    buildingId: apiData.Building || "",
    cliente: apiData.Cliente || "",
    direccion: apiData.Direccion || "",
    proveedor: apiData.Proveedor || "",
    fechaInicio: apiData.Fecha_inicio || "",
    fechaFin: apiData.FechaTerminacionFinalServ || "",
    montoPesos: apiData.MontoMXNsubtotal || "",
    montoDolares: apiData.MontoUSDsubtotal || "",
    tdc: apiData.TDC || "",
    anticipo: apiData.Anticipo || "",
    fuerzaTrabajo: apiData.Fuerza_trabajo || "",
    presupuesto: apiData.Presupuesto_existente || "",
    tipoTrabajo: apiData.Tipo_trabajo || "Desarrollo",
    recuperable: apiData.Recuperable || "REC",
    fechaOcupacion: apiData.Fecha_Ocupacion_Benefica || "",
    fechaSustancial: apiData.Fecha_Terminacion_Sustancial || "",
    fechaFinalContratos: apiData.FechaTerminacionFinalCont || "",
    fianzaAnticipo: apiData.Fianza_Anticipo || "",
    fianzaCumplimiento: apiData.FianzaCumplimiento_BuenaCalidad || "",
    fianzaPasivos: apiData.Fianza_Pasivos_Contingentes || "",
    responsable: apiData.Responsable || "",
    fecha: apiData.Fecha || "",
    descripcion: apiData.Descripcion_trabajo_servicio || "",
    justificacion: apiData.Justificacion_trabajo || "",
    sharepoint: apiData.Enlace_sharepoint || "",
    
    // Checkboxes comunes
    docCotizacion: numberToCheckbox(apiData.Cotizacion_MPA_CP),
    docAprobacion: numberToCheckbox(apiData.AprobacionCorreoConcurso),
    docAnalisisRiesgos: numberToCheckbox(apiData.AnalisisRiesgosWHSE_VOBO),
    docDibujos: numberToCheckbox(apiData.DibujosEspecificaciones),
    docProgramaObra: numberToCheckbox(apiData.ProgramaObra),
    
    // Checkboxes exclusivos de contratos
    docActaConstitutiva: numberToCheckbox(apiData.Acta_Constitutiva),
    docPoderNotarial: numberToCheckbox(apiData.Poder_Notarial),
    docINE: numberToCheckbox(apiData.INE_Rep_Legal),
    docAltaIMSS: numberToCheckbox(apiData.AltaIMSS_REPSE),
    docInfoBancaria: numberToCheckbox(apiData.InfoBancariaContrato),
  };
};

export const mapAPIToFormatoOS = (apiData: any): any => {
  return {
    buildingId: apiData.Building || "",
    cliente: apiData.Cliente || "",
    direccion: apiData.Direccion || "",
    proveedor: apiData.Proveedor || "",
    fechaInicio: apiData.Fecha_inicio || "",
    fechaFin: apiData.FechaTerminacionFinalServ || "",
    montoPesos: apiData.MontoMXNsubtotal || "",
    montoDolares: apiData.MontoUSDsubtotal || "",
    tdc: apiData.TDC || "",
    anticipo: apiData.Anticipo || "",
    fuerzaTrabajo: apiData.Fuerza_trabajo || "",
    presupuesto: apiData.Presupuesto_existente || "",
    tipoTrabajo: apiData.Tipo_trabajo || "Desarrollo",
    recuperable: apiData.Recuperable || "REC",
    responsable: apiData.Responsable || "",
    fecha: apiData.Fecha || "",
    descripcion: apiData.Descripcion_trabajo_servicio || "",
    justificacion: apiData.Justificacion_trabajo || "",
    sharepoint: apiData.Enlace_sharepoint || "",
    
    docCotizacion: numberToCheckbox(apiData.Cotizacion_MPA_CP),
    docAprobacion: numberToCheckbox(apiData.AprobacionCorreoConcurso),
    docAnalisisRiesgos: numberToCheckbox(apiData.AnalisisRiesgosWHSE_VOBO),
    docDibujos: numberToCheckbox(apiData.DibujosEspecificaciones),
    docProgramaObra: numberToCheckbox(apiData.ProgramaObra),
  };
};

export const mapAPIToFormatoOC = (apiData: any): any => {
  return {
    buildingId: apiData.Building || "",
    cliente: apiData.Cliente || "",
    direccion: apiData.Direccion || "",
    proveedor: apiData.Proveedor || "",
    fechaInicio: apiData.Fecha_inicio || "",
    fechaFin: apiData.FechaTerminacionFinalServ || "",
    montoPesos: apiData.MontoMXNsubtotal || "",
    montoDolares: apiData.MontoUSDsubtotal || "",
    tdc: apiData.TDC || "",
    anticipo: apiData.Anticipo || "",
    fuerzaTrabajo: apiData.Fuerza_trabajo || "",
    presupuesto: apiData.Presupuesto_existente || "",
    tipoTrabajo: apiData.Tipo_trabajo || "Desarrollo",
    recuperable: apiData.Recuperable || "REC",
    montoOriginalPesos: apiData.MontoOriginalMXN || "",
    montoOriginalDolares: apiData.MontoOriginalUSD || "",
    montoActualizado: apiData.MontoActualizadoMXN || "",
    montoActualizadoUSD: apiData.MontoActualizadoUSD || "",
    nuevaOcupacion: apiData.NuevaOcupacionBenefica || "",
    nuevaSustancial: apiData.NuevaTerminacionSust || "",
    nuevaFinal: apiData.NuevaTerminacionFinal || "",
    tiempoDias: apiData.TiempoDias || "",
    responsable: apiData.Responsable || "",
    fecha: apiData.Fecha || "",
    descripcion: apiData.Descripcion_trabajo_servicio || "",
    justificacion: apiData.Justificacion_trabajo || "",
    sharepoint: apiData.Enlace_sharepoint || "",
    
    docCotizacion: numberToCheckbox(apiData.Cotizacion_MPA_CP),
    docAprobacion: numberToCheckbox(apiData.AprobacionCorreoConcurso),
    docAnalisisRiesgos: numberToCheckbox(apiData.AnalisisRiesgosWHSE_VOBO),
    docDibujos: numberToCheckbox(apiData.DibujosEspecificaciones),
    docProgramaObra: numberToCheckbox(apiData.ProgramaObra),
  };
};

export const mapAPIToFormatoPD = (apiData: any): any => {
  return {
    buildingId: apiData.Building || "",
    cliente: apiData.Cliente || "",
    direccion: apiData.Direccion || "",
    proveedor: apiData.Proveedor || "",
    montoPesos: apiData.MontoMXNsubtotal || "",
    presupuesto: apiData.Presupuesto_existente || "",
    tipoTrabajo: apiData.Tipo_trabajo || "Desarrollo",
    responsable: apiData.Responsable || "",
    fecha: apiData.Fecha || "",
    descripcion: apiData.Descripcion_trabajo_servicio || "",
    justificacion: apiData.Justificacion_trabajo || "",
    sharepoint: apiData.Enlace_sharepoint || "",
    
    docCotizacion: numberToCheckbox(apiData.Cotizacion_MPA_CP),
    docAprobacion: numberToCheckbox(apiData.AprobacionCorreoConcurso),
    docAnalisisRiesgos: numberToCheckbox(apiData.AnalisisRiesgosWHSE_VOBO),
    docDibujos: numberToCheckbox(apiData.DibujosEspecificaciones),
    docProgramaObra: numberToCheckbox(apiData.ProgramaObra),
    
    docVOBOLegal: numberToCheckbox(apiData.VOBO_LegalPagoDep),
    docFichaPago: numberToCheckbox(apiData.FichaPago),
    docInfoBancaria: numberToCheckbox(apiData.InfoBancariaPagoDep),
  };
};

export const mapAPIToFormatoFD = (apiData: any): any => {
  return {
    buildingId: apiData.Building || "",
    cliente: apiData.Cliente || "",
    direccion: apiData.Direccion || "",
    proveedor: apiData.Proveedor || "",
    responsable: apiData.Responsable || "",
    fecha: apiData.Fecha || "",
    descripcion: apiData.Descripcion_trabajo_servicio || "",
    justificacion: apiData.Justificacion_trabajo || "",
    sharepoint: apiData.Enlace_sharepoint || "",
    
    docCotizacion: numberToCheckbox(apiData.Cotizacion_MPA_CP),
    docAprobacion: numberToCheckbox(apiData.AprobacionCorreoConcurso),
    docAnalisisRiesgos: numberToCheckbox(apiData.AnalisisRiesgosWHSE_VOBO),
    docDibujos: numberToCheckbox(apiData.DibujosEspecificaciones),
    docProgramaObra: numberToCheckbox(apiData.ProgramaObra),
    
    docVOBOLegal: numberToCheckbox(apiData.VOBO_LegalFirma),
    docDocumentoFirmar: numberToCheckbox(apiData.DocumentoFirmar),
  };
};