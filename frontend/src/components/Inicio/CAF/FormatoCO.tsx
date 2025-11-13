import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "./FormatoCO.css";
// Servicios y utilidades
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import { mapFormatoCOToAPI, mapAPIToFormatoCO } from "../../../utils/caf-solicitud.utils";
import ApprovalActions from "./ApprovalActions";

interface Props {
  tipoContrato: string;
}

const FormatoCO: React.FC<Props> = ({ tipoContrato }) => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Definir nombre del usuario responsable
  const nombreUsuario = user ? `${user.given_name || ''} ${user.family_name || ''}`.trim() : '';

  const [formData, setFormData] = useState({
    buildingId: "",
    cliente: "",
    direccion: "",
    proveedor: "",
    fechaInicio: "",
    fechaFin: "",
    montoPesos: "",
    montoDolares: "",
    tdc: "",
    anticipo: "",
    fuerzaTrabajo: "",
    presupuesto: "",
    tipoTrabajo: "Desarrollo",
    recuperable: "REC",
    fechaOcupacion: "",
    fechaSustancial: "",
    fechaFinalContratos: "",
    fianzaAnticipo: "",
    fianzaCumplimiento: "",
    fianzaPasivos: "",
    responsable: nombreUsuario,
    fecha: "",
    descripcion: "",
    justificacion: "",
    sharepoint: "",
    tipo_contratacion: "",
    // Checkboxes comunes
    docCotizacion: false,
    docAprobacion: false,
    docAnalisisRiesgos: false,
    docDibujos: false,
    docProgramaObra: false,
    // Checkboxes exclusivos de contratos
    docActaConstitutiva: false,
    docPoderNotarial: false,
    docINE: false,
    docAltaIMSS: false,
    docInfoBancaria: false,
  });

  // Estados para UI (loading, errores, éxito)
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para controlar edición según Mode
  const [solicitudData, setSolicitudData] = useState<any>(null);
  
  // Determinar si el formulario debe estar bloqueado
  const isReadOnly = () => {
    if (!isEditMode) return false; // En modo creación, siempre editable
    if (!solicitudData) return false; // Si no hay datos cargados, permitir edición
    
    const mode = solicitudData.Mode;
    // REGLA: Solo editable cuando Mode = "Edit" (requiere correcciones)
    // - Mode = null/undefined → BLOQUEADO (pendiente de revisión)
    // - Mode = "Edit" → EDITABLE (requiere correcciones)  
    // - Mode = "View" → BLOQUEADO (aprobado/rechazado definitivo)
    return mode !== 'Edit';
  };
  
  // Helper para aplicar props de solo lectura
  const getFieldProps = () => ({
    readOnly: isReadOnly(),
    disabled: isReadOnly(),
  });

  // Cargar datos existentes si hay ID en la URL
  useEffect(() => {
    if (id) {
      loadExistingData(parseInt(id));
    }
  }, [id]);

  // Actualizar responsable cuando cambien los datos del usuario
  useEffect(() => {
    if (nombreUsuario && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        responsable: nombreUsuario
      }));
    }
  }, [nombreUsuario, isEditMode]);

  const loadExistingData = async (solicitudId: number) => {
    setLoadingData(true);
    setError(null);

    try {
      const response = await cafSolicitudService.getSolicitudById(solicitudId);
      const mappedData = mapAPIToFormatoCO(response);
      setFormData(mappedData);
      setSolicitudData(response); // Guardar datos originales para acceso a Mode
      console.log("Datos cargados:", response);
    } catch (err: any) {
      console.error("Error al cargar solicitud:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los datos de la solicitud";
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.responsable) {
      setError("El campo Responsable es requerido");
      return false;
    }
    if (!formData.cliente) {
      setError("El campo Cliente/Desarrollo es requerido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const solicitudData = mapFormatoCOToAPI(formData);
      
      if (isEditMode && id) {
        // Modo edición: actualizar solicitud existente
        const response = await cafSolicitudService.updateSolicitud(parseInt(id), solicitudData);
        setSuccess(`Solicitud CAF actualizada exitosamente con ID: ${response.id_solicitud}`);
        console.log("Solicitud actualizada:", response);
      } else {
        // Modo creación: crear nueva solicitud
        const response = await cafSolicitudService.createSolicitudCO(solicitudData);
        setSuccess(`Solicitud CAF creada exitosamente con ID: ${response.id_solicitud}`);
        console.log("Solicitud creada:", response);
      }

      // Opcional: limpiar formulario solo en modo creación
      // if (!isEditMode) {
      //   setFormData({ ...valores iniciales... });
      // }
    } catch (err: any) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} solicitud:`, err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        `Error desconocido al ${isEditMode ? 'actualizar' : 'crear'} la solicitud`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalComplete = (result: any) => {
    console.log("Aprobación completada:", result);
    // Opcional: recargar datos, redirigir, etc.
    if (id) {
      loadExistingData(parseInt(id));
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-3">
        {isEditMode ? `EDITAR SOLICITUD CAF #${id}` : 'SOLICITUD DE CAF PARA CONTRATACIÓN'}
      </h2>
      
      {/* Indicador de estado del formulario */}
      {isEditMode && solicitudData && (
        <div className="text-center mb-4">
          {isReadOnly() ? (
            <Alert variant="info" className="d-inline-flex align-items-center">
              <i className="fas fa-lock me-2"></i>
              <strong>Formulario Bloqueado</strong> - Modo: {solicitudData.Mode || 'View'} 
              | Estado: {cafSolicitudService.getStatusLabel(solicitudData.approve)}
            </Alert>
          ) : (
            <Alert variant="warning" className="d-inline-flex align-items-center">
              <i className="fas fa-edit me-2"></i>
              <strong>Formulario Editable</strong> - Modo: Edit | Requiere Correcciones
            </Alert>
          )}
        </div>
      )}

      {/* Alertas de éxito o error */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          <Alert.Heading>¡Éxito!</Alert.Heading>
          <p>{success}</p>
        </Alert>
      )}

      {/* Spinner mientras se cargan los datos existentes */}
      {loadingData && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando datos...</span>
          </Spinner>
          <p className="mt-2">Cargando datos de la solicitud...</p>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* -------- COLUMNA IZQUIERDA -------- */}
          <Col md={6}>
            <h6 className="fw-semibold">Tipo de Contratación: <span className="text-primary">{solicitudData?.Tipo_Contratacion || tipoContrato}</span></h6>

            <h6 className="mt-3">Información General</h6>
            {[
              { label: "Building ID", name: "buildingId" },
              { label: "Cliente/Desarrollo", name: "cliente" },
              { label: "Dirección", name: "direccion" },
              { label: "Proveedor", name: "proveedor" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control 
                  name={f.name} 
                  value={(formData as any)[f.name]} 
                  onChange={handleChange}
                  {...getFieldProps()}
                />
              </Form.Group>
            ))}

            <h6 className="mt-3">Datos de los Trabajos / Servicios</h6>
            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de inicio</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="fechaInicio" 
                    value={formData.fechaInicio} 
                    onChange={handleChange}
                    {...getFieldProps()}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de Terminación Final</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="fechaFin" 
                    value={formData.fechaFin} 
                    onChange={handleChange}
                    {...getFieldProps()}
                  />
                </Form.Group>
              </Col>
            </Row>

            {[
              { label: "Monto en pesos (subtotal)", name: "montoPesos" },
              { label: "Monto en dólares (subtotal)", name: "montoDolares" },
              { label: "TDC", name: "tdc" },
              { label: "Anticipo %", name: "anticipo" },
              { label: "Fuerza de trabajo aproximada", name: "fuerzaTrabajo" },
              { label: "Presupuesto existente", name: "presupuesto" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control 
                  name={f.name} 
                  value={(formData as any)[f.name]} 
                  onChange={handleChange}
                  {...getFieldProps()}
                />
              </Form.Group>
            ))}

            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo de trabajo</Form.Label>
                  <Form.Select 
                    name="tipoTrabajo" 
                    value={formData.tipoTrabajo} 
                    onChange={handleChange}
                    {...getFieldProps()}
                  >
                    <option>Desarrollo</option>
                    <option>Mantenimiento</option>
                    <option>Supervisión</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-4">
                  <Form.Label>Es recuperable o No Recuperable</Form.Label>
                  <Form.Select 
                    name="recuperable" 
                    value={formData.recuperable} 
                    onChange={handleChange}
                    {...getFieldProps()}
                  >
                    <option>REC</option>
                    <option>NO REC</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mt-3">Datos exclusivos para contratos</h6>
            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha Ocupación Benéfica</Form.Label>
                  <Form.Control type="date" name="fechaOcupacion" value={formData.fechaOcupacion} onChange={handleChange} {...getFieldProps()} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha Terminación Sustancial</Form.Label>
                  <Form.Control type="date" name="fechaSustancial" value={formData.fechaSustancial} onChange={handleChange} {...getFieldProps()} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label>Fecha Terminación Final Contratos</Form.Label>
              <Form.Control type="date" name="fechaFinalContratos" value={formData.fechaFinalContratos} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            {[
              { label: "Fianza Anticipo", name: "fianzaAnticipo" },
              { label: "Fianza Cumplimiento/Buena Calidad", name: "fianzaCumplimiento" },
              { label: "Fianza Pasivos Contingentes", name: "fianzaPasivos" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control name={f.name} value={(formData as any)[f.name]} onChange={handleChange} {...getFieldProps()} />
              </Form.Group>
            ))}
          </Col>

          {/* -------- COLUMNA DERECHA -------- */}
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Responsable</Form.Label>
              <Form.Control name="responsable" value={formData.responsable} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción de los Trabajos/Servicios Solicitados</Form.Label>
              <Form.Control as="textarea" rows={2} name="descripcion" value={formData.descripcion} onChange={handleChange} {...getFieldProps()}  />
            </Form.Group>

            <h6>Documentos a Enviar</h6>
            {[
              { label: "Cotización MPA y VOBO de C&P", name: "docCotizacion" },
              { label: "Aprobación (correo) si no hay concurso", name: "docAprobacion" },
              { label: "Análisis de Riesgo WHSE y VOBO", name: "docAnalisisRiesgos" },
              { label: "Dibujos y/o especificaciones", name: "docDibujos" },
              { label: "Programa de Obra", name: "docProgramaObra" },
            ].map((d, i) => (
              <Form.Check
                key={i}
                type="checkbox"
                label={d.label}
                name={d.name}
                checked={(formData as any)[d.name]}
                onChange={handleChange}
                className="mb-1"
                {...getFieldProps()}
              />
            ))}

            <Form.Group className="mt-4 mb-3">
              <Form.Label>Justificación de Trabajos</Form.Label>
              <Form.Control as="textarea" rows={2} name="justificacion" value={formData.justificacion} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <h6>Documentos Exclusivos para Contratos</h6>
            {[
              { label: "Acta constitutiva", name: "docActaConstitutiva" },
              { label: "Poder notarial", name: "docPoderNotarial" },
              { label: "INE Representante legal", name: "docINE" },
              { label: "Alta IMSS y REPSE", name: "docAltaIMSS" },
              { label: "Información bancaria", name: "docInfoBancaria" },
            ].map((d, i) => (
              <Form.Check
                key={i}
                type="checkbox"
                label={d.label}
                name={d.name}
                checked={(formData as any)[d.name]}
                onChange={handleChange}
                className="mb-1"
                {...getFieldProps()}
              />
            ))}

            <Form.Group className="mt-4">
              <Form.Label>Enlace de Sharepoint para acceder a documentos</Form.Label>
              <Form.Control name="sharepoint" value={formData.sharepoint} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>
          </Col>

        </Row>



        <div className="text-center mt-4">
          <Button
            type="submit"
            variant="primary"
            className="px-4"
            disabled={loading || loadingData || isReadOnly()}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {isEditMode ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              isEditMode ? "Actualizar Formato CO" : "Guardar Formato CO"
            )}
          </Button>
        </div>
      </Form>

      {/* Mostrar botones de aprobación solo en modo edición */}
      {isEditMode && (
        <div className="my-4">
          <ApprovalActions
            solicitudId={parseInt(id!)}
            currentStatus={solicitudData?.approve}
            tipoContratacion={tipoContrato}
            responsable={formData.responsable}
            onApprovalComplete={handleApprovalComplete}
          />
        </div>
      )}

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoCO;
