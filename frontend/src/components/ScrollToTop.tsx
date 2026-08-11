import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Deja cada ruta nueva arriba del todo.
 *
 * React Router no reinicia el scroll al navegar: conserva la posición de la
 * pantalla anterior. Como el listado de solicitudes vive al fondo de Bienvenida,
 * al abrir un formato desde la tabla se caía a media forma, por debajo del
 * encabezado y del botón de regreso.
 *
 * El salto es instantáneo a propósito. Un scroll animado de cientos de píxeles
 * en cada navegación se siente lento y marea (ver "Motion Sensitivity").
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  // useLayoutEffect y no useEffect: corre antes del pintado, así no se alcanza
  // a ver el destello de la página nueva en la posición vieja.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
