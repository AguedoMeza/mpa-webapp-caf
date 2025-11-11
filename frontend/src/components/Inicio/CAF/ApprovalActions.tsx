// frontend/src/components/CAF/ApprovalActions.tsx

import React, { useState } from "react";
import { Button, Modal, Form, Alert, Spinner, Card, Badge } from "react-bootstrap";
import { cafSolicitudService } from "../../../services/caf-solicitud.service";
import "./ApprovalActions.css";

interface ApprovalActionsProps {
  solicitudId: number;
  currentStatus?: number | null; // NULL, 0, 1, 2
  tipoContratacion?: string;
  responsable?: string;
  onApprovalComplete?: (result: any) => void;
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  solicitudId,
  currentStatus,
  tipoContratacion,
  responsable,
  onApprovalComplete,
}) => {
  const [showCorrectionsModal, setShowCorrectionsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mapear estado numérico a etiqueta
  const getStatusBadge = () => {
    if (currentStatus === null || currentStatus === undefined) {
      return <Badge bg="warning">Pendiente de Revisión</Badge>;
    }
    switch (currentStatus) {
      case 0:
        return <Badge bg="info">Requiere Correcciones</Badge>;
      case 1:
        return <Badge bg="success">Aprobado</Badge>;
      case 2:
        return <Badge bg="danger">Rechazado Definitivamente</Badge>;
      default:
        return <Badge bg="secondary">Estado Desconocido</Badge>;
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("¿Está seguro de aprobar esta solicitud definitivamente?")) {
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

  const handleRequestCorrections = () => {
    setShowCorrectionsModal(true);
    setComentarios("");
    setError(null);
  };

  const handleCorrectionsConfirm = async () => {
    if (!comentarios.trim()) {
      setError("Los comentarios son OBLIGATORIOS cuando se solicitan correcciones");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cafSolicitudService.approveOrRejectSolicitud(
        solicitudId,
        "requiere_correcciones",
        comentarios
      );

      setSuccess(`📝 Solicitud #${solicitudId} marcada para correcciones`);
      setShowCorrectionsModal(false);
      console.log("Solicitud marcada para correcciones:", result);

      if (onApprovalComplete) {
        onApprovalComplete(result);
      }
    } catch (err: any) {
      console.error("Error al solicitar correcciones:", err);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al solicitar correcciones";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDefinitively = () => {
    setShowRejectModal(true);
    setComentarios("");
    setError(null);
  };

  const handleRejectConfirm = async () => {
    // Comentarios son opcionales para rechazo definitivo
    if (!window.confirm("¿Está seguro de rechazar esta solicitud definitivamente?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cafSolicitudService.approveOrRejectSolicitud(
        solicitudId,
        "rechazado_definitivo",
        comentarios.trim() || undefined
      );

      setSuccess(`❌ Solicitud #${solicitudId} rechazada definitivamente`);
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
            <p className="mb-1">
              <strong>Estado Actual:</strong> {getStatusBadge()}
            </p>
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

          {/* Descripción del flujo */}
          <Alert variant="info" className="mb-3 small">
            <strong>Flujo de Estados:</strong>
            <ul className="mb-0 mt-2">
              <li><strong>Pendiente:</strong> Solicitud enviada, esperando revisión</li>
              <li><strong>Requiere Correcciones:</strong> Necesita modificaciones (comentarios obligatorios)</li>
              <li><strong>Aprobado:</strong> Solicitud aprobada definitivamente</li>
              <li><strong>Rechazado Definitivo:</strong> Solicitud rechazada (comentarios opcionales)</li>
            </ul>
          </Alert>

          {/* Botones de acción */}
          <div className="d-grid gap-2">
            <Button
              variant="success"
              size="lg"
              onClick={handleApprove}
              disabled={loading || currentStatus === 1}
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
                  Aprobar Definitivamente
                </>
              )}
            </Button>

            <Button
              variant="warning"
              size="lg"
              onClick={handleRequestCorrections}
              disabled={loading}
              className="approval-button"
            >
              <i className="bi bi-pencil-square me-2"></i>
              Solicitar Correcciones
            </Button>

            <Button
              variant="danger"
              size="lg"
              onClick={handleRejectDefinitively}
              disabled={loading || currentStatus === 2}
              className="approval-button"
            >
              <i className="bi bi-x-circle me-2"></i>
              Rechazar Definitivamente
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modal para solicitar correcciones (comentarios OBLIGATORIOS) */}
      <Modal
        show={showCorrectionsModal}
        onHide={() => setShowCorrectionsModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>Solicitar Correcciones - Solicitud #{solicitudId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Alert variant="info" className="mb-3">
            <i className="bi bi-info-circle me-2"></i>
            Los comentarios son <strong>OBLIGATORIOS</strong> cuando se solicitan correcciones.
            El solicitante recibirá un correo con las correcciones requeridas.
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Correcciones Requeridas *</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Describa detalladamente las correcciones necesarias..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={loading}
              maxLength={500}
              required
            />
            <Form.Text className="text-muted">
              Máximo 500 caracteres. {comentarios.length}/500
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCorrectionsModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleCorrectionsConfirm}
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
                Enviando...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Enviar Correcciones
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para rechazar definitivamente (comentarios OPCIONALES) */}
      <Modal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Rechazar Definitivamente - Solicitud #{solicitudId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Alert variant="warning" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Esta acción rechazará la solicitud definitivamente.
            Los comentarios son <strong>opcionales</strong>.
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>Motivo del Rechazo (Opcional)</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Ingrese el motivo del rechazo (opcional)..."
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={loading}
              maxLength={500}
            />
            <Form.Text className="text-muted">
              Máximo 500 caracteres. {comentarios.length}/500
            </Form.Text>
          </Form.Group>
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
            disabled={loading}
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