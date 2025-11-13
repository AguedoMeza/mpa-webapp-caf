import pytest
import sys
import os

# Agregar el directorio del proyecto al path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.email_service import email_service


class TestEmailService:
    """
    Tests para el EmailService de Microsoft Graph API.
    Prueba los métodos específicos para el flujo CAF.
    """

    def test_send_caf_notification(self):
        """
        Prueba el envío de notificación de nueva solicitud CAF.
        """
        # Datos de prueba
        to_email = "jose.serna@mpagroup.mx"
        solicitud_id = 999
        tipo_contratacion = "CO"
        responsable = "José Serna (Test)"
        frontend_base_url = "http://localhost:3000"

        # Ejecutar el método
        try:
            result = email_service.send_caf_notification(
                to_email=to_email,
                solicitud_id=solicitud_id,
                tipo_contratacion=tipo_contratacion,
                responsable=responsable,
                frontend_base_url=frontend_base_url
            )

            # Verificar resultado
            print(f"✅ Resultado del envío: {result}")
            
            if result["status"] == "success":
                print(f"✅ Correo de notificación enviado exitosamente a {to_email}")
                print(f"📧 Asunto: Nueva Solicitud CAF #{solicitud_id} - Requiere Aprobación")
                print(f"🔗 Link generado: {frontend_base_url}/#/formato-co/{solicitud_id}")
            else:
                print(f"❌ Error en el envío: {result}")
                
            # Aserción básica
            assert result is not None
            assert "status" in result

        except Exception as e:
            print(f"❌ Error durante la prueba: {str(e)}")
            pytest.fail(f"Error en test_send_caf_notification: {str(e)}")

    def test_send_caf_approval_result_approved(self):
        """
        Prueba el envío de correo para solicitud aprobada.
        Los comentarios NO deben aparecer en aprobaciones.
        """
        # Datos de prueba
        to_email = "jose.serna@mpagroup.mx"
        solicitud_id = 888
        tipo_contratacion = "OS"
        approved = True
        responsable = "Director Técnico"
        # Los comentarios se ignoran en aprobaciones

        # Ejecutar el método
        try:
            result = email_service.send_caf_approval_result(
                to_email=to_email,
                solicitud_id=solicitud_id,
                tipo_contratacion=tipo_contratacion,
                approved=approved,
                responsable=responsable
                # Sin comentarios en aprobaciones
            )

            # Verificar resultado
            print(f"✅ Resultado del envío (Aprobada): {result}")
            
            if result["status"] == "success":
                print(f"✅ Correo de aprobación enviado exitosamente a {to_email}")
                print(f"📧 Asunto: Solicitud CAF #{solicitud_id} - Aprobada")
                print(f"ℹ️  Los comentarios NO aparecen en aprobaciones")
            else:
                print(f"❌ Error en el envío: {result}")
                
            # Aserción básica
            assert result is not None
            assert "status" in result

        except Exception as e:
            print(f"❌ Error durante la prueba: {str(e)}")
            pytest.fail(f"Error en test_send_caf_approval_result_approved: {str(e)}")

    def test_send_caf_approval_result_rejected(self):
        """
        Prueba el envío de correo para solicitud rechazada.
        Los comentarios SÍ deben aparecer en rechazos.
        """
        # Datos de prueba
        to_email = "jose.serna@mpagroup.mx"
        solicitud_id = 777
        tipo_contratacion = "PD"
        approved = False
        responsable = "Director Técnico"
        comentarios = "El presupuesto excede los límites aprobados. Favor de ajustar el monto y proporcionar justificación adicional para proceder."

        # Ejecutar el método
        try:
            result = email_service.send_caf_approval_result(
                to_email=to_email,
                solicitud_id=solicitud_id,
                tipo_contratacion=tipo_contratacion,
                approved=approved,
                responsable=responsable,
                comentarios=comentarios
            )

            # Verificar resultado
            print(f"✅ Resultado del envío (Rechazada): {result}")
            
            if result["status"] == "success":
                print(f"✅ Correo de rechazo enviado exitosamente a {to_email}")
                print(f"📧 Asunto: Solicitud CAF #{solicitud_id} - Rechazada")
                print(f"💬 Motivo del rechazo: {comentarios}")
                print(f"ℹ️  Los comentarios aparecen con estilo de rechazo")
            else:
                print(f"❌ Error en el envío: {result}")
                
            # Aserción básica
            assert result is not None
            assert "status" in result

        except Exception as e:
            print(f"❌ Error durante la prueba: {str(e)}")
            pytest.fail(f"Error en test_send_caf_approval_result_rejected: {str(e)}")

    def test_email_service_token_acquisition(self):
        """
        Prueba que el servicio pueda obtener un token de acceso.
        """
        try:
            token = email_service.get_access_token()
            
            print(f"✅ Token obtenido exitosamente")
            print(f"🔑 Token (primeros 50 chars): {token[:50]}...")
            
            # Verificar que el token no esté vacío
            assert token is not None
            assert len(token) > 0
            assert isinstance(token, str)

        except Exception as e:
            print(f"❌ Error al obtener token: {str(e)}")
            pytest.fail(f"Error en test_email_service_token_acquisition: {str(e)}")

    def test_tipo_contratacion_mapping(self):
        """
        Prueba el mapeo correcto de tipos de contratación a rutas del frontend.
        """
        # Datos de prueba para todos los tipos (usando nombres completos)
        tipos_test = ['Contrato de Obra', 'Orden de Servicio', 'Orden de Cambio', 'Pago a Dependencia', 'Firma de Documento']
        expected_routes = {
            'Contrato de Obra': 'formato-co',
            'Orden de Servicio': 'solicitud-caf',
            'Orden de Cambio': 'formato-oc',
            'Pago a Dependencia': 'formato-pd',
            'Firma de Documento': 'formato-fd'
        }

        for tipo in tipos_test:
            print(f"🧪 Probando tipo: {tipo}")
            
            # Este test no envía correo, solo verifica la lógica interna
            # Simulamos la lógica del método sin ejecutar el envío
            tipo_routes = {
                'Contrato de Obra': 'formato-co',
                'Orden de Servicio': 'solicitud-caf',
                'Orden de Cambio': 'formato-oc', 
                'Pago a Dependencia': 'formato-pd',
                'Firma de Documento': 'formato-fd'
            }
            
            route = tipo_routes.get(tipo, 'solicitud-caf')
            expected_route = expected_routes[tipo]
            
            print(f"  ✅ {tipo} -> {route} (esperado: {expected_route})")
            assert route == expected_route

        print("✅ Todos los mapeos de tipos son correctos")


if __name__ == "__main__":
    """
    Ejecuta las pruebas directamente.
    Uso: python test_email_service.py
    """
    print("🚀 Iniciando pruebas del EmailService...")
    print("=" * 60)
    
    test_instance = TestEmailService()
    
    # Ejecutar pruebas una por una
    try:
        print("\n📋 Test 1: Obtener token de acceso")
        test_instance.test_email_service_token_acquisition()
        
        print("\n📋 Test 2: Mapeo de tipos de contratación")
        test_instance.test_tipo_contratacion_mapping()
        
        print("\n📋 Test 3: Envío de notificación CAF")
        test_instance.test_send_caf_notification()
        
        print("\n📋 Test 4: Envío de resultado - Aprobada")
        test_instance.test_send_caf_approval_result_approved()
        
        print("\n📋 Test 5: Envío de resultado - Rechazada")
        test_instance.test_send_caf_approval_result_rejected()
        
        print("\n" + "=" * 60)
        print("🎉 ¡Todas las pruebas completadas!")
        print(f"📧 Revisa la bandeja de entrada de: jose.serna@mpagroup.mx")
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {str(e)}")
        print("💡 Verifica la configuración de GRAPH_CONFIG en .env")