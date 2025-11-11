// frontend/src/components/CAF/ApprovalPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Spinner, Alert } from "react-bootstrap";
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import ApprovalActions from "./ApprovalActions";

const ApprovalPage: React.FC = () => {
  const { tipo, id } = useParams<{ tipo: string; id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSolicitud();
  }, [id]);

  const loadSolicitud = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await cafSolicitudService.getSolicitudById(parseInt(id));
      setSolicitud(data);
    } catch (err: any) {
      setError("Error al cargar la solicitud");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalComplete = () => {
    // Redirigir después de aprobar/rechazar
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando solicitud...</p>
      </Container>
    );
  }

  if (error || !solicitud) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Solicitud no encontrada"}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Aprobar/Rechazar Solicitud CAF</h2>

      {/* Detalles de la solicitud */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Detalles de la Solicitud</h5>
        </Card.Header>
        <Card.Body>
          <p><strong>ID:</strong> #{solicitud.id_solicitud}</p>
          <p><strong>Tipo:</strong> {solicitud.Tipo_Contratacion}</p>
          <p><strong>Responsable:</strong> {solicitud.Responsable}</p>
          <p><strong>Cliente:</strong> {solicitud.Cliente}</p>
          <p><strong>Proveedor:</strong> {solicitud.Proveedor}</p>
          <p><strong>Descripción:</strong> {solicitud.Descripcion_trabajo_servicio}</p>
        </Card.Body>
      </Card>

      {/* Componente de aprobación */}
      <ApprovalActions
        solicitudId={solicitud.id_solicitud}
        tipoContratacion={solicitud.Tipo_Contratacion}
        responsable={solicitud.Responsable}
        onApprovalComplete={handleApprovalComplete}
      />
    </Container>
  );
};

export default ApprovalPage;