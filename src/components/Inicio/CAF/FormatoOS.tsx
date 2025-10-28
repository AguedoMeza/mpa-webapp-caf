
import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import "./FormatoOS.css";

interface Props {
  tipoContrato: string;
}

const FormatoOS: React.FC<Props> = ({ tipoContrato }) => {
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
    responsable: "",
    descripcion: "",
    justificacion: "",
    sharepoint: "",
    fecha: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <Form onSubmit={handleSubmit}>
        {/* --- SECCIÓN GENERAL --- */}
        <Row>
          <Col md={6}>
            <h6 className="fw-semibold">Tipo de Contratación: <span className="text-primary">{tipoContrato}</span></h6>
            <h6 className="mt-3">Información General</h6>

            <Form.Group className="mb-2">
              <Form.Label>Building ID</Form.Label>
              <Form.Control name="buildingId" value={formData.buildingId} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Cliente/Desarrollo</Form.Label>
              <Form.Control name="cliente" value={formData.cliente} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control name="direccion" value={formData.direccion} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control name="proveedor" value={formData.proveedor} onChange={handleChange} />
            </Form.Group>

            <h6>Datos de los Trabajos / Servicios</h6>

            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de inicio</Form.Label>
                  <Form.Control type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha de Terminación Final</Form.Label>
                  <Form.Control type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label>Monto en pesos (subtotal)</Form.Label>
              <Form.Control name="montoPesos" value={formData.montoPesos} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Monto en dólares (subtotal)</Form.Label>
              <Form.Control name="montoDolares" value={formData.montoDolares} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>TDC</Form.Label>
              <Form.Control name="tdc" value={formData.tdc} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Anticipo %</Form.Label>
              <Form.Control name="anticipo" value={formData.anticipo} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fuerza de trabajo aproximada</Form.Label>
              <Form.Control name="fuerzaTrabajo" value={formData.fuerzaTrabajo} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Presupuesto existente</Form.Label>
              <Form.Control name="presupuesto" value={formData.presupuesto} onChange={handleChange} />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo de trabajo</Form.Label>
                  <Form.Select name="tipoTrabajo" value={formData.tipoTrabajo} onChange={handleChange}>
                    <option>Desarrollo</option>
                    <option>Mantenimiento</option>
                    <option>Supervisión</option>
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
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Form.Group>

            <h6>Documentos a Enviar</h6>
            {["Cotización MPA y VOBO de C&P", "Aprobación (correo) si no hay concurso", "Análisis de Riesgo WHSE y VOBO", "Dibujos y especificaciones", "Programa de Obra"].map((doc, i) => (
              <Form.Check key={i} type="checkbox" label={doc} className="mb-1" />
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
          </Col>
        </Row>

        {/* --- SHAREPOINT --- */}
        <Form.Group className="mt-4">
          <Form.Label>Enlace de Sharepoint para acceder a documentos</Form.Label>
          <Form.Control name="sharepoint" value={formData.sharepoint} onChange={handleChange} />
        </Form.Group>

        <div className="text-center mt-4">
          <Button variant="primary" type="submit" className="px-4">
            Guardar Solicitud
          </Button>
        </div>
      </Form>

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoOS;
