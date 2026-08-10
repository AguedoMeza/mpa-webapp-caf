import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, InputGroup, Row, Spinner, Table } from 'react-bootstrap';
import { cafSolicitudService, esCancelacion } from '../../../services/caf-solicitud.service';
import { CAFEstadoFiltro, CAFSolicitudListItem, CAFSolicitudPage } from '../../../types/caf-solicitud.types';
import { getAuthenticatedUserEmail, getRutaFormato } from '../../../utils/caf-solicitud.utils';
import './ListaSolicitudes.css';

const TAMANO_PAGINA = 10;

/**
 * Configuración visual de cada estado de aprobación.
 * approve: null = pendiente, 0 = requiere correcciones, 1 = aprobado, 2 = rechazado definitivo
 * (ver SolicitudStatus en backend/app/models/caf_solicitud.py)
 */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pendiente: { label: 'pendiente', className: 'badge-status badge-pending' },
  correcciones: { label: 'correcciones', className: 'badge-status badge-rework' },
  aprobado: { label: 'aprobado', className: 'badge-status badge-approved' },
  rechazado: { label: 'rechazado', className: 'badge-status badge-rejected' },
};

const statusKey = (approve: number | null): string => {
  if (approve === null || approve === undefined) return 'pendiente';
  if (approve === 0) return 'correcciones';
  if (approve === 1) return 'aprobado';
  if (approve === 2) return 'rechazado';
  return 'pendiente';
};

/** Abreviatura del tipo, para el chip cuando no hay ancho para el nombre completo. */
const SIGLA_POR_TIPO: Record<string, string> = {
  'Contrato de Obra': 'CO',
  'Orden de Servicio': 'OS',
  'Orden de Cambio': 'OC',
  'Pago a Dependencia': 'PD',
  'Firma de Documento': 'FD',
};

const PAGINA_VACIA: CAFSolicitudPage = {
  items: [],
  total: 0,
  page: 1,
  page_size: TAMANO_PAGINA,
  pages: 1,
};

/**
 * El backend manda "YYYY-MM-DD". Pasarlo a new Date() lo interpreta como UTC y en
 * México (UTC-6) mostraría el día anterior, así que se arma la fecha por partes.
 */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';

  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return '—';

  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Todos los correos son @mpagroup.mx, así que se muestra solo la parte local para
 * ganar ancho. El correo completo queda en el title de la celda.
 */
const cortarCorreo = (email: string | null): string => {
  if (!email) return '—';
  return email.replace(/@mpagroup\.mx$/i, '');
};

/**
 * El importe puede venir en MXN, en USD o en ninguno: 81 de las 955 solicitudes
 * llenan solo MontoUSDsubtotal, y mostrar únicamente el MXN las dejaba en "—".
 * Los valores son varchar y llegan tal como se capturaron, así que no se reformatean.
 */
const montoMostrado = (s: CAFSolicitudListItem): { texto: string; moneda: string } => {
  const mxn = s.MontoMXNsubtotal?.trim();
  if (mxn) return { texto: mxn, moneda: 'MXN' };

  const usd = s.MontoUSDsubtotal?.trim();
  if (usd) return { texto: usd, moneda: 'USD' };

  return { texto: '—', moneda: '' };
};

/**
 * Números de página a dibujar: siempre la primera y la última, más una ventana
 * alrededor de la actual. Con 96 páginas no caben todas.
 */
const rangoPaginas = (actual: number, total: number): Array<number | 'gap'> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set<number>([1, total, actual]);
  if (actual - 1 > 1) paginas.add(actual - 1);
  if (actual + 1 < total) paginas.add(actual + 1);

  const ordenadas = Array.from(paginas).sort((a, b) => a - b);
  const conHuecos: Array<number | 'gap'> = [];

  ordenadas.forEach((pagina, indice) => {
    if (indice > 0 && pagina - ordenadas[indice - 1] > 1) conHuecos.push('gap');
    conHuecos.push(pagina);
  });

  return conHuecos;
};

