import os
import json
import mimetypes
import base64
import requests
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

    def send_mail(self, sender, to, subject, body_html, attachment_path=None):
        """
        Envía un correo usando Microsoft Graph API con manejo de tokens expirados.
        """
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

    def send_caf_notification(self, to_email, solicitud_id, tipo_contratacion, responsable, frontend_base_url):
        """
        Envía correo de notificación de nueva solicitud CAF al responsable.
        Args:
            to_email: Email del responsable
            solicitud_id: ID de la solicitud
            tipo_contratacion: Tipo de contratación (CO, OS, OC, PD, FD)
            responsable: Nombre del responsable
            frontend_base_url: URL base del frontend
        Returns:
            dict: Resultado del envío
        """
        # Mapeo de tipos a rutas del frontend
        tipo_routes = {
            'CO': 'formato-co',
            'OS': 'solicitud-caf',
            'OC': 'formato-oc', 
            'PD': 'formato-pd',
            'FD': 'formato-fd'
        }
        
        route = tipo_routes.get(tipo_contratacion, 'solicitud-caf')
        approval_url = f"{frontend_base_url}/#/{route}/{solicitud_id}"
        
        subject = f"Nueva Solicitud CAF #{solicitud_id} - Requiere Aprobación"
        
        body_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Nueva Solicitud CAF - Requiere Aprobación</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>Detalles de la Solicitud</h3>
                <p><strong>ID:</strong> #{solicitud_id}</p>
                <p><strong>Tipo:</strong> {tipo_contratacion}</p>
                <p><strong>Responsable:</strong> {responsable}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p>Haga clic en el enlace siguiente para revisar y aprobar/rechazar la solicitud:</p>
                <a href="{approval_url}" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Revisar Solicitud CAF #{solicitud_id}
                </a>
            </div>
            
            <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; 
                        color: #6c757d; font-size: 12px;">
                <p>Este correo fue generado automáticamente por el Sistema CAF.</p>
                <p>Si no puede hacer clic en el botón, copie y pegue este enlace en su navegador:</p>
                <p>{approval_url}</p>
            </div>
        </div>
        """
        
        # Obtener el email del sender desde la configuración de Graph
        sender_email = settings.GRAPH_CONFIG["sender_email"]
        
        return self.send_mail(sender_email, to_email, subject, body_html)

    def send_caf_approval_result(self, to_email, solicitud_id, tipo_contratacion, approved, responsable, comentarios=None):
        """
        Envía correo con el resultado de la aprobación/rechazo.
        Args:
            to_email: Email del destinatario
            solicitud_id: ID de la solicitud
            tipo_contratacion: Tipo de contratación
            approved: True si fue aprobada, False si fue rechazada
            responsable: Nombre del responsable que tomó la decisión
            comentarios: Comentarios del rechazo (solo aplica cuando approved=False)
        Returns:
            dict: Resultado del envío
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
        
        body_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: {color};">Solicitud CAF {estado}</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>Detalles de la Decisión</h3>
                <p><strong>ID:</strong> #{solicitud_id}</p>
                <p><strong>Tipo:</strong> {tipo_contratacion}</p>
                <p><strong>Estado:</strong> <span style="color: {color}; font-weight: bold;">{estado}</span></p>
                <p><strong>Decidido por:</strong> {responsable}</p>
            </div>
            
            {comentarios_html}
            
            <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; 
                        color: #6c757d; font-size: 12px;">
                <p>Este correo fue generado automáticamente por el Sistema CAF.</p>
            </div>
        </div>
        """
        
        sender_email = settings.GRAPH_CONFIG["sender_email"]
        
        return self.send_mail(sender_email, to_email, subject, body_html)


# Instancia singleton del servicio
email_service = EmailService()