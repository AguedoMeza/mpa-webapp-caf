import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import "./FormatoCO.css";

interface Props {
  tipoContrato: string;
}

const FormatoCO: React.FC<Props> = ({ tipoContrato }) => {
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
    responsable: "",
    fecha: "",
    descripcion: "",
    justificacion: "",
    sharepoint: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos capturados:", formData);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* -------- COLUMNA IZQUIERDA -------- */}
          <Col md={6}>
            <h6 className="fw-semibold">Tipo de Contratación: <span className="text-primary">{tipoContrato}</span></h6>

            <h6 className="mt-3">Información General</h6>
            {[
              { label: "Building ID", name: "buildingId" },
              { label: "Cliente/Desarrollo", name: "cliente" },
              { label: "Dirección", name: "direccion" },
              { label: "Proveedor", name: "proveedor" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control name={f.name} value={(formData as any)[f.name]} onChange={handleChange} />
              </Form.Group>
            ))}

            <h6 className="mt-3">Datos de los Trabajos / Servicios</h6>
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

            <h6 className="mt-3">Datos exclusivos para contratos</h6>
            <Row>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha Ocupación Benéfica</Form.Label>
                  <Form.Control type="date" name="fechaOcupacion" value={formData.fechaOcupacion} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2">
                  <Form.Label>Fecha Terminación Sustancial</Form.Label>
                  <Form.Control type="date" name="fechaSustancial" value={formData.fechaSustancial} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label>Fecha Terminación Final Contratos</Form.Label>
              <Form.Control type="date" name="fechaFinalContratos" value={formData.fechaFinalContratos} onChange={handleChange} />
            </Form.Group>

            {[
              { label: "Fianza Anticipo", name: "fianzaAnticipo" },
              { label: "Fianza Cumplimiento/Buena Calidad", name: "fianzaCumplimiento" },
              { label: "Fianza Pasivos Contingentes", name: "fianzaPasivos" },
            ].map((f, i) => (
              <Form.Group key={i} className="mb-2">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control name={f.name} value={(formData as any)[f.name]} onChange={handleChange} />
              </Form.Group>
            ))}
          </Col>

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
              "Dibujos y/o especificaciones",
              "Programa de Obra",
            ].map((doc, i) => (
              <Form.Check key={i} type="checkbox" label={doc} className="mb-1" />
            ))}

            <Form.Group className="mt-4 mb-3">
              <Form.Label>Justificación de Trabajos</Form.Label>
              <Form.Control as="textarea" rows={2} name="justificacion" value={formData.justificacion} onChange={handleChange} />
            </Form.Group>

            <h6>Documentos Exclusivos para Contratos</h6>
            {[
              "Acta constitutiva",
              "Poder notarial",
              "INE Representante legal",
              "Alta IMSS y REPSE",
              "Información bancaria",
            ].map((doc, i) => (
              <Form.Check key={i} type="checkbox" label={doc} className="mb-1" />
            ))}

            <Form.Group className="mt-4">
              <Form.Label>Enlace de Sharepoint para acceder a documentos</Form.Label>
              <Form.Control name="sharepoint" value={formData.sharepoint} onChange={handleChange} />
            </Form.Group>
          </Col>

        </Row>



        <div className="text-center mt-4">
          <Button type="submit" variant="primary" className="px-4">
            Guardar Formato CO
          </Button>
        </div>
      </Form>

      <div className="text-center small text-muted mt-4">Admin MPA LDAP</div>
    </div>
  );
};

export default FormatoCO;
