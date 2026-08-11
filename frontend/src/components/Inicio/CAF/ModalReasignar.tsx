import React, { useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import ResponsableSelect from '../../shared/ResponsableSelect';
import { cafSolicitudService } from '../../../services/caf-solicitud.service';
import { getAuthenticatedUserEmail } from '../../../utils/caf-solicitud.utils';

interface Props {
  show: boolean;
  onHide: () => void;
  solicitudId: number;
  responsableActual: string | null;
  /** Se llama tras reasignar para que la vista de origen se refresque. */
  onReasignado?: (nuevoResponsable: string) => void;
}

/**
 * Cambia el Admin Responsable de una solicitud.
 *
 * Existe porque cuando el responsable causa baja o sale de vacaciones la
 * solicitud queda atorada: es el único que ve los controles de aprobación y
 * nadie más puede destrabarla desde la aplicación.
 *
 * Reutiliza ResponsableSelect, el mismo picker de los formatos, para que las
 * opciones respeten las reglas de CAT_Elegibilidad_Usuario.
 */
const ModalReasignar: React.FC<Props> = ({
  show,
  onHide,
  solicitudId,
  responsableActual,
  onReasignado,
}) => {
  const [nuevoResponsable, setNuevoResponsable] = useState('');
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    if (enviando) return;
    setNuevoResponsable('');
    setMotivo('');
    setError(null);
    onHide();
  };

  const confirmar = async () => {
    setError(null);
    setEnviando(true);

    try {
      await cafSolicitudService.reasignarResponsable(solicitudId, {
        responsable: nuevoResponsable,
        usuario: getAuthenticatedUserEmail(),
        motivo: motivo.trim() || undefined,
        notificar: true,
      });

      onReasignado?.(nuevoResponsable);
      setNuevoResponsable('');
      setMotivo('');
      onHide();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'No se pudo reasignar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const mismoResponsable =
    nuevoResponsable.trim().toLowerCase() === (responsableActual || '').trim().toLowerCase();

  return (
    <Modal show={show} onHide={cerrar} centered backdrop={enviando ? 'static' : true}>
      <Modal.Header closeButton={!enviando}>
        <Modal.Title>Reasignar Admin Responsable</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-3">
          Solicitud <strong>#{solicitudId}</strong>, asignada hoy a{' '}
          <strong>{responsableActual || '(sin asignar)'}</strong>.
        </p>

        <Alert variant="warning" className="py-2">
          <i className="bi bi-exclamation-triangle me-2" />
          Al reasignar transfieres la facultad de aprobar esta solicitud. El
          cambio se registra con tu usuario y la fecha, y se le avisa por correo
          al nuevo responsable.
        </Alert>

        <ResponsableSelect
          value={nuevoResponsable}
          onChange={(e) => setNuevoResponsable(e.target.value)}
          label="Nuevo Admin Responsable"
          required
          disabled={enviando}
        />

        <Form.Group className="mt-3">
          <Form.Label>Motivo (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            maxLength={200}
            placeholder="Ej. Andrea está de vacaciones hasta el 30 de agosto"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            disabled={enviando}
          />
          <Form.Text className="text-muted">
            Máximo 200 caracteres. {motivo.length}/200
          </Form.Text>
        </Form.Group>

        {mismoResponsable && nuevoResponsable && (
          <Alert variant="info" className="mt-3 py-2 mb-0">
            Esa persona ya es la responsable de esta solicitud.
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mt-3 py-2 mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={cerrar} disabled={enviando}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={confirmar}
          disabled={enviando || !nuevoResponsable || mismoResponsable}
        >
          {enviando ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Reasignando...
            </>
          ) : (
            'Reasignar y notificar'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalReasignar;
