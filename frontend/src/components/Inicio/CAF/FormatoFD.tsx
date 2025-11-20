import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import "./FormatoFD.css";
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import { mapFormatoFDToAPI, mapAPIToFormatoFD } from "../../../utils/caf-solicitud.utils";
import ApprovalActions from "./ApprovalActions";
import ResponsableSelect from "../../shared/ResponsableSelect";
import ApprovedPDFDownload from "./ApprovedPDFDownload";
import { generatePDFFD } from "../../../utils/pdf/generatePDFFD";

// ✅ Interface agregada para aceptar la prop tipoContrato
interface Props {
  tipoContrato: string;
}

// ✅ Componente ahora recibe la prop tipoContrato
const FormatoFD: React.FC<Props> = ({ tipoContrato }) => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    buildingId: "",
    cliente: "",
    direccion: "",
    proveedor: "",
    responsable: "",
    fecha: "",
    descripcion: "",
    justificacion: "",
    sharepoint: "",
    tipo_contratacion: "",
    // ✅ Checkboxes comunes - AGREGAR ESTOS
    docCotizacion: false,
    docAprobacion: false,
    docAnalisisRiesgos: false,
    docDibujos: false,
    docProgramaObra: false,
    // Checkboxes exclusivos FD
    docVOBOLegal: false,
    docDocumentoFirmar: false,
  });

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

  useEffect(() => {
    if (id) {
      loadExistingData(parseInt(id));
    }
  }, [id]);



  const loadExistingData = async (solicitudId: number) => {
    setLoadingData(true);
    setError(null);

    try {
      const response = await cafSolicitudService.getSolicitudById(solicitudId);
      const mappedData = mapAPIToFormatoFD(response);
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
      const solicitudData = mapFormatoFDToAPI(formData);

      if (isEditMode && id) {
        const response = await cafSolicitudService.updateSolicitud(parseInt(id), solicitudData);
        setSuccess(`Solicitud CAF actualizada exitosamente con ID: ${response.id_solicitud}`);
        console.log("Solicitud actualizada:", response);
      } else {
        const response = await cafSolicitudService.createSolicitudFD(solicitudData);
        setSuccess(`Solicitud CAF creada exitosamente con ID: ${response.id_solicitud}`);
        console.log("Solicitud creada:", response);
      }
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

      {/* Mostrar botón de PDF solo cuando está aprobado */}
      {isEditMode && solicitudData && solicitudData.approve === 1 && (
        <ApprovedPDFDownload
          generatePDF={generatePDFFD}
          formData={formData}
          solicitudData={solicitudData}
          tipo="FD"
          onSuccess={setSuccess}
          onError={setError}
        />
      )}

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
          {/* -------- IZQUIERDA -------- */}
          <Col md={6}>
            {/* ✅ Ahora muestra el tipo de contrato que viene de la prop */}
            <h6 className="fw-semibold">
              Tipo de Contratación: <span className="text-primary">{formData.tipo_contratacion || tipoContrato}</span>
            </h6>

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
                />
              </Form.Group>
            ))}

            <h6 className="mt-3">Documentos a Enviar</h6>
            {[
              { label: "Cotización MPA y VOBO de C&P", name: "docCotizacion" },
              { label: "Aprobación (correo) si no hay concurso", name: "docAprobacion" },
              { label: "Análisis de Riesgo WHSE y VOBO", name: "docAnalisisRiesgos" },
              { label: "Dibujos y/o especificaciones", name: "docDibujos" },
              { label: "Programa de Obra", name: "docProgramaObra" },
            ].map((doc, i) => (
              <Form.Check
                key={i}
                type="checkbox"
                label={doc.label}
                name={doc.name}
                checked={(formData as any)[doc.name]}
                onChange={handleChange}
                {...getFieldProps()}
                className="mb-1"
              />
            ))}

            <h6 className="mt-3">Documentos Exclusivos para Firma de Documento</h6>
            {[
              { label: "VOBO Legal", name: "docVOBOLegal" },
              { label: "Documento a firmar", name: "docDocumentoFirmar" },
            ].map((d, i) => (
              <Form.Check
                key={i}
                type="checkbox"
                label={d.label}
                name={d.name}
                checked={(formData as any)[d.name]}
                onChange={handleChange}
                className="mb-1"
              />
            ))}
          </Col>

          {/* -------- DERECHA -------- */}
          <Col md={6}>
            <ResponsableSelect
              value={formData.responsable}
              onChange={handleChange}
              {...getFieldProps()}
              required
            />

            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción de los Trabajos/Servicios Solicitados</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Form.Group>

            <h6>Justificación de Trabajos</h6>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={2}
                name="justificacion"
                value={formData.justificacion}
                onChange={handleChange}
              />
            </Form.Group>
            {/* Enlace SharePoint */}
            <Form.Group className="mt-4">
              <Form.Label>Enlace de Sharepoint para acceder a documentos</Form.Label>
              <Form.Control
                name="sharepoint"
                value={formData.sharepoint}
                onChange={handleChange}
                {...getFieldProps()}
              />
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
            {loading && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
            )}
            {loading ? (isEditMode ? 'Actualizando...' : 'Guardando...') : (isEditMode ? 'Actualizar Formato FD' : 'Guardar Formato FD')}
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
            solicitudData={solicitudData}
            onApprovalComplete={handleApprovalComplete}
          />
        </div>
      )}

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoFD;