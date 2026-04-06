-- ============================================================
-- Script: create_cat_elegibilidad_usuario.sql
-- Base de datos: definida en MASTER_DB_NAME del .env
-- Descripción: Crea la tabla CAT_Elegibilidad_Usuario con sus
--              constraints, índice covering e inserta los datos
--              iniciales equivalentes a las listas que estaban
--              hardcodeadas en user_service.py
-- Ejecutar como: usuario con permisos DDL en BD_AppsHub
-- ============================================================

USE [BD_AppsHub];
GO

-- ============================================================
-- 1. TABLA
-- ============================================================
IF NOT EXISTS (
    SELECT 1
    FROM   sys.tables
    WHERE  name = 'CAT_Elegibilidad_Usuario'
      AND  schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE dbo.CAT_Elegibilidad_Usuario (
        Id_Elegibilidad INT           NOT NULL IDENTITY(1,1),
        Tipo_Regla      VARCHAR(20)   NOT NULL,   -- 'dominio' | 'departamento' | 'puesto'
        Valor           VARCHAR(100)  NOT NULL,
        Activo          INT           NOT NULL CONSTRAINT DF_Elegibilidad_Activo   DEFAULT 1,
        Prioridad       INT           NOT NULL CONSTRAINT DF_Elegibilidad_Prioridad DEFAULT 0,

        CONSTRAINT PK_CAT_Elegibilidad_Usuario PRIMARY KEY CLUSTERED (Id_Elegibilidad),
        CONSTRAINT UQ_Elegibilidad_TipoValor   UNIQUE (Tipo_Regla, Valor),
        CONSTRAINT CK_Elegibilidad_TipoRegla   CHECK  (Tipo_Regla IN ('dominio', 'departamento', 'puesto'))
    );

    PRINT 'Tabla CAT_Elegibilidad_Usuario creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La tabla CAT_Elegibilidad_Usuario ya existe. Se omite la creación.';
END
GO

-- ============================================================
-- 2. ÍNDICE COVERING
-- Optimiza la query principal del ElegibilidadRepository:
--   WHERE Tipo_Regla = ? AND Activo = 1  ORDER BY Prioridad
-- El INCLUDE evita key lookup al traer Valor y Prioridad
-- directamente desde las hojas del índice.
-- ============================================================
IF NOT EXISTS (
    SELECT 1
    FROM   sys.indexes
    WHERE  name   = 'IX_CAT_Elegibilidad_TipoActivo'
      AND  object_id = OBJECT_ID('dbo.CAT_Elegibilidad_Usuario')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_CAT_Elegibilidad_TipoActivo
        ON dbo.CAT_Elegibilidad_Usuario (Tipo_Regla, Activo)
        INCLUDE (Valor, Prioridad);

    PRINT 'Índice IX_CAT_Elegibilidad_TipoActivo creado correctamente.';
END
ELSE
BEGIN
    PRINT 'El índice IX_CAT_Elegibilidad_TipoActivo ya existe. Se omite la creación.';
END
GO

-- ============================================================
-- 3. DATOS INICIALES
-- Usa MERGE para ser idempotente: si ya existen registros con
-- el mismo (Tipo_Regla, Valor) no los duplica.
-- ============================================================
MERGE dbo.CAT_Elegibilidad_Usuario AS target
USING (
    VALUES
        -- Dominios permitidos
        ('dominio',      '@mpagroup.mx',                        1, 0),
        ('dominio',      '@macquarie.com',                      1, 1),

        -- Departamentos (Prioridad define orden en el select del frontend)
        ('departamento', 'Property Management',                  1, 0),
        ('departamento', 'Information Technology',               1, 1),
        ('departamento', 'Engineering',                          1, 2),

        -- Puestos habilitados
        ('puesto',       'Admin Property Management',            1, 0),
        ('puesto',       'Jr Property Manager',                  1, 1),
        ('puesto',       'Administrative Manager',               1, 2),
        ('puesto',       'Leasing Administrator',                1, 3),
        ('puesto',       'PSP Analyst',                          1, 4),
        ('puesto',       'PSP Manager',                          1, 5),
        ('puesto',       'PSP Jr. Analyst',                      1, 6),
        ('puesto',       'Staff Accountant',                     1, 7),

        -- Puestos deshabilitados (Activo = 0, conservados para historial)
        ('puesto',       'Property Manager & Park Specialist',   0, 99),
        ('puesto',       'Building Risk Manager',                0, 99),
        ('puesto',       'WHSE Manager',                         0, 99),
        ('puesto',       'Jr. Accountant',                       0, 99)
) AS source (Tipo_Regla, Valor, Activo, Prioridad)
    ON target.Tipo_Regla = source.Tipo_Regla
   AND target.Valor      = source.Valor
WHEN NOT MATCHED BY TARGET THEN
    INSERT (Tipo_Regla, Valor, Activo, Prioridad)
    VALUES (source.Tipo_Regla, source.Valor, source.Activo, source.Prioridad);

PRINT CONCAT(@@ROWCOUNT, ' registro(s) insertado(s) en CAT_Elegibilidad_Usuario.');
GO

-- ============================================================
-- 4. VERIFICACIÓN
-- ============================================================
SELECT
    Tipo_Regla,
    Valor,
    CASE Activo WHEN 1 THEN 'Activo' ELSE 'Inactivo' END AS Estado,
    Prioridad
FROM dbo.CAT_Elegibilidad_Usuario
ORDER BY
    Tipo_Regla,
    Activo DESC,
    Prioridad;
GO
