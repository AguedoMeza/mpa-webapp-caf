-- Agrega la bitacora de reasignaciones del Admin Responsable.
--
-- Se guarda como una sola columna de texto al que se le agrega una linea por
-- cambio, en lugar de una tabla aparte: las reasignaciones son excepcionales
-- (una o dos por solicitud en el peor caso) y asi el historial viaja junto al
-- registro sin necesidad de un join ni de una pantalla nueva.
--
-- Formato de cada linea:
--   2026-08-10 14:32 | jose.serna@mpagroup.mx | andrea.ramirez@... -> antonio.ramirez@... | vacaciones
--
-- Ejecutar en la base a la que apunta MASTER_DB_NAME del backend desplegado.
--
-- PENDIENTE DE APLICAR. La reasignacion ya funciona sin esta columna: el rastro
-- queda en el log del backend con formato fijo ("REASIGNACION #id | fecha |
-- quien | anterior -> nuevo | motivo").
--
-- Cuando se aplique, hay que reactivar en el codigo:
--   1. models/caf_solicitud.py       -> descomentar Historial_Reasignacion
--   2. services/caf_solicitud_service.py -> en reasignar_responsable(), escribir
--      la linea 'rastro' en la columna en lugar de solo loguearla
--   3. api/caf_solicitud.py          -> devolver "historial" en la respuesta

USE WH_QA_Macquarie;
GO

-- 1) Verificar que no exista ya
SELECT DB_NAME() AS base_actual,
       COUNT(*)  AS ya_existe
FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.TBL_CAF_Solicitud')
  AND name = 'Historial_Reasignacion';
-- Esperado antes del cambio: WH_QA_Macquarie / 0

-- 2) Aplicar
ALTER TABLE dbo.TBL_CAF_Solicitud
  ADD Historial_Reasignacion varchar(2000)
      COLLATE Modern_Spanish_CI_AS NULL;
GO

-- 3) Confirmar: repetir el SELECT del paso 1 -> ya_existe = 1

-- NOTA sobre el tamano de fila: sumando los anchos declarados, la tabla ya
-- rebasaba los 8,060 bytes desde que Descripcion_trabajo_servicio paso a
-- varchar(2000). Esta columna emite el mismo warning 1708 al aplicarse. No
-- impide nada: SQL Server usa row-overflow y mueve el dato fuera de fila si
-- alguna fila real lo necesitara.
