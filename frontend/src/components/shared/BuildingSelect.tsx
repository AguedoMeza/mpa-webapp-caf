import React from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { useBuildings } from '../../hooks/useBuildings';
import './BuildingSelect.css';

interface BuildingSelectProps {
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
}

/**
 * Select de Building ID con búsqueda usando react-select
 * Permite buscar buildings por código o ubicación
 */
const BuildingSelect: React.FC<BuildingSelectProps> = ({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  required = false,
  label = 'Building ID',
  name = 'buildingId',
}) => {
  const { buildings, loading, error } = useBuildings();

  // Los buildings ya vienen en formato correcto desde el API
  const options: OptionType[] = buildings;

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
          <span className="text-muted">Cargando buildings...</span>
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
          placeholder="Buscar building por código o ubicación..."
          noOptionsMessage={() => 'No se encontraron buildings'}
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

export default BuildingSelect;