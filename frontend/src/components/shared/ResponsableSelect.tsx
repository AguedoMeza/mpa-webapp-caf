import React from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import { useUsers } from '../../hooks/useUsers';

interface ResponsableSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  name?: string;
}

/**
 * Select de Responsable con usuarios del directorio de Azure AD
 * Componente reutilizable para todos los formularios CAF
 */
const ResponsableSelect: React.FC<ResponsableSelectProps> = ({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  required = false,
  label = 'Responsable',
  name = 'responsable',
}) => {
  const { users, loading, error } = useUsers();

  return (
    <Form.Group className="mb-2">
      <Form.Label>{label}</Form.Label>
      
      {loading ? (
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted">Cargando usuarios...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="mb-2 py-2">
          {error}
        </Alert>
      ) : (
        <Form.Select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || readOnly}
          required={required}
        >
          <option value="">-- Seleccione un responsable --</option>
          {users.map((user) => (
            <option key={user.id} value={user.email || user.display_name}>
              {user.display_name} {user.email ? `(${user.email})` : ''}
            </option>
          ))}
        </Form.Select>
      )}
    </Form.Group>
  );
};

export default ResponsableSelect;