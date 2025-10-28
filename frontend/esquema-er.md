# Esquema Entidad-Relación CAF (Fiel al esquema real)

## Tabla principal

**TBL_CAF_Solicitud**
- Tipo_Contratacion (varchar(100), NULL)
- Responsable (varchar(100), NULL)
- Fecha (date, NULL)
- Cliente (varchar(100), NULL)
- Building (varchar(100), NULL)
- Direccion (varchar(100), NULL)
- Proveedor (varchar(100), NULL)
- Descripcion_trabajo_servicio (varchar(100), NULL)
- Fecha_inicio (date, NULL)
- FechaTerminacionFinalServ (date, NULL)
- MontoMXNsubtotal (varchar(100), NULL)
- MontoUSDsubtotal (varchar(100), NULL)
- TDC (varchar(100), NULL)
- Anticipo (varchar(100), NULL)
- Fuerza_trabajo (varchar(100), NULL)
- Presupuesto_existente (varchar(100), NULL)
- Tipo_trabajo (varchar(100), NULL)
- Recuperable (varchar(100), NULL)
- Justificacion_trabajo (varchar(100), NULL)
- Enlace_sharepoint (varchar(1000), NULL)
- approve (int, NULL)
- id_solicitud (int identity, PK, NOT NULL)
- Cotizacion_MPA_CP (int, NULL)
- AprobacionCorreoConcurso (int, NULL)
- AnalisisRiesgosWHSE_VOBO (int, NULL)
- DibujosEspecificaciones (int, NULL)
- ProgramaObra (int, NULL)
- DocumentoFirmar (int, NULL)
- Acta_Constitutiva (int, NULL)
- Poder_Notarial (int, NULL)
- INE_Rep_Legal (int, NULL)
- AltaIMSS_REPSE (int, NULL)
- InfoBancariaContrato (int, NULL)
- FichaPago (int, NULL)
- InfoBancariaPagoDep (int, NULL)
- Fecha_Ocupacion_Benefica (date, NULL)
- Fecha_Terminacion_Sustancial (date, NULL)
- Fianza_Anticipo (varchar(100), NULL)
- FianzaCumplimiento_BuenaCalidad (varchar(100), NULL)
- Fianza_Pasivos_Contingentes (varchar(100), NULL)
- CveSol (varchar(100), NULL)
- VOBO_LegalFirma (int, NULL)
- VOBO_LegalPagoDep (int, NULL)
- FechaTerminacionFinalCont (date, NULL)
- MontoOriginalMXN (varchar(100), NULL)
- Comentarios (varchar(500), NULL)
- Mode (varchar(100), NULL)
- Usuario (varchar(100), NULL)
- MontoOriginalUSD (varchar(100), NULL)
- MontoActualizadoMXN (varchar(100), NULL)
- MontoActualizadoUSD (varchar(100), NULL)
- NuevaOcupacionBenefica (varchar(100), NULL)
- NuevaTerminacionSust (varchar(100), NULL)
- NuevaTerminacionFinal (varchar(100), NULL)
- TiempoDias (varchar(100), NULL)

## Catálogos

**CAT_Tipo_Contratacion**
- Id_Tipo_Contratacion (int identity, PK, NOT NULL)
- Tipo_Contratacion (varchar(100), NULL)
- Activo (int, NULL)
- Cve_Tipo (varchar(10), NULL)

**CAT_Tipo_Trabajo**
- Id_Tipo_Trabajo (int identity, PK, NOT NULL)
- Tipo_Trabajo (varchar(100), NULL)
- Activo (int, NULL)

## Documentos (en TBL_CAF_Solicitud)
- Cotizacion_MPA_CP (int, NULL)
- AprobacionCorreoConcurso (int, NULL)
- AnalisisRiesgosWHSE_VOBO (int, NULL)
- ...otros campos de documentos (ver tabla real)

## Otros catálogos recomendados

**Usuario**
- id (int, PK)
- nombre (varchar)
- email (varchar)
- rol (varchar)

**Proveedor**
- id (int, PK)
- nombre (varchar)

**Cliente**
- id (int, PK)
- nombre (varchar)

---

## Diagrama simplificado

TBL_CAF_Solicitud
│
├─ CAT_Tipo_Contratacion
├─ CAT_Tipo_Trabajo
├─ Usuario
├─ Proveedor
├─ Cliente

TBL_CAF_Solicitud ──< Documentos (campos)
