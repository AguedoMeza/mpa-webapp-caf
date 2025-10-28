import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SolicitudCAFForm from '../Inicio/CAF/SolicitudCAFForm';
import FormatoCO from '../Inicio/CAF/FormatoCO';
import FormatoOC from '../Inicio/CAF/FormatoOC';
import FormatoPD from '../Inicio/CAF/FormatoPD';
import FormatoFD from '../Inicio/CAF/FormatoFD';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Bienvenida.css';

const Bienvenida: React.FC = () => {
  const [tipoContrato, setTipoContrato] = useState('Contrato de Obra');
  const navigate = useNavigate();

  return (
    <div className="container py-5 text-center">
      <h2 className="fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <div className="d-flex justify-content-center align-items-center mb-4">
        <Form.Select
          value={tipoContrato}
          onChange={(e) => {
            setTipoContrato(e.target.value);
          }}
          className="w-auto me-3"
        >
          <option>Contrato de Obra</option>
          <option>Contrato de Servicio</option>
          <option>Contrato de Suministro</option>
        </Form.Select>

        <Button
          variant="primary"
          className="px-4"
          onClick={() => {
            if (tipoContrato === 'Contrato de Obra') navigate('/formato-co');
            else if (tipoContrato === 'Contrato de Servicio') navigate('/formato-oc');
            else if (tipoContrato === 'Contrato de Suministro') navigate('/formato-pd');
          }}
        >
          Nuevo
        </Button>
      </div>

      {/* El formulario ahora se navega por rutas, no se renderiza aquí */}
    </div>
  );
};

export default Bienvenida;

