import React from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { useUsers } from '../../hooks/useUsers';
import './ResponsableSelect.css';

interface ResponsableSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  name?: string;
}

interface OptionType {
  value: string;
  label: string;
  email: string | null;
  department: string | null;
}

/**
 * Select de Responsable con búsqueda usando react-select
 * Permite buscar por nombre o email del directorio de Azure AD
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

  // Convertir usuarios a formato de opciones para react-select
  const options: OptionType[] = users.map((user) => ({
    value: user.email || user.display_name,
    label: `${user.display_name}${user.department ? ` - ${user.department}` : ''}${user.email ? ` (${user.email})` : ''}`,
    email: user.email,
    department: user.department,
  }));

  // Encontrar la opción seleccionada actual
  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Manejar cambio de selección
  const handleSelectChange = (newValue: SingleValue<OptionType>) => {
    // Crear evento sintético compatible con Form.Control
    const syntheticEvent = {
      target: {
        name: name,
        value: newValue?.value || '',
        type: 'select-one',
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
  };

  // Estilos personalizados para que coincida con Bootstrap
  const customStyles: StylesConfig<OptionType, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#0d6efd'
        : state.isFocused
        ? '#e9ecef'
        : 'white',
      color: state.isSelected ? 'white' : '#212529',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#0d6efd',
      },
    }),
  };

  return (
    <Form.Group className="mb-2">
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>

      {loading ? (
        <div className="d-flex align-items-center p-2 border rounded">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted">Cargando usuarios...</span>
        </div>
      ) : error ? (
        <Alert variant="danger" className="mb-0 py-2">
          <small>{error}</small>
        </Alert>
      ) : (
        <Select<OptionType>
          name={name}
          value={selectedOption}
          onChange={handleSelectChange}
          options={options}
          isDisabled={disabled || readOnly}
          isClearable
          isSearchable
          placeholder="Buscar responsable por nombre o email..."
          noOptionsMessage={() => 'No se encontraron usuarios'}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      )}

      {required && !value && (
        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
          Este campo es requerido
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default ResponsableSelect;