import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './BotonRegresar.css';

interface Props {
  /**
   * Si hay captura sin guardar, se pide confirmación antes de salir. Los formatos
   * lo marcan en su handleChange, así que solo se activa cuando el usuario
   * realmente tecleó algo — no por el simple hecho de abrir el formulario.
   */
  hayCambios?: boolean;
  etiqueta?: string;
}

/**
 * Salida de los formatos hacia el listado.
 *
 * Navega a "/" y no con navigate(-1): a estas pantallas se llega tanto desde el
 * listado como desde el link de un correo, y en ese segundo caso "atrás" saca al
 * usuario de la aplicación.
 *
 * Es sticky porque los formatos miden varias pantallas de alto; un botón que se
 * pierde al tercer scroll deja al usuario igual de atrapado que sin botón.
 */
const BotonRegresar: React.FC<Props> = ({ hayCambios = false, etiqueta = 'Regresar al listado' }) => {
  const navigate = useNavigate();

  const regresar = useCallback(() => {
    if (
      hayCambios &&
      !window.confirm('Tienes cambios sin guardar en esta solicitud. ¿Deseas salir de todos modos?')
    ) {
      return;
    }
    // El listado vive al fondo de Bienvenida. Sin la marca, regresar deja al
    // usuario arriba de todo y obliga a volver a bajar hasta la tabla.
    navigate('/', { state: { volverAlListado: true } });
  }, [hayCambios, navigate]);

  return (
    <div className="barra-regresar">
      <Button
        variant="outline-secondary"
        className="btn-regresar"
        onClick={regresar}
        aria-label={etiqueta}
      >
        <i className="bi bi-arrow-left" aria-hidden="true" />
        <span className="btn-regresar-texto">{etiqueta}</span>
      </Button>
    </div>
  );
};

export default BotonRegresar;