const ListaSolicitudes: React.FC = () => {
  const navigate = useNavigate();
  const userEmail = getAuthenticatedUserEmail();

  // Lo que el usuario ve escrito vs. el término que ya se consultó al servidor.
  // Son distintos a propósito: la búsqueda es explícita (Enter o botón). Se probó
  // con debounce y no sirve — entre tecla y tecla de una persona buscando un dato
  // pasan 1 o 2 segundos, así que cualquier ventana razonable dispara igual en cada
  // letra. Los filtros de tipo y status sí aplican al instante: son un solo clic.
  const [textoBuscador, setTextoBuscador] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagina, setPagina] = useState(1);

  const [datos, setDatos] = useState<CAFSolicitudPage>(PAGINA_VACIA);
  const [cargaInicial, setCargaInicial] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isPending mantiene la tabla anterior visible mientras llega la nueva página,
  // en vez de vaciarla y mostrar un spinner en cada tecleo.
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const controlador = new AbortController();

    startTransition(async () => {
      try {
        const respuesta = await cafSolicitudService.listSolicitudes(
          {
            page: pagina,
            page_size: TAMANO_PAGINA,
            search: busqueda || undefined,
            tipo_contratacion: tipoFilter === 'all' ? undefined : tipoFilter,
            estado: statusFilter === 'all' ? undefined : (statusFilter as CAFEstadoFiltro),
          },
          controlador.signal
        );

        setDatos(respuesta);
        setError(null);
      } catch (e) {
        // La cancelación es el flujo normal cuando llega otra petición encima.
        if (esCancelacion(e)) return;
        setError('No se pudieron cargar las solicitudes.');
      } finally {
        setCargaInicial(false);
      }
    });

    return () => controlador.abort();
  }, [pagina, busqueda, tipoFilter, statusFilter]);

  /** Dispara la consulta con lo que hay escrito. Enter o clic en Buscar. */
  const aplicarBusqueda = useCallback(() => {
    setBusqueda(textoBuscador.trim());
    setPagina(1);
  }, [textoBuscador]);

  /** Limpiar sí es inmediato: nadie espera tener que confirmar que borró el filtro. */
  const limpiarBusqueda = useCallback(() => {
    setTextoBuscador('');
    setBusqueda('');
    setPagina(1);
  }, []);

  const limpiarTodo = useCallback(() => {
    setTextoBuscador('');
    setBusqueda('');
    setTipoFilter('all');
    setStatusFilter('all');
    setPagina(1);
  }, []);

  // Al cambiar un filtro hay que volver a la primera página: la 40 puede no existir
  // con el nuevo filtro y quedaría una tabla vacía sin explicación.
  const cambiarTipo = useCallback((valor: string) => {
    setTipoFilter(valor);
    setPagina(1);
  }, []);

  const cambiarStatus = useCallback((valor: string) => {
    setStatusFilter(valor);
    setPagina(1);
  }, []);

  const handleVer = useCallback(
    (s: CAFSolicitudListItem) => {
      navigate(`/${getRutaFormato(s.Tipo_Contratacion)}/${s.id_solicitud}`);
    },
    [navigate]
  );

  // Solo el solicitante puede corregir, y solo cuando el responsable la devolvió:
  // el formulario se desbloquea únicamente con Mode = 'Edit' (ver isReadOnly en los formatos).
  const puedeCorregir = useCallback(
    (s: CAFSolicitudListItem): boolean =>
      s.Mode === 'Edit' && s.Usuario?.toLowerCase() === userEmail.toLowerCase(),
    [userEmail]
  );

  const paginas = useMemo(() => rangoPaginas(datos.page, datos.pages), [datos.page, datos.pages]);

  const desde = datos.total === 0 ? 0 : (datos.page - 1) * datos.page_size + 1;
  const hasta = Math.min(datos.page * datos.page_size, datos.total);

  // Hay texto escrito que todavía no se ha buscado: sin avisarlo, la tabla y el
  // input muestran dos verdades distintas y el usuario no sabe cuál manda.
  const busquedaPendiente = textoBuscador.trim() !== busqueda;
  const hayFiltros = busqueda !== '' || tipoFilter !== 'all' || statusFilter !== 'all';

  if (cargaInicial) {
    return (
      <div className="lista-container d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Cargando solicitudes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-container">
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="lista-container">
      <div className="mb-4">
        <h2 className="lista-titulo">SOLICITUDES CAF</h2>
        <p className="lista-subtitulo">
          {datos.total} registro{datos.total !== 1 ? 's' : ''} encontrado
          {datos.total !== 1 ? 's' : ''}
        </p>
      </div>

      <Card className="card-filtros mb-3">
        <Card.Body className="py-2 px-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} lg={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                  className="filtro-input"
                  aria-label="Buscar solicitudes por folio, building, cliente, proveedor, solicitante o admin responsable"
                  placeholder="Buscar por folio, building, cliente, proveedor, solicitante o admin responsable"
                  value={textoBuscador}
                  onChange={(e) => setTextoBuscador(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') aplicarBusqueda();
                    if (e.key === 'Escape') limpiarBusqueda();
                  }}
                />
                {textoBuscador && (
                  <Button
                    variant="outline-secondary"
                    onClick={limpiarBusqueda}
                    title="Limpiar búsqueda (Esc)"
                    aria-label="Limpiar búsqueda"
                  >
                    <i className="bi bi-x-lg" />
                  </Button>
                )}
                <Button
                  variant={busquedaPendiente ? 'primary' : 'outline-secondary'}
                  className="btn-buscar"
                  onClick={aplicarBusqueda}
                  disabled={!busquedaPendiente}
                  title="Buscar (Enter)"
                >
                  Buscar
                </Button>
              </InputGroup>
              {busquedaPendiente && (
                <Form.Text className="aviso-busqueda">
                  <i className="bi bi-info-circle me-1" />
                  Presiona Enter o el botón para aplicar la búsqueda.
                </Form.Text>
              )}
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Form.Select
                className="filtro-select"
                value={tipoFilter}
                onChange={(e) => cambiarTipo(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="Contrato de Obra">Contrato de Obra</option>
                <option value="Orden de Servicio">Orden de Servicio</option>
                <option value="Orden de Cambio">Orden de Cambio</option>
                <option value="Pago a Dependencia">Pago a Dependencia</option>
                <option value="Firma de Documento">Firma de Documento</option>
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Form.Select
                className="filtro-select"
                value={statusFilter}
                onChange={(e) => cambiarStatus(e.target.value)}
              >
                <option value="all">Todos los status</option>
                <option value="pendiente">pendiente</option>
                <option value="correcciones">correcciones</option>
                <option value="aprobado">aprobado</option>
                <option value="rechazado">rechazado</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>

        <div className="tabla-wrapper" aria-busy={isPending}>
          <Table hover className={`tabla-solicitudes mb-0${isPending ? ' tabla-cargando' : ''}`}>
            <thead>
              <tr>
                <th className="col-folio">Folio</th>
                <th className="col-tipo">Tipo</th>
                <th className="col-inmueble">Building / Cliente</th>
                <th className="col-proveedor">Proveedor</th>
                <th className="col-personas">Solicitante / Admin Resp.</th>
                <th className="col-monto text-end">Monto</th>
                <th className="col-status text-center">Status</th>
                <th className="col-acciones text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.items.length === 0 ? (
                <tr className="fila-vacia">
                  <td colSpan={8}>
                    <div className="tabla-vacia text-center">
                      <i className="bi bi-inbox" />
                      {hayFiltros ? (
                        <>
                          <div>Ninguna solicitud coincide con los filtros aplicados.</div>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="mt-3"
                            onClick={limpiarTodo}
                          >
                            <i className="bi bi-arrow-counterclockwise me-1" />
                            Limpiar filtros
                          </Button>
                        </>
                      ) : (
                        'Todavía no hay solicitudes registradas.'
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                datos.items.map((s) => {
                  const statusCfg = STATUS_CONFIG[statusKey(s.approve)];
                  const sigla = SIGLA_POR_TIPO[s.Tipo_Contratacion || ''] || '?';
                  const monto = montoMostrado(s);

                  return (
                    <tr key={s.id_solicitud} onClick={() => handleVer(s)}>
                      <td className="col-folio" data-label="Folio">
                        <span className="id-cell">#{s.id_solicitud}</span>
                        <span className="celda-sub">{formatDate(s.Fecha)}</span>
                      </td>
                      <td className="col-tipo" data-label="Tipo">
                        <span className="chip-tipo" title={s.Tipo_Contratacion ?? ''}>
                          <span className="chip-largo">{s.Tipo_Contratacion ?? '—'}</span>
                          <span className="chip-corto">{sigla}</span>
                        </span>
                      </td>
                      <td className="col-inmueble" data-label="Building / Cliente">
                        <span className="celda-principal">{s.Building ?? '—'}</span>
                        <span className="celda-sub" title={s.Cliente ?? ''}>
                          {s.Cliente ?? '—'}
                        </span>
                      </td>
                      <td className="col-proveedor" data-label="Proveedor" title={s.Proveedor ?? ''}>
                        {s.Proveedor ?? '—'}
                      </td>
                      <td className="col-personas" data-label="Solicitante / Admin Resp.">
                        <span className="celda-principal" title={s.Usuario ?? ''}>
                          {cortarCorreo(s.Usuario)}
                        </span>
                        <span className="celda-sub" title={s.Responsable ?? ''}>
                          <i className="bi bi-arrow-right-short" />
                          {cortarCorreo(s.Responsable)}
                        </span>
                      </td>
                      <td className="col-monto monto-cell text-end" data-label="Monto">
                        {monto.texto}
                        {monto.moneda && <span className="moneda">{monto.moneda}</span>}
                      </td>
                      <td className="col-status text-center" data-label="Status">
                        <span className={statusCfg.className}>{statusCfg.label}</span>
                      </td>
                      <td className="col-acciones text-center" data-label="Acciones">
                        {puedeCorregir(s) ? (
                          <Button
                            size="sm"
                            className="btn-corregir"
                            onClick={(e) => { e.stopPropagation(); handleVer(s); }}
                          >
                            <i className="bi bi-pencil-square" />
                            <span className="btn-texto">Corregir</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="btn-ver"
                            onClick={(e) => { e.stopPropagation(); handleVer(s); }}
                          >
                            <i className="bi bi-eye" />
                            <span className="btn-texto">Ver</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <Card.Footer className="tabla-footer">
          <div className="paginacion-barra">
            <span className="paginacion-conteo">
              {datos.total === 0
                ? 'Sin registros'
                : `Mostrando ${desde}–${hasta} de ${datos.total}`}
              {isPending && <Spinner animation="border" size="sm" className="ms-2" />}
            </span>

            {datos.pages > 1 && (
              <nav className="paginacion" aria-label="Paginación de solicitudes">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="pag-btn"
                  disabled={datos.page <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  title="Página anterior"
                >
                  <i className="bi bi-chevron-left" />
                </Button>

                {paginas.map((p, indice) =>
                  p === 'gap' ? (
                    <span key={`gap-${indice}`} className="pag-gap">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      variant={p === datos.page ? 'primary' : 'outline-secondary'}
                      className={`pag-btn${p === datos.page ? ' pag-actual' : ''}`}
                      onClick={() => setPagina(p)}
                      aria-current={p === datos.page ? 'page' : undefined}
                    >
                      {p}
                    </Button>
                  )
                )}

                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="pag-btn"
                  disabled={datos.page >= datos.pages}
                  onClick={() => setPagina((p) => Math.min(datos.pages, p + 1))}
                  title="Página siguiente"
                >
                  <i className="bi bi-chevron-right" />
                </Button>
              </nav>
            )}
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ListaSolicitudes;
