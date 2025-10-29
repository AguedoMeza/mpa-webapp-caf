import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import "./FormatoFD.css";

const FormatoFD: React.FC = () => {
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos del Formato FD:", formData);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* -------- IZQUIERDA -------- */}
          <Col md={6}>
            <h6 className="fw-semibold">Tipo de Contratación</h6>

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
              "Cotización MPA y VOBO de C&P",
              "Aprobación (correo) si no hay concurso",
              "Análisis de Riesgo WHSE y VOBO",
              "Dibujos y/o especificaciones",
              "Programa de Obra",
            ].map((doc, i) => (
              <Form.Check key={i} type="checkbox" label={doc} className="mb-1" />
            ))}

            <h6 className="mt-3">Documentos Exclusivos para Firma de Documento</h6>
            {["VOBO Legal", "Documento a firmar"].map((doc, i) => (
              <Form.Check key={i} type="checkbox" label={doc} className="mb-1" />
            ))}
          </Col>

          {/* -------- DERECHA -------- */}
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Responsable</Form.Label>
              <Form.Control
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
              />
            </Form.Group>

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
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="text-center mt-4">
          <Button type="submit" variant="primary" className="px-4">
            Guardar Formato FD
          </Button>
        </div>
      </Form>

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoFD;
