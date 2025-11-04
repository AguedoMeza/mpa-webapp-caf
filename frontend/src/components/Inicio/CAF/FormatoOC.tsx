import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import "./FormatoOC.css";
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import { mapFormatoOCToAPI, mapAPIToFormatoOC } from "../../../utils/caf-solicitud.utils";

interface Props {
  tipoContrato: string;
}

const FormatoOC: React.FC<Props> = ({ tipoContrato }) => {
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
    tipoTrabajo: "Desarrollo",
    recuperable: "REC",
    montoOriginalPesos: "",
    montoOriginalDolares: "",
    montoActualizado: "",
    montoActualizadoUSD: "",
    responsable: "",
    fecha: "",
    descripcion: "",
    justificacion: "",
    nuevaOcupacion: "",
    nuevaSustancial: "",
    nuevaFinal: "",
    tiempoDias: "",
    sharepoint: "",
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
      const mappedData = mapAPIToFormatoOC(response);
      setFormData(mappedData);
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
      const solicitudData = mapFormatoOCToAPI(formData);
      
      if (isEditMode && id) {
        const response = await cafSolicitudService.updateSolicitud(parseInt(id), solicitudData);
        setSuccess(`Solicitud CAF actualizada exitosamente con ID: ${response.id_solicitud}`);
        console.log("Solicitud actualizada:", response);
      } else {
        const response = await cafSolicitudService.createSolicitudOC(solicitudData);
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

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5">
        {isEditMode ? `EDITAR SOLICITUD CAF #${id}` : 'SOLICITUD DE CAF PARA CONTRATACIÓN'}
      </h2>

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
        <div className="form-columns">
          {/* -------- COLUMNA IZQUIERDA -------- */}
          <div className="form-column">
            <h6 className="fw-semibold">Tipo de Contratación: <span className="text-primary">{tipoContrato}</span></h6>

            <h6 className="mt-3">Información General</h6>
            {["buildingId", "cliente", "direccion", "proveedor"].map((name, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{name === "cliente" ? "Cliente/Desarrollo" : name.charAt(0).toUpperCase() + name.slice(1)}</Form.Label>
                <Form.Control name={name} value={(formData as any)[name]} onChange={handleChange} />
              </Form.Group>
            ))}

            <h6 className="mt-3">Datos de los Trabajos / Servicios</h6>
            <div className="form-column">
               
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de inicio</Form.Label>
                  <Form.Control type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} />
                </Form.Group>
               
               
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de Terminación Final</Form.Label>
                  <Form.Control type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} />
                </Form.Group>
               
            </div>

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
                <Form.Control name={f.name} value={(formData as any)[f.name]} onChange={handleChange} />
              </Form.Group>
            ))}

            <div className="form-column">
             
                <Form.Group className="mb-2">
                  <Form.Label>Tipo de trabajo</Form.Label>
                  <Form.Select name="tipoTrabajo" value={formData.tipoTrabajo} onChange={handleChange}>
                    <option>Desarrollo</option>
                    <option>Mantenimiento</option>
                    <option>Supervisión</option>
                  </Form.Select>
                </Form.Group>
               
               
                <Form.Group className="mb-4">
                  <Form.Label>Es recuperable o No Recuperable</Form.Label>
                  <Form.Select name="recuperable" value={formData.recuperable} onChange={handleChange}>
                    <option>REC</option>
                    <option>NO REC</option>
                  </Form.Select>
                </Form.Group>
             
            </div>

            <h6 className="mt-3">Datos exclusivos para Órdenes de Cambio</h6>
            {[
              { label: "Monto original en pesos", name: "montoOriginalPesos" },
              { label: "Monto original en dólares", name: "montoOriginalDolares" },
              { label: "Monto actualizado en pesos", name: "montoActualizado" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control name={f.name} value={(formData as any)[f.name]} onChange={handleChange} />
              </Form.Group>
            ))}
          </div>

          {/* -------- COLUMNA DERECHA -------- */}
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Responsable</Form.Label>
              <Form.Control name="responsable" value={formData.responsable} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción de los Trabajos/Servicios Solicitados</Form.Label>
              <Form.Control as="textarea" rows={2} name="descripcion" value={formData.descripcion} onChange={handleChange} />
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

            <Form.Group className="mt-4 mb-3">
              <Form.Label>Justificación de Trabajos</Form.Label>
              <Form.Control as="textarea" rows={2} name="justificacion" value={formData.justificacion} onChange={handleChange} />
            </Form.Group>

            <h6>Fechas de Órdenes de Cambio</h6>
            {[
              { label: "Nueva Ocupación Benéfica", name: "nuevaOcupacion" },
              { label: "Nueva Terminación Sustancial", name: "nuevaSustancial" },
              { label: "Nueva Terminación Final", name: "nuevaFinal" },
              { label: "Tiempo en días", name: "tiempoDias" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control name={f.name} value={(formData as any)[f.name]} onChange={handleChange} />
              </Form.Group>
            ))}
                    <Form.Group className="mt-4">
          <Form.Label>Enlace de Sharepoint para acceder a documentos</Form.Label>
          <Form.Control name="sharepoint" value={formData.sharepoint} onChange={handleChange} />
        </Form.Group>
          </Col>
        </div> 



        <div className="text-center mt-4">
          <Button 
            variant="primary" 
            type="submit" 
            className="px-4"
            disabled={loading || loadingData}
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
            {loading ? (isEditMode ? 'Actualizando...' : 'Guardando...') : (isEditMode ? 'Actualizar Formato OC' : 'Guardar Formato OC')}
          </Button>
        </div>
      </Form>

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoOC;
