// frontend/src/components/CAF/ApprovalActions.tsx

import React, { useState } from "react";
import { Button, Modal, Form, Alert, Spinner, Card } from "react-bootstrap";
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import "./ApprovalActions.css";

interface ApprovalActionsProps {
  solicitudId: number;
  tipoContratacion?: string;
  responsable?: string;
  onApprovalComplete?: (result: any) => void;
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  solicitudId,
  tipoContratacion,
  responsable,
  onApprovalComplete,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!window.confirm("¿Está seguro de aprobar esta solicitud?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cafSolicitudService.approveOrRejectSolicitud(
        solicitudId,
        "aprobado"
      );

      setSuccess(`✅ Solicitud #${solicitudId} aprobada exitosamente`);
      console.log("Solicitud aprobada:", result);

      if (onApprovalComplete) {
        onApprovalComplete(result);
      }
    } catch (err: any) {
      console.error("Error al aprobar solicitud:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al aprobar la solicitud";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setComentarios("");
    setError(null);
  };

  const handleRejectConfirm = async () => {
    if (!comentarios.trim()) {
      setError("Los comentarios son requeridos para rechazar una solicitud");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cafSolicitudService.approveOrRejectSolicitud(
        solicitudId,
        "rechazado",
        comentarios
      );

      setSuccess(`❌ Solicitud #${solicitudId} rechazada`);
      setShowRejectModal(false);
      console.log("Solicitud rechazada:", result);

      if (onApprovalComplete) {
        onApprovalComplete(result);
      }
    } catch (err: any) {
      console.error("Error al rechazar solicitud:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al rechazar la solicitud";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRevision = async () => {
    if (!window.confirm("¿Está seguro de marcar esta solicitud en revisión?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cafSolicitudService.approveOrRejectSolicitud(
        solicitudId,
        "revision"
      );

      setSuccess(`📝 Solicitud #${solicitudId} marcada en revisión`);
      console.log("Solicitud en revisión:", result);

      if (onApprovalComplete) {
        onApprovalComplete(result);
      }
    } catch (err: any) {
      console.error("Error al marcar en revisión:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al marcar la solicitud en revisión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="approval-actions-card">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Acciones de Aprobación</h5>
        </Card.Header>
        <Card.Body>
          {/* Información de la solicitud */}
          <div className="mb-3">
            <p className="mb-1">
              <strong>Solicitud ID:</strong> #{solicitudId}
            </p>
            {tipoContratacion && (
              <p className="mb-1">
                <strong>Tipo:</strong> {tipoContratacion}
              </p>
            )}
            {responsable && (
              <p className="mb-1">
                <strong>Responsable:</strong> {responsable}
              </p>
            )}
          </div>

          {/* Alertas */}
          {error && (
            <Alert
              variant="danger"
              onClose={() => setError(null)}
              dismissible
              className="mb-3"
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              onClose={() => setSuccess(null)}
              dismissible
              className="mb-3"
            >
              {success}
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="d-grid gap-2">
            <Button
              variant="success"
              size="lg"
              onClick={handleApprove}
              disabled={loading}
              className="approval-button"
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
                  Procesando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Aprobar Solicitud
                </>
              )}
            </Button>

            <Button
              variant="danger"
              size="lg"
              onClick={handleRejectClick}
              disabled={loading}
              className="approval-button"
            >
              <i className="bi bi-x-circle me-2"></i>
              Rechazar Solicitud
            </Button>

            <Button
              variant="warning"
              size="lg"
              onClick={handleRevision}
              disabled={loading}
              className="approval-button"
            >
              <i className="bi bi-pencil-square me-2"></i>
              Marcar en Revisión
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modal para rechazar con comentarios */}
      <Modal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Rechazar Solicitud #{solicitudId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Motivo del Rechazo *</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Ingrese el motivo del rechazo (requerido)..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={loading}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              Máximo 500 caracteres. {comentarios.length}/500
            </Form.Text>
          </Form.Group>

          <Alert variant="warning" className="mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Esta acción enviará un correo de notificación al solicitante con el
            motivo del rechazo.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRejectModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectConfirm}
            disabled={loading || !comentarios.trim()}
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
                Rechazando...
              </>
            ) : (
              <>
                <i className="bi bi-x-circle me-2"></i>
                Confirmar Rechazo
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApprovalActions;