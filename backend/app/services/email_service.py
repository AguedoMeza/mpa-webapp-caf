import os
import json
import mimetypes
import base64
import requests
from app.core.config import settings
 # ⭐ FIX: Importar settings al inicio del método
from app.core.config import settings

class EmailService:
    """
    Servicio para envío de correos usando Microsoft Graph API.
    - Reutiliza autenticación y configuración de settings (como SharePoint)
    - Permite enviar correos con o sin adjuntos
    """
    def __init__(self):
        self.client_id = settings.GRAPH_CONFIG["client_id"]
        self.client_secret = settings.GRAPH_CONFIG["client_secret"]
        self.tenant_id = settings.GRAPH_CONFIG["tenant_id"]
        self.authority = settings.GRAPH_CONFIG["authority"]
        self.scope = settings.GRAPH_CONFIG["scope"]
        self.token = None

    def get_access_token(self):
        """
        Obtiene el token de acceso para Graph API usando MSAL.
        Reutiliza la configuración de SharePoint.
        """
        import msal
        app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret
        )
        result = app.acquire_token_for_client(scopes=self.scope)
        if "access_token" in result:
            self.token = result["access_token"]
            return self.token
        else:
            raise Exception(f"Error al obtener token de Graph: {result.get('error_description')}")

    def send_mail(self, sender, to, subject, body_html, attachment_path=None, extra_cc=None):
        """
        Envía un correo usando Microsoft Graph API con manejo de tokens expirados.
        Args:
            sender: Email del remitente
            to: Email del destinatario principal
            subject: Asunto del correo
            body_html: Cuerpo del correo en HTML
            attachment_path: Ruta opcional de archivo adjunto
            extra_cc: Lista opcional de emails adicionales para CC
        """
        # Siempre copiar a jose.serna@mpagroup.mx
        cc_emails = [
            "jose.serna@mpagroup.mx"
        ]
        
        # Agregar CC adicionales si se proporcionan (evitando duplicados)
        if extra_cc:
            for email in extra_cc:
                if email and email not in cc_emails and email != to:
                    cc_emails.append(email)
        if not self.token:
            self.get_access_token()

        url = f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        message = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "HTML",
                    "content": body_html
                },
                "toRecipients": [
                    {"emailAddress": {"address": to}}
                ],
                "ccRecipients": [
                    {"emailAddress": {"address": email}} for email in cc_emails
                ]
            }
        }

        # Agregar adjunto si se proporciona
        if attachment_path:
            filename = os.path.basename(attachment_path)
            mime_type, _ = mimetypes.guess_type(attachment_path)
            if not mime_type:
                mime_type = "application/octet-stream"

            with open(attachment_path, "rb") as f:
                content_bytes = base64.b64encode(f.read()).decode('utf-8')

            attachment = {
                "@odata.type": "#microsoft.graph.fileAttachment",
                "name": filename,
                "contentType": mime_type,
                "contentBytes": content_bytes
            }
            message["message"]["attachments"] = [attachment]

        resp = requests.post(url, headers=headers, data=json.dumps(message))
        
        # Si el token expiró (401), renovarlo y reintentar UNA vez
        if resp.status_code == 401:
            print("⚠️ Token expirado, renovando y reintentando...")
            self.get_access_token()
            headers["Authorization"] = f"Bearer {self.token}"
            resp = requests.post(url, headers=headers, data=json.dumps(message))
        
        if resp.status_code == 202:
            return {"status": "success", "message": "Correo enviado correctamente"}
        else:
            return {"status": "error", "code": resp.status_code, "message": resp.text}

    def send_caf_notification(self, to_email, solicitud_id, tipo_contratacion, responsable, 
                          frontend_base_url, is_update_from_corrections=False, building=None, cliente=None, proveedor=None, usuario_solicitante=None):
        """
        Envía correo de notificación de nueva solicitud CAF al responsable.
        Args:
            to_email: Email del responsable
            solicitud_id: ID de la solicitud
            tipo_contratacion: Tipo de contratación (CO, OS, OC, PD, FD)
            responsable: Nombre del responsable
            frontend_base_url: URL base del frontend
            is_update_from_corrections: True si es actualización desde correcciones, False si es nueva
        Returns:
            dict: Resultado del envío
        """
        # Mapeo de tipos a rutas del frontend (usando nombres completos)
        tipo_routes = {
            'Contrato de Obra': 'formato-co',
            'Orden de Servicio': 'solicitud-caf',
            'Orden de Cambio': 'formato-oc', 
            'Pago a Dependencia': 'formato-pd',
            'Firma de Documento': 'formato-fd'
        }
        
        route = tipo_routes.get(tipo_contratacion, 'solicitud-caf')
        approval_url = f"{frontend_base_url}/#/{route}/{solicitud_id}"
        
        # Personalizar mensaje según el contexto
        if is_update_from_corrections:
            subject = f"Solicitud CAF #{solicitud_id} - Correcciones Realizadas"
            header_text = "Solicitud CAF Actualizada - Correcciones Completadas"
            header_color = "#17a2b8"  # Color info/cyan para actualizaciones
            intro_text = "La solicitud CAF ha sido actualizada con las correcciones que usted solicitó."
            button_text = "Revisar Correcciones Realizadas"
            icon = "🔄"
        else:
            subject = f"Nueva Solicitud CAF #{solicitud_id} - Requiere Aprobación"
            header_text = "Nueva Solicitud CAF - Requiere Aprobación"
            header_color = "#2c5aa0"  # Color azul para nuevas
            intro_text = "Se ha creado una nueva solicitud CAF que requiere su revisión y aprobación."
            button_text = f"Revisar Solicitud CAF #{solicitud_id}"
            icon = "📝"
        
        body_html = f"""
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
            <h2 style=\"color: {header_color};\">{icon} {header_text}</h2>
            <div style=\"background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;\">
                <p style=\"margin-bottom: 15px;\">{intro_text}</p>
                <h3 style=\"margin-bottom: 10px;\">Detalles de la Solicitud</h3>
                <p><strong>ID:</strong> #{solicitud_id}</p>
                <p><strong>Tipo:</strong> {tipo_contratacion}</p>
                <p><strong>Responsable:</strong> {responsable}</p>
                <p><strong>Usuario Solicitante:</strong> {usuario_solicitante if usuario_solicitante else '-'} </p>
                <p><strong>Building:</strong> {building if building else '-'} </p>
                <p><strong>Cliente:</strong> {cliente if cliente else '-'} </p>
                <p><strong>Proveedor:</strong> {proveedor if proveedor else '-'} </p>
            </div>
            <div style=\"text-align: center; margin: 30px 0;\">
                <p style=\"margin-bottom: 15px;\">Haga clic en el botón siguiente para revisar la solicitud:</p>
                <a href=\"{approval_url}\" 
                style=\"background-color: {header_color}; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">
                    {button_text}
                </a>
            </div>
            <div style=\"border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; 
                        color: #6c757d; font-size: 12px;\">
                <p>Este correo fue generado automáticamente por el Sistema CAF.</p>
                <p>Si no puede hacer clic en el botón, copie y pegue este enlace en su navegador:</p>
                <p style=\"word-break: break-all;\">{approval_url}</p>
            </div>
        </div>
        """
        
        # Obtener el email del sender desde la configuración de Graph
        sender_email = settings.GRAPH_CONFIG["sender_email"]
        
        # Agregar al usuario solicitante como CC para que tenga confirmación de su solicitud
        extra_cc = [usuario_solicitante] if usuario_solicitante else None
        
        return self.send_mail(sender_email, to_email, subject, body_html, extra_cc=extra_cc)

    def send_caf_approval_result(self, to_email, solicitud_id, tipo_contratacion, approved, responsable, comentarios=None, edit_url=None, building=None, cliente=None, proveedor=None, usuario_solicitante=None):
        """
        Envía correo con el resultado de la aprobación/rechazo.
        """
       
        
        estado = "Aprobada" if approved else "Rechazada"
        color = "#28a745" if approved else "#dc3545"
        
        subject = f"Solicitud CAF #{solicitud_id} - {estado}"
        
        # Comentarios solo se muestran en caso de rechazo
        comentarios_html = ""
        if not approved and comentarios:
            comentarios_html = f"""
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h4 style="color: #721c24; margin-bottom: 10px;">Motivo del Rechazo:</h4>
                <p style="color: #721c24; margin: 0;">{comentarios}</p>
            </div>
            """
        
        # Botón para ver solicitud APROBADA
        view_button_html = ""
        if approved:
            # Mapeo de tipos a rutas (igual que en send_caf_notification)
            tipo_routes = {
                'Contrato de Obra': 'formato-co',
                'Orden de Servicio': 'solicitud-caf',
                'Orden de Cambio': 'formato-oc', 
                'Pago a Dependencia': 'formato-pd',
                'Firma de Documento': 'formato-fd'
            }
            
            frontend_base_url = settings.FRONTEND_BASE_URL
            route = tipo_routes.get(tipo_contratacion, 'solicitud-caf')
            view_url = f"{frontend_base_url}/#/{route}/{solicitud_id}"
            
            view_button_html = f"""
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin-bottom: 15px;"><strong>Ver solicitud aprobada y descargar PDF oficial:</strong></p>
                <a href="{view_url}" 
                style="background-color: #28a745; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    📄 Ver Solicitud Aprobada
                </a>
                <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                    Haga clic para ver la solicitud y descargar el PDF oficial.
                </p>
            </div>
            """
        
        # Botón de edición solo para correcciones (cuando se proporciona edit_url)
        edit_button_html = ""
        if not approved and edit_url:
            edit_button_html = f"""
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin-bottom: 15px;"><strong>Para realizar las correcciones solicitadas:</strong></p>
                <a href="{edit_url}" 
                style="background-color: #ffc107; color: #212529; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Editar Solicitud CAF #{solicitud_id}
                </a>
                <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
                    Haga clic en el botón para acceder al formulario y realizar las correcciones.
                </p>
            </div>
            """
        
        body_html = f"""
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
            <h2 style=\"color: {color};\">Solicitud CAF {estado}</h2>
            <div style=\"background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;\">
                <h3>Detalles de la Decisión</h3>
                <p><strong>ID:</strong> #{solicitud_id}</p>
                <p><strong>Tipo:</strong> {tipo_contratacion}</p>
                <p><strong>Estado:</strong> <span style=\"color: {color}; font-weight: bold;\">{estado}</span></p>
                <p><strong>Decidido por:</strong> {responsable}</p>
                <p><strong>Usuario Solicitante:</strong> {usuario_solicitante if usuario_solicitante else '-'} </p>
                <p><strong>Building:</strong> {building if building else '-'} </p>
                <p><strong>Cliente:</strong> {cliente if cliente else '-'} </p>
                <p><strong>Proveedor:</strong> {proveedor if proveedor else '-'} </p>
            </div>
            {comentarios_html}
            {view_button_html}
            {edit_button_html}
            <div style=\"border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; 
                        color: #6c757d; font-size: 12px;\">
                <p>Este correo fue generado automáticamente por el Sistema CAF.</p>
                {f'<p>Si no puede hacer clic en el botón, copie y pegue este enlace en su navegador:</p><p>{view_url if approved else edit_url}</p>' if (approved or edit_url) else ''}
            </div>
        </div>
        """
        
        sender_email = settings.GRAPH_CONFIG["sender_email"]
        
        return self.send_mail(sender_email, to_email, subject, body_html)


# Instancia singleton del servicio
email_service = EmailService()