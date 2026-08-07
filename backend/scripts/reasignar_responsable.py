"""
Reasigna el Responsable de una solicitud CAF.

Herramienta de soporte para casos puntuales: el responsable asignado ya no esta
disponible (baja, vacaciones) y la solicitud queda bloqueada porque la app no
tiene pantalla de reasignacion. El campo Responsable es lo unico que determina
quien ve los controles de aprobacion (ver canUserApprove en el frontend).

Reutiliza la arquitectura existente: SessionLocal, CafSolicitudService y
email_service. No toca la BD por fuera del modelo.

Por defecto corre en simulacion. Hay que pasar --aplicar para escribir, y
--notificar para avisarle por correo al nuevo responsable.

Uso (desde backend/, con el venv activo):

    python scripts/reasignar_responsable.py --solicitud 975 --responsable antonio.ramirez@mpagroup.mx
    python scripts/reasignar_responsable.py --solicitud 975 --responsable antonio.ramirez@mpagroup.mx --aplicar --notificar
"""

import argparse
import os
import sys

# Permite ejecutar el script desde backend/ sin instalar el paquete
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.services.caf_solicitud_service import CafSolicitudService
from app.services.email_service import email_service


ESTADOS = {
    None: "pendiente de revision",
    0: "requiere correcciones",
    1: "aprobado",
    2: "rechazado definitivo",
}


def mostrar(solicitud) -> None:
    """Imprime el estado relevante de la solicitud."""
    print(f"  id_solicitud      : {solicitud.id_solicitud}")
    print(f"  Tipo_Contratacion : {solicitud.Tipo_Contratacion}")
    print(f"  Building          : {solicitud.Building}")
    print(f"  Cliente           : {solicitud.Cliente}")
    print(f"  Usuario (creador) : {solicitud.Usuario}")
    print(f"  Responsable       : {solicitud.Responsable}")
    print(f"  approve           : {solicitud.approve} ({ESTADOS.get(solicitud.approve, 'desconocido')})")
    print(f"  Mode              : {solicitud.Mode!r}")


RUTAS = {
    "Contrato de Obra": "formato-co",
    "Orden de Servicio": "solicitud-caf",
    "Orden de Cambio": "formato-oc",
    "Pago a Dependencia": "formato-pd",
    "Firma de Documento": "formato-fd",
}


def construir_link(solicitud, frontend_url: str) -> str:
    """Arma el link al formato, igual que lo hace email_service."""
    ruta = RUTAS.get(solicitud.Tipo_Contratacion, "solicitud-caf")
    return f"{frontend_url}/#/{ruta}/{solicitud.id_solicitud}"


