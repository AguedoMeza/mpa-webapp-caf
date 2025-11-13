#!/usr/bin/env python3

"""
Script para probar el mapeo corregido de tipos de contratación.
"""

# Mapeo anterior (INCORRECTO)
mapeo_anterior = {
    'CO': 'formato-co',
    'OS': 'solicitud-caf',
    'OC': 'formato-oc', 
    'PD': 'formato-pd',
    'FD': 'formato-fd'
}

# Mapeo nuevo (CORRECTO)
mapeo_nuevo = {
    'Contrato de Obra': 'formato-co',
    'Orden de Servicio': 'solicitud-caf',
    'Orden de Cambio': 'formato-oc', 
    'Pago a Dependencia': 'formato-pd',
    'Firma de Documento': 'formato-fd'
}

def probar_mapeo():
    print("🧪 PRUEBA DE MAPEO DE TIPOS DE CONTRATACIÓN")
    print("=" * 50)
    
    # Simular datos que vienen de la base de datos
    tipos_en_db = [
        'Contrato de Obra',
        'Orden de Servicio', 
        'Orden de Cambio',
        'Pago a Dependencia',
        'Firma de Documento'
    ]
    
    print("📋 Tipos en la base de datos:")
    for tipo in tipos_en_db:
        print(f"   - {tipo}")
    
    print("\n🔍 Probando mapeo anterior (INCORRECTO):")
    for tipo in tipos_en_db:
        ruta = mapeo_anterior.get(tipo, 'solicitud-caf')  # default
        print(f"   {tipo} → {ruta}")
        if ruta == 'solicitud-caf' and tipo != 'Orden de Servicio':
            print(f"   ❌ PROBLEMA: {tipo} está siendo mapeado a la ruta por defecto!")
    
    print("\n✅ Probando mapeo nuevo (CORRECTO):")
    for tipo in tipos_en_db:
        ruta = mapeo_nuevo.get(tipo, 'solicitud-caf')  # default
        print(f"   {tipo} → {ruta}")
    
    print("\n🌐 URLs que se generarían:")
    solicitud_id = 278
    frontend_base = "http://localhost:3000"
    
    for tipo in tipos_en_db:
        ruta = mapeo_nuevo.get(tipo, 'solicitud-caf')
        url = f"{frontend_base}/#/{ruta}/{solicitud_id}"
        print(f"   {tipo}: {url}")
    
    print("\n🎯 Para solicitud #278 (Contrato de Obra):")
    tipo_solicitud_278 = 'Contrato de Obra'
    ruta_correcta = mapeo_nuevo.get(tipo_solicitud_278, 'solicitud-caf')
    url_correcta = f"{frontend_base}/#/{ruta_correcta}/{solicitud_id}"
    
    print(f"   Tipo: {tipo_solicitud_278}")
    print(f"   Ruta: {ruta_correcta}")
    print(f"   URL: {url_correcta}")
    
    url_incorrecta = f"{frontend_base}/#/solicitud-caf/{solicitud_id}"
    print(f"\n   ❌ URL anterior (incorrecta): {url_incorrecta}")
    print(f"   ✅ URL nueva (correcta): {url_correcta}")

if __name__ == "__main__":
    probar_mapeo()