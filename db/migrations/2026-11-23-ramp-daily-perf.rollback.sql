/* ============================================================================
   RAMP_Daily — rollback for 2026-11-23-ramp-daily-perf.sql
   ----------------------------------------------------------------------------
   Drops the 4 indexes created by the forward migration and restores the
   original NVARCHAR(MAX) types.

   Irreversible in time only, never in data: no values are affected either way.
   Widening back to MAX also rewrites the heap, so allow a maintenance window.

   Run with:
     npx tsx scripts/apply-ramp-daily-perf.mjs --rollback
   ========================================================================== */

SET NOCOUNT ON;
SET XACT_ABORT ON;

PRINT '--- dropping indexes';

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_pp_City_StartDate' AND object_id = OBJECT_ID('personnel_performance'))
  DROP INDEX IX_pp_City_StartDate ON personnel_performance;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ui_NationalCode_DateInfo' AND object_id = OBJECT_ID('users_info'))
  DROP INDEX IX_ui_NationalCode_DateInfo ON users_info;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_NationalCode' AND object_id = OBJECT_ID('users'))
  DROP INDEX IX_users_NationalCode ON users;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_depos_City_StartDate' AND object_id = OBJECT_ID('depos'))
  DROP INDEX IX_depos_City_StartDate ON depos;

PRINT '--- restoring NVARCHAR(MAX) columns';

DECLARE @sql NVARCHAR(MAX) = N'';

;WITH targets AS (
  SELECT 'personnel_performance' AS tbl, 'Start_Date' AS col UNION ALL
  SELECT 'personnel_performance', 'End_Date' UNION ALL
  SELECT 'personnel_performance', 'CreatedAtPersian' UNION ALL
  SELECT 'personnel_performance', 'NationalCode' UNION ALL
  SELECT 'personnel_performance', 'CityName' UNION ALL
  SELECT 'personnel_performance', 'NameFamily' UNION ALL
  SELECT 'personnel_performance', 'TownName' UNION ALL
  SELECT 'personnel_performance', 'BranchCode' UNION ALL
  SELECT 'personnel_performance', 'BranchName' UNION ALL
  SELECT 'personnel_performance', 'BranchType' UNION ALL
  SELECT 'users_info', 'NationalCode' UNION ALL
  SELECT 'users_info', 'PersonnelCode' UNION ALL
  SELECT 'users_info', 'ProjectType' UNION ALL
  SELECT 'users_info', 'Role' UNION ALL
  SELECT 'users_info', 'RoleType' UNION ALL
  SELECT 'users_info', 'ContractType' UNION ALL
  SELECT 'users_info', 'DateInfo' UNION ALL
  SELECT 'users_info', 'PhoneNumber' UNION ALL
  SELECT 'users_info', 'ContractStartDate' UNION ALL
  SELECT 'users_info', 'ContractEndDate' UNION ALL
  SELECT 'users_info', 'TotalPresence' UNION ALL
  SELECT 'users_info', 'ChargedPresence' UNION ALL
  SELECT 'users_info', 'OverTimeHour' UNION ALL
  SELECT 'users', 'NationalCode' UNION ALL
  SELECT 'users', 'CityName' UNION ALL
  SELECT 'users', 'NameFamily' UNION ALL
  SELECT 'depos', 'Start_Date' UNION ALL
  SELECT 'depos', 'End_Date' UNION ALL
  SELECT 'depos', 'CreatedAtPersian' UNION ALL
  SELECT 'depos', 'CityName' UNION ALL
  SELECT 'depos', 'ServiceName' UNION ALL
  SELECT 'depos', 'BillType'
)
SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(t.name) + N' ALTER COLUMN '
  + QUOTENAME(c.name) + N' NVARCHAR(MAX) '
  + CASE WHEN c.is_nullable = 1 THEN N'NULL' ELSE N'NOT NULL' END + N';' + CHAR(10)
FROM targets tg
JOIN sys.tables t ON t.name = tg.tbl
JOIN sys.columns c ON c.object_id = t.object_id AND c.name = tg.col
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
WHERE ty.name = 'nvarchar' AND c.max_length <> -1;

IF @sql = N''
  PRINT '    nothing to widen (already MAX)';
ELSE
BEGIN
  EXEC sys.sp_executesql @sql;
  PRINT '    columns restored to NVARCHAR(MAX)';
END

PRINT '--- rollback done';