def notificar(solicitud, destinatario: str, frontend_url: str) -> bool:
    """Envia al responsable el correo estandar de solicitud pendiente."""
    print(f"\nEnviando notificacion a {destinatario}...")
    print(f"  Link incluido: {construir_link(solicitud, frontend_url)}")
    resultado = email_service.send_caf_notification(
        to_email=destinatario,
        solicitud_id=solicitud.id_solicitud,
        tipo_contratacion=solicitud.Tipo_Contratacion,
        responsable=destinatario,
        frontend_base_url=frontend_url,
        building=solicitud.Building,
        cliente=solicitud.Cliente,
        proveedor=solicitud.Proveedor,
        usuario_solicitante=solicitud.Usuario,
    )
    if resultado.get("status") == "success":
        print("Correo enviado.")
        return True
    print(f"ADVERTENCIA: el correo no se envio: {resultado}")
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Reasigna el Responsable de una solicitud CAF.")
    parser.add_argument("--solicitud", type=int, required=True, help="id_solicitud a reasignar")
    parser.add_argument("--responsable", required=True, help="Correo del nuevo responsable")
    parser.add_argument("--aplicar", action="store_true", help="Escribe el cambio. Sin esto solo simula.")
    parser.add_argument("--notificar", action="store_true", help="Envia al nuevo responsable el correo de solicitud pendiente.")
    parser.add_argument(
        "--solo-notificar",
        action="store_true",
        help="Reenvia el correo al responsable actual sin modificar nada. Util si el aviso anterior salio mal.",
    )
    parser.add_argument(
        "--frontend-url",
        default=None,
        help="Sobrescribe FRONTEND_BASE_URL para el link del correo. Necesario al correr desde una maquina local.",
    )
    parser.add_argument(
        "--forzar",
        action="store_true",
        help="Permite reasignar solicitudes ya resueltas o en correcciones. Leer las advertencias antes de usarlo.",
    )
    args = parser.parse_args()

    nuevo = args.responsable.strip()
    if "@" not in nuevo:
        print(f"ERROR: '{nuevo}' no parece un correo.")
        return 1

    frontend_url = (args.frontend_url or settings.FRONTEND_BASE_URL).rstrip("/")

    # El .env de una maquina local deja FRONTEND_BASE_URL en localhost y el correo sale
    # con un link inservible. Mejor abortar que mandarlo roto.
    if (args.notificar or args.solo_notificar) and ("localhost" in frontend_url or "127.0.0.1" in frontend_url):
        print(
            f"ERROR: FRONTEND_BASE_URL apunta a '{frontend_url}'. El correo saldria con un link "
            "que el destinatario no puede abrir.\n"
            "       Corre el script en el servidor, o pasa --frontend-url https://webapplication.mpagroup.mx/mpa-webapp-caf"
        )
        return 1

    db = SessionLocal()
    try:
        service = CafSolicitudService()
        solicitud = service.get_detail(db, args.solicitud)

        if solicitud is None:
            print(f"ERROR: no existe la solicitud #{args.solicitud}.")
            return 1

        print(f"\nEstado actual de la solicitud #{args.solicitud}:")
        mostrar(solicitud)

        anterior = solicitud.Responsable

        # Reenvio puro: no toca nada, solo vuelve a mandar el aviso al responsable actual.
        if args.solo_notificar:
            if (anterior or "").lower() != nuevo.lower():
                print(
                    f"\nERROR: el responsable actual es {anterior!r}, no {nuevo!r}. "
                    "Con --solo-notificar solo se le puede reenviar a quien ya esta asignado."
                )
                return 1
            notificar(solicitud, anterior, frontend_url)
            print(f"\nResumen para el ticket:\n  Solicitud #{solicitud.id_solicitud} - reenvio de notificacion a {anterior}")
            return 0

        if (anterior or "").lower() == nuevo.lower():
            print(f"\nSin cambios: el responsable ya es {nuevo}.")
            return 0

        # La solicitud ya fue resuelta: reasignar no sirve de nada y altera un historial.
        if solicitud.approve in (1, 2) and not args.forzar:
            print(
                f"\nERROR: la solicitud ya esta '{ESTADOS[solicitud.approve]}'. "
                "Reasignar el responsable no la reabre. Usar --forzar solo si se sabe lo que se hace."
            )
            return 1

        # CafSolicitudService.update() resetea approve a NULL y dispara el correo de
        # 'correcciones realizadas' cuando la solicitud viene de approve=0. Para una
        # reasignacion ese efecto no es deseado, asi que se exige confirmacion explicita.
        if solicitud.approve == 0 and not args.forzar:
            print(
                "\nERROR: la solicitud esta en 'requiere correcciones'. Al actualizarla, el servicio "
                "la regresa a pendiente y notifica al responsable. Si aun asi quieres reasignarla, "
                "usa --forzar sabiendo que se enviara ese correo."
            )
            return 1

        print(f"\nCambio a realizar:")
        print(f"  Responsable: {anterior!r} -> {nuevo!r}")

        if not args.aplicar:
            print("\nSIMULACION. No se escribio nada. Volver a correr con --aplicar para confirmar.")
            return 0

        service.update(db, args.solicitud, {"Responsable": nuevo})
        db.refresh(solicitud)

        print("\nAplicado. Estado nuevo:")
        mostrar(solicitud)

        if args.notificar:
            notificar(solicitud, nuevo, frontend_url)
        else:
            print(
                f"\nNo se envio correo (falta --notificar). Link directo para el nuevo responsable:\n"
                f"  {construir_link(solicitud, frontend_url)}"
            )

        print(
            f"\nResumen para el ticket:\n"
            f"  Solicitud #{solicitud.id_solicitud} ({solicitud.Tipo_Contratacion}, {solicitud.Building})\n"
            f"  Responsable {anterior} -> {nuevo}\n"
            f"  Notificado por correo: {'si' if args.notificar else 'no'}"
        )
        return 0

    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
