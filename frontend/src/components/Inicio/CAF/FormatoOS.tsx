import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import "./FormatoOS.css";
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import { mapFormatoOSToAPI, mapAPIToFormatoOS } from "../../../utils/caf-solicitud.utils";
import ApprovalActions from "./ApprovalActions";
import ResponsableSelect from "../../shared/ResponsableSelect";
import BuildingSelect from "../../shared/BuildingSelect";
import ApprovedPDFDownload from "./ApprovedPDFDownload";
import { generatePDFOS } from "../../../utils/pdf/generatePDFOS";
import { tipoTrabajoOptions } from "../../../types/caf-solicitud.types";

interface Props {
  tipoContrato: string;
}

const FormatoOS: React.FC<Props> = ({ tipoContrato }) => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

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
    tipoTrabajo: tipoTrabajoOptions[0],
    recuperable: "REC",
    responsable: "",
    descripcion: "",
    justificacion: "",
    sharepoint: "",
    fecha: "",
    tipo_contratacion: "",
    // Checkboxes
    docCotizacion: false,
    docAprobacion: false,
    docAnalisisRiesgos: false,
    docDibujos: false,
    docProgramaObra: false,
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado para controlar edición según Mode y datos de solicitud
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
      const mappedData = mapAPIToFormatoOS(response);
      setFormData(mappedData);
      setSolicitudData(response); // Guardar datos originales para acceso a Mode y approve
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const solicitudData = mapFormatoOSToAPI(formData);

      if (isEditMode && id) {
        const response = await cafSolicitudService.updateSolicitud(parseInt(id), solicitudData);
        setSuccess(`Solicitud CAF actualizada exitosamente con ID: ${response.id_solicitud}`);
        console.log("Solicitud actualizada:", response);
      } else {
        const response = await cafSolicitudService.createSolicitudOS(solicitudData);
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
          generatePDF={generatePDFOS}
          formData={formData}
          solicitudData={solicitudData}
          tipo="OS"
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
        {/* --- SECCIÓN GENERAL --- */}
        <Row>
          <Col md={6}>
            <h6 className="fw-semibold">Tipo de Contratación: <span className="text-primary">{formData.tipo_contratacion || tipoContrato}</span></h6>
            <h6 className="mt-3">Información General</h6>

            <BuildingSelect
              value={formData.buildingId}
              onChange={handleChange}
              {...getFieldProps()}
              required
            />

            <Form.Group className="mb-2">
              <Form.Label>
                Cliente/Desarrollo
                <span className="text-danger ms-1">*</span>
              </Form.Label>
              <Form.Control name="cliente" value={formData.cliente} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control name="direccion" value={formData.direccion} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control name="proveedor" value={formData.proveedor} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <h6>Datos de los Trabajos / Servicios</h6>

            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de inicio</Form.Label>
                  <Form.Control type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} {...getFieldProps()} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de Terminación Final</Form.Label>
                  <Form.Control type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} {...getFieldProps()} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label>Monto en pesos (subtotal)</Form.Label>
              <Form.Control name="montoPesos" value={formData.montoPesos} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Monto en dólares (subtotal)</Form.Label>
              <Form.Control name="montoDolares" value={formData.montoDolares} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>TDC</Form.Label>
              <Form.Control name="tdc" value={formData.tdc} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Anticipo %</Form.Label>
              <Form.Control name="anticipo" value={formData.anticipo} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fuerza de trabajo aproximada</Form.Label>
              <Form.Control name="fuerzaTrabajo" value={formData.fuerzaTrabajo} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Presupuesto existente</Form.Label>
              <Form.Control name="presupuesto" value={formData.presupuesto} onChange={handleChange} {...getFieldProps()} />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo de trabajo</Form.Label>
                  <Form.Select name="tipoTrabajo" value={formData.tipoTrabajo} onChange={handleChange} {...getFieldProps()}>
                        {tipoTrabajoOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-4">
                  <Form.Label>Es recuperable o No Recuperable</Form.Label>
                  <Form.Select name="recuperable" value={formData.recuperable} onChange={handleChange}>
                    <option>REC</option>
                    <option>NO REC</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Col>

          {/* --- SECCIÓN DERECHA --- */}
          <Col md={6}>
            <ResponsableSelect
              value={formData.responsable}
              onChange={handleChange}
              {...getFieldProps()}
              required
            />

            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
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

            <h6>Documentos a Enviar</h6>
            {[
              { label: "Cotización MPA y VOBO de C&P", name: "docCotizacion" },
              { label: "Aprobación (correo) si no hay concurso", name: "docAprobacion" },
              { label: "Análisis de Riesgo WHSE y VOBO", name: "docAnalisisRiesgos" },
              { label: "Dibujos y especificaciones", name: "docDibujos" },
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
              />
            ))}

            <Form.Group className="mt-4">
              <Form.Label>Justificación de Trabajos</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="justificacion"
                value={formData.justificacion}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mt-4">
              <Form.Label>Enlace de Sharepoint para acceder a documentos</Form.Label>
              <Form.Control name="sharepoint" value={formData.sharepoint} onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button
            variant="primary"
            type="submit"
            className="px-4"
            disabled={loading || loadingData}
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
              isEditMode ? "Actualizar Solicitud" : "Guardar Solicitud"
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
            solicitudData={solicitudData}
            onApprovalComplete={handleApprovalComplete}
          />
        </div>
      )}

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoOS;
