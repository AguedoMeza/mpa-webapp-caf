import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Bienvenida.css';

const Bienvenida: React.FC = () => {
  const [tipoContrato, setTipoContrato] = useState('Contrato de Obra');

  return (
    <div className="container py-5 text-center">
      <h2 className="fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <div className="d-flex justify-content-center align-items-center">
        <Form.Select
          value={tipoContrato}
          onChange={(e) => setTipoContrato(e.target.value)}
          className="w-auto me-3"
        >
          <option>Contrato de Obra</option>
          <option>Contrato de Servicio</option>
          <option>Contrato de Suministro</option>
        </Form.Select>

        <Button variant="primary" className="px-4">
          Nuevo
        </Button>
      </div>
    </div>
  );
};

export default Bienvenida;

