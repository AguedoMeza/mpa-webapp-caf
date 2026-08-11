import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import ListaSolicitudes from './CAF/ListaSolicitudes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Bienvenida.css';

const Bienvenida: React.FC = () => {
  const { user } = useAuth();
  const [tipoContrato, setTipoContrato] = useState('Contrato de Obra');
  const navigate = useNavigate();
  const location = useLocation();
  const refListado = useRef<HTMLDivElement>(null);

  // Al volver desde un formato, BotonRegresar marca la navegación para que el
  // usuario aterrice en la tabla y no arriba de todo: el listado vive al fondo
  // de esta pantalla y volver a bajar en cada regreso es un ida y vuelta inútil.
  useEffect(() => {
    if ((location.state as { volverAlListado?: boolean } | null)?.volverAlListado) {
      refListado.current?.scrollIntoView({ block: 'start' });
    }
  }, [location.state]);

  // Definir nombre del usuario reutilizable
  const nombreUsuario = user ? `${user.given_name || ''} ${user.family_name || ''}`.trim() : 'Usuario';

  return (
    <>
    <div className="container py-5 text-center">
      <div className="mb-4">
        <h1 className="fw-bold mb-3">Bienvenido, {nombreUsuario}</h1>
        <p className="text-muted">Sistema de Solicitudes CAF - MPA Group</p>
      </div>
      
      <h2 className="fw-bold mb-5">SOLICITUD DE CAF PARA CONTRATACIÓN</h2>

      <div className="d-flex justify-content-center align-items-center mb-4">
        <Form.Select
          value={tipoContrato}
          onChange={(e) => {
            setTipoContrato(e.target.value);
          }}
          className="w-auto me-3"
        >
          <option value="Contrato de Obra">Contrato de Obra</option>
          <option value="Orden de Servicio">Orden de Servicio</option>
          <option value="Orden de Cambio">Orden de Cambio</option>
          <option value="Pago a Dependencia">Pago a Dependencia</option>
          <option value="Firma de Documento">Firma de Documento</option>
          
         
        </Form.Select>

        <Button
          variant="primary"
          className="px-4"
          onClick={() => {
            if (tipoContrato === 'Contrato de Obra') navigate('/formato-co');
            else if (tipoContrato === 'Orden de Servicio') navigate('/solicitud-caf');
            else if (tipoContrato === 'Firma de Documento') navigate('/formato-fd');
            else if (tipoContrato === 'Orden de Cambio') navigate('/formato-oc');
            else if (tipoContrato === 'Pago a Dependencia') navigate('/formato-pd');
          }}
        >
          Nuevo
        </Button>
      </div>

      {/* El formulario ahora se navega por rutas, no se renderiza aquí */}
    </div>

    {/* El listado va fuera del .container: la tabla tiene 11 columnas y no cabe
        en los ~1140px que impone el contenedor centrado. */}
    <div className="container-fluid px-4 pb-5" ref={refListado}>
      <ListaSolicitudes />
    </div>
    </>
  );
};

export default Bienvenida;

