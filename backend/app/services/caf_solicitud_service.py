from sqlalchemy.orm import Session
from sqlalchemy import or_, collate, cast, String, func
from app.models.caf_solicitud import TBL_CAF_Solicitud, SolicitudStatus
from app.models.building import CAT_BUILDINGS
from app.events.domain_events import SolicitudCreada, SolicitudAprobada, SolicitudRechazada, SolicitudCorreccionesRealizadas
from app.events.event_dispatcher import get_event_dispatcher
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class CafSolicitudService:
    def __init__(self):
        print("🏗️ Inicializando CafSolicitudService...")
        self.event_dispatcher = get_event_dispatcher()
        print(f"📡 Event dispatcher obtenido con {self.event_dispatcher.get_observers_count()} observers")
    
    def get_detail(self, db: Session, solicitud_id: int):
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        return solicitud
    
    # Colacion sin acentos para el buscador: la BD es Modern_Spanish_CI_AS (ignora
    # mayusculas pero NO acentos), y con ella "supervision" no encontraria
    # "Supervisión". La variante _CI_AI ignora ambos.
    _COLACION_BUSQUEDA = "Modern_Spanish_CI_AI"

    # approve: NULL = pendiente, 0 = requiere correcciones, 1 = aprobado, 2 = rechazado
    _FILTROS_STATUS = {
        "pendiente": lambda: TBL_CAF_Solicitud.approve.is_(None),
        "correcciones": lambda: TBL_CAF_Solicitud.approve == 0,
        "aprobado": lambda: TBL_CAF_Solicitud.approve == 1,
        "rechazado": lambda: TBL_CAF_Solicitud.approve == 2,
    }

    def _aplicar_filtros(
        self,
        query,
        search: Optional[str],
        tipo_contratacion: Optional[str],
        status: Optional[str],
        responsable: Optional[str],
    ):
        """Filtros compartidos por la consulta de pagina y la del total."""
        if tipo_contratacion:
            query = query.filter(TBL_CAF_Solicitud.Tipo_Contratacion == tipo_contratacion)

        if responsable:
            query = query.filter(TBL_CAF_Solicitud.Responsable == responsable)

        condicion_status = self._FILTROS_STATUS.get(status or "")
        if condicion_status:
            query = query.filter(condicion_status())

        termino = (search or "").strip()
        if termino:
            # Escapar los comodines de LIKE para que un '%' escrito por el usuario
            # busque un '%' literal y no todo el catalogo.
            escapado = termino.replace("[", "[[]").replace("%", "[%]").replace("_", "[_]")
            patron = f"%{escapado}%"

            columnas = (
                TBL_CAF_Solicitud.Building,
                TBL_CAF_Solicitud.Cliente,
                TBL_CAF_Solicitud.Proveedor,
                TBL_CAF_Solicitud.Usuario,
                TBL_CAF_Solicitud.Responsable,
            )
            condiciones = [
                collate(columna, self._COLACION_BUSQUEDA).like(patron) for columna in columnas
            ]
            # El folio se busca como texto para que "97" encuentre #97, #970, #971...
            condiciones.append(cast(TBL_CAF_Solicitud.id_solicitud, String).like(patron))

            query = query.filter(or_(*condiciones))

        return query

    def list_responsables(self, db: Session) -> List[Dict]:
        """
        Responsables que realmente aparecen en solicitudes, con cuantas tiene cada uno.

        Se saca de TBL_CAF_Solicitud y no del catalogo de usuarios elegibles porque el
        filtro solo debe ofrecer valores que puedan devolver resultados. Van ordenados
        por volumen: los pocos con carga real quedan arriba y los valores historicos
        malformados ('betty', 'Juan Perez') caen al final sin desaparecer, para que
        esas solicitudes sigan siendo alcanzables.
        """
        filas = (
            db.query(
                TBL_CAF_Solicitud.Responsable,
                func.count().label("total"),
            )
            .filter(TBL_CAF_Solicitud.Responsable.isnot(None))
            .filter(TBL_CAF_Solicitud.Responsable != "")
            .group_by(TBL_CAF_Solicitud.Responsable)
            .order_by(func.count().desc())
            .all()
        )

        return [{"responsable": fila.Responsable, "total": fila.total} for fila in filas]

    def list_all(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        tipo_contratacion: Optional[str] = None,
        status: Optional[str] = None,
        responsable: Optional[str] = None,
    ) -> Dict:
        """
        Devuelve una pagina del listado, las mas recientes primero.

        Paginacion y filtros van en el servidor: con ~1000 solicitudes y creciendo,
        traer todo y filtrar en el navegador desperdicia ancho de banda y, si se
        pagina en cliente, los filtros solo verian la pagina visible.

        Proyecta solo las columnas que necesita la tabla: TBL_CAF_Solicitud tiene 56
        y traerlas completas por fila no aporta nada a un listado.

        Devuelve {items, total, page, page_size, pages}.
        """
        page = max(1, page)
        page_size = max(1, min(page_size, 100))

        base = self._aplicar_filtros(
            db.query(TBL_CAF_Solicitud.id_solicitud),
            search,
            tipo_contratacion,
            status,
            responsable,
        )
        total = base.count()

        query = self._aplicar_filtros(
            db.query(
                TBL_CAF_Solicitud.id_solicitud,
                TBL_CAF_Solicitud.Fecha,
                TBL_CAF_Solicitud.Tipo_Contratacion,
                TBL_CAF_Solicitud.Building,
                TBL_CAF_Solicitud.Cliente,
                TBL_CAF_Solicitud.Proveedor,
                TBL_CAF_Solicitud.MontoMXNsubtotal,
                TBL_CAF_Solicitud.MontoUSDsubtotal,
                TBL_CAF_Solicitud.Usuario,
                TBL_CAF_Solicitud.Responsable,
                TBL_CAF_Solicitud.approve,
                TBL_CAF_Solicitud.Mode,
            ),
            search,
            tipo_contratacion,
            status,
            responsable,
        )

        filas = (
            query.order_by(TBL_CAF_Solicitud.id_solicitud.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        pages = max(1, -(-total // page_size))  # division hacia arriba
        print(f"📋 Listado CAF: pagina {page}/{pages}, {len(filas)} de {total} solicitudes")

        return {
            "items": [
                {
                    "id_solicitud": fila.id_solicitud,
                    "Fecha": fila.Fecha.isoformat() if fila.Fecha else None,
                    "Tipo_Contratacion": fila.Tipo_Contratacion,
                    "Building": fila.Building,
                    "Cliente": fila.Cliente,
                    "Proveedor": fila.Proveedor,
                    "MontoMXNsubtotal": fila.MontoMXNsubtotal,
                    # 81 de 955 solicitudes capturan el importe solo en USD; sin este
                    # campo el listado las mostraria sin monto.
                    "MontoUSDsubtotal": fila.MontoUSDsubtotal,
                    "Usuario": fila.Usuario,
                    "Responsable": fila.Responsable,
                    "approve": fila.approve,
                    "Mode": fila.Mode,
                }
                for fila in filas
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
        }

    def create(self, db: Session, data: dict) -> TBL_CAF_Solicitud:
        # Remover id_solicitud si viene en los datos (es autoincrement)
        data_clean = {k: v for k, v in data.items() if k != 'id_solicitud'}
        print(f"🧹 Datos limpiados: removido id_solicitud, campos restantes: {len(data_clean)}")
        print(f"📝 CAF payload keys: {sorted(data_clean.keys())}")
        print(f"🧾 CAF payload values: {data_clean}")
        payload_lengths = {
            key: (len(value) if isinstance(value, str) else None)
            for key, value in data_clean.items()
        }
        print(f"📏 CAF payload lengths: {payload_lengths}")
        
        # IMPORTANTE: No establecer approve en la creación, debe quedar NULL (pendiente)
        # Remover approve si viene en los datos para que quede NULL
        if 'approve' in data_clean:
            del data_clean['approve']
        
        solicitud = TBL_CAF_Solicitud(**data_clean)
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        
        # Disparar evento de solicitud creada
        try:
            print(f"🔥 Creando evento SolicitudCreada para solicitud #{solicitud.id_solicitud}")
            event = SolicitudCreada(solicitud=solicitud)
            print(f"🚀 Despachando evento SolicitudCreada para solicitud #{solicitud.id_solicitud}")
            self.event_dispatcher.dispatch(event)
            print(f"✅ Evento SolicitudCreada disparado para solicitud #{solicitud.id_solicitud}")
            logger.info(f"Evento SolicitudCreada disparado para solicitud #{solicitud.id_solicitud}")
        except Exception as e:
            print(f"❌ Error disparando evento SolicitudCreada: {str(e)}")
            logger.error(f"Error disparando evento SolicitudCreada: {str(e)}")
        
        return solicitud

    def update(self, db: Session, solicitud_id: int, data: dict) -> TBL_CAF_Solicitud:
        """
        Actualiza una solicitud CAF existente.
        
        IMPORTANTE: Si la solicitud estaba en estado 'requiere_correcciones' (0),
        al actualizarse se resetea a NULL (pendiente) y se notifica al responsable.
        """
        # Buscar la solicitud existente
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        
        # Guardar estado anterior para detectar si estaba en correcciones
        was_in_corrections = solicitud.approve == 0
        
        # Actualizar campos que lleguen en data
        for field, value in data.items():
            if hasattr(solicitud, field):
                setattr(solicitud, field, value)
        
        # FLUJO CÍCLICO: Si estaba en correcciones, resetear a pendiente
        if was_in_corrections:
            solicitud.approve = None  # Volver a estado pendiente
            solicitud.Mode = 'Normal'  # Cambiar a modo normal
            logger.info(f"Solicitud #{solicitud_id} actualizada desde correcciones. Reseteando a pendiente.")
        
        db.commit()
        db.refresh(solicitud)
        
        # DISPARAR EVENTO: Si estaba en correcciones, notificar al responsable
        if was_in_corrections:
            try:
                print(f"🔄 Solicitud #{solicitud.id_solicitud} actualizada desde correcciones")
                event = SolicitudCorreccionesRealizadas(solicitud=solicitud)  # Evento específico para correcciones
                print(f"🚀 Notificando al responsable sobre las correcciones realizadas")
                self.event_dispatcher.dispatch(event)
                print(f"✅ Responsable notificado sobre correcciones en solicitud #{solicitud.id_solicitud}")
                logger.info(f"Responsable notificado sobre correcciones en solicitud #{solicitud.id_solicitud}")
            except Exception as e:
                print(f"❌ Error notificando al responsable: {str(e)}")
                logger.error(f"Error notificando al responsable: {str(e)}")
        
        return solicitud

    def approve_or_reject(self, db: Session, solicitud_id: int, approve_status: str, comentarios: str = None) -> TBL_CAF_Solicitud:
        """
        Aprueba, rechaza o marca para correcciones una solicitud CAF.
        
        Flujo de estados:
        - NULL (pendiente) -> Estado inicial cuando se crea la solicitud
        - 'requiere_correcciones' (0) -> Rechazado temporalmente, necesita correcciones (comentarios obligatorios)
        - 'aprobado' (1) -> Aprobado definitivamente
        - 'rechazado_definitivo' (2) -> Rechazado definitivamente (comentarios opcionales)
        
        Args:
            db: Sesión de base de datos
            solicitud_id: ID de la solicitud
            approve_status: Estado ('requiere_correcciones', 'aprobado', 'rechazado_definitivo')
            comentarios: Comentarios (obligatorios para requiere_correcciones, opcionales para rechazado_definitivo)
        Returns:
            TBL_CAF_Solicitud: Solicitud actualizada
        """
        # Convertir string a valor del enum
        try:
            status_enum = SolicitudStatus[approve_status]
            approve_value = status_enum.value
        except KeyError:
            valid_statuses = [status.name for status in SolicitudStatus]
            raise ValueError(f"El estado debe ser uno de: {', '.join(valid_statuses)}")
        
        # Buscar la solicitud existente
        solicitud = db.query(TBL_CAF_Solicitud).filter_by(id_solicitud=solicitud_id).first()
        if not solicitud:
            return None
        
        # Actualizar el estado de aprobación
        solicitud.approve = approve_value
        
        # Actualizar Mode según el estado de aprobación
        if approve_status == 'requiere_correcciones':
            solicitud.Mode = 'Edit'  # Formulario editable para correcciones
        elif approve_status in ['aprobado', 'rechazado_definitivo']:
            solicitud.Mode = 'View'  # Formulario bloqueado (solo vista)
        
        # Validación de comentarios según el estado
        if approve_status == 'requiere_correcciones':
            # Comentarios OBLIGATORIOS para correcciones
            if not comentarios or not comentarios.strip():
                raise ValueError("Los comentarios son OBLIGATORIOS cuando se requieren correcciones")
            solicitud.Comentarios = comentarios.strip()
            
        elif approve_status == 'aprobado':
            # Limpiar comentarios previos si se aprueba
            solicitud.Comentarios = None
            
        elif approve_status == 'rechazado_definitivo':
            # Comentarios OPCIONALES para rechazo definitivo
            if comentarios and comentarios.strip():
                solicitud.Comentarios = comentarios.strip()
            # Si no hay comentarios, dejar el campo como está o limpiarlo
            # No forzamos comentarios en rechazo definitivo
        
        db.commit()
        db.refresh(solicitud)
        
        # Disparar evento según el estado de aprobación
        try:
            if approve_status == 'aprobado':
                event = SolicitudAprobada(
                    solicitud=solicitud,
                    aprobado_por="responsable@empresa.com"  # TODO: Obtener del contexto de usuario
                )
                self.event_dispatcher.dispatch(event)
                logger.info(f"Evento SolicitudAprobada disparado para solicitud #{solicitud.id_solicitud}")
                
            elif approve_status in ['requiere_correcciones', 'rechazado_definitivo']:
                event = SolicitudRechazada(
                    solicitud=solicitud,
                    rechazado_por="responsable@empresa.com",  # TODO: Obtener del contexto de usuario
                    comentarios=comentarios or ""
                )
                self.event_dispatcher.dispatch(event)
                logger.info(f"Evento SolicitudRechazada disparado para solicitud #{solicitud.id_solicitud}")
                
        except Exception as e:
            logger.error(f"Error disparando evento de aprobación/rechazo: {str(e)}")
        
        return solicitud
    
    def get_buildings_for_select(self, db: Session) -> List[Dict[str, str]]:
        """
        Obtiene lista de edificios para usar en un select.
        La búsqueda/filtrado se realiza en el frontend.
        
        Args:
            db: Sesión de base de datos
            
        Returns:
            Lista de diccionarios con formato {value, label} para React Select
        """
        try:
            # Query: solo edificios activos (INACTIVE = NULL o 'N'), ordenados por nombre
            buildings = db.query(CAT_BUILDINGS).filter(
                or_(
                    CAT_BUILDINGS.INACTIVE == 'N',
                    CAT_BUILDINGS.INACTIVE == None
                )
            ).order_by(CAT_BUILDINGS.BLDGNAME).all()
            
            # Formatear para select usando el método del modelo
            result = [building.to_select_option() for building in buildings]
            
            logger.info(f"Se obtuvieron {len(result)} edificios activos para select")
            return result
            
        except Exception as e:
            logger.error(f"Error al obtener edificios: {str(e)}")
            return []