import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import "./FormatoOC.css";

const FormatoOC: React.FC = () => {
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
    responsable: "",
    fecha: "",
    descripcion: "",
    justificacion: "",
    nuevaOcupacion: "",
    nuevaSustancial: "",
    nuevaFinal: "",
    tiempoDias: "",
    sharepoint: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos del Formato OC:", formData);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <Form onSubmit={handleSubmit}>
        <div className="form-columns">
          {/* -------- COLUMNA IZQUIERDA -------- */}
          <div className="form-column">
            <h6 className="fw-semibold">Tipo de Contratación</h6>

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
              "Cotización MPA y VOBO de C&P",
              "Aprobación (correo) si no hay concurso",
              "Análisis de Riesgo WHSE y VOBO",
              "Dibujos y especificaciones",
              "Programa de Obra",
            ].map((doc, i) => (
              <Form.Check key={i} type="checkbox" label={doc} className="mb-1" />
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
          <Button variant="primary" type="submit" className="px-4">
            Guardar Formato OC
          </Button>
        </div>
      </Form>

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoOC;
