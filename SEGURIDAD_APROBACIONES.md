# Control de Acceso para Aprobaciones CAF

## Implementación de Seguridad

Se ha implementado un sistema de control de acceso que garantiza que solo el **responsable asignado** puede ver y utilizar los controles de aprobación/rechazo de solicitudes CAF.

## Funcionalidades de Seguridad

### 1. Validación de Permisos
- **Función `canUserApprove()`**: Compara el email del usuario autenticado con el email del responsable asignado
- **Función `getUserPermissions()`**: Proporciona información completa sobre los permisos del usuario

### 2. Roles de Usuario
- **Responsable**: Usuario asignado que puede aprobar/rechazar (campo `Responsable`)
- **Solicitante**: Usuario que creó la solicitud (campo `Usuario`) 
- **Viewer**: Cualquier otro usuario con acceso de solo lectura

### 3. Comportamiento del Componente ApprovalActions

#### Para el Responsable Asignado:
```
✅ Se muestran todos los controles de aprobación
✅ Puede aprobar, solicitar correcciones o rechazar definitivamente
✅ Acceso completo a todas las funcionalidades
```

#### Para el Usuario Solicitante:
```
ℹ️  Se muestra mensaje informativo sobre acceso restringido
ℹ️  Se indica claramente quién es el responsable asignado
ℹ️  Se muestra el estado actual de la solicitud
❌ NO puede aprobar, rechazar o solicitar correcciones
```

#### Para Otros Usuarios:
```
ℹ️  Mensaje de acceso restringido
ℹ️  Información básica de la solicitud
❌ NO puede realizar acciones de aprobación
```

## Ejemplo de Uso

### Caso 1: Usuario Responsable
**Usuario autenticado:** `jose.serna@mpagroup.mx`  
**Responsable asignado:** `jose.serna@mpagroup.mx`  
**Resultado:** ✅ **Controles de aprobación VISIBLES y FUNCIONALES**

### Caso 2: Usuario Solicitante
**Usuario autenticado:** `samuel.lopez@mpagroup.mx`  
**Responsable asignado:** `jose.serna@mpagroup.mx`  
**Usuario creador:** `samuel.lopez@mpagroup.mx`  
**Resultado:** ❌ **Controles de aprobación OCULTOS** con mensaje informativo

### Caso 3: Otro Usuario
**Usuario autenticado:** `otro.usuario@mpagroup.mx`  
**Responsable asignado:** `jose.serna@mpagroup.mx`  
**Usuario creador:** `samuel.lopez@mpagroup.mx`  
**Resultado:** ❌ **Controles de aprobación OCULTOS** con mensaje de acceso restringido

## Validación en el Frontend

### Comparación de Emails
```typescript
// Comparación case-insensitive para mayor flexibilidad
return currentUser.toLowerCase() === responsableEmail.toLowerCase();
```

### Datos de Ejemplo de la API
```json
{
  "Usuario": "samuel.lopez@mpagroup.mx",     // Quien creó la solicitud
  "Responsable": "jose.serna@mpagroup.mx",  // Quien puede aprobar
  "approve": null,                          // Estado de aprobación
  "Mode": "",                              // Modo del formulario
  // ... otros campos
}
```

## Seguridad Implementada

1. **Validación en cada renderizado**: Se verifica permisos en tiempo real
2. **Información transparente**: El usuario ve claramente por qué no puede aprobar
3. **Sin exposición de funcionalidades**: Los controles simplemente no se renderizan
4. **Mensajes informativos**: El usuario entiende el estado y los roles

## Archivos Modificados

- `src/utils/caf-solicitud.utils.ts` - Funciones de validación de permisos
- `src/components/Inicio/CAF/ApprovalActions.tsx` - Control de visibilidad
- `src/components/Inicio/CAF/FormatoCO.tsx` - Paso de datos de solicitud
- `src/components/Inicio/CAF/FormatoOS.tsx` - Paso de datos de solicitud  
- `src/components/Inicio/CAF/ApprovalPage.tsx` - Paso de datos de solicitud

## Próximos Pasos Recomendados

1. **Validación Backend**: Implementar validación similar en el API
2. **Auditoría**: Registrar intentos de acceso no autorizado
3. **Notificaciones**: Alertar al responsable cuando hay solicitudes pendientes