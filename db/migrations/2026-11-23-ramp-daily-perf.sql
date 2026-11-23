/* ============================================================================
   RAMP_Daily — performance migration for the v2 table / depo pages
   ----------------------------------------------------------------------------
   WHY
     personnel_performance has 1.6M rows and *no index* other than the clustered
     primary key on Id. Measured 2026-11-23 against SQL Server 2019 Enterprise:
       SELECT COUNT(DISTINCT CityName)          -> 102 s
       one month, all cities, aggregated        ->  21 s
       one month, single city, aggregated       -> 409 ms
     Every column the pages filter or group on is NVARCHAR(MAX), and SQL Server
     cannot build an index key on NVARCHAR(MAX). So the columns have to be
     narrowed before any usable index can exist.

   WHAT
     1. Preflight: abort with a readable message if any value would not fit the
        new type, or if a MAX column is already part of an index.
     2. Narrow the indexable string columns from NVARCHAR(MAX) to sized types.
        Types and indexes only — no value is ever rewritten.
     3. Create 4 covering indexes that serve the whole v2 query surface.

   HOW TO RUN
     node scripts/apply-ramp-daily-perf.mjs --preflight  # checks only, no DDL
     node scripts/apply-ramp-daily-perf.mjs --apply      # preflight + DDL
     node scripts/apply-ramp-daily-perf.mjs --rollback   # undo (see .rollback.sql)

   OPERATIONAL NOTES
     * Server is SQL Server 2019 Enterprise, so the four index builds use
       ONLINE = ON and stay queryable while they build.
     * **Cost model.** `ALTER COLUMN` on a `NVARCHAR(MAX)` column must convert
       off-row LOB data to in-row data, so *each* statement rewrites the whole
       heap. personnel_performance has 32 target columns across the four tables;
       the rewrite happens 32 times. Budget a real maintenance window (measure
       the first statement, then multiply) rather than the "few minutes" that a
       single rewrite would suggest.
       If that window is not available, the faster alternative is a one-pass
       rebuild of personnel_performance into a correctly typed twin table and a
       rename; it needs the table to be quiescent, so it is not automated here.
     * RAMP_Daily is in FULL recovery: the rewrites grow the transaction log
       substantially. Take a log backup / verify log space first. Run
       `--status` to see current log headroom.
     * Re-running --apply is a no-op: every step is guarded, and already-sized
       columns generate no statements.
     * Nothing here changes a value. The preflight refuses to run if any existing
       value would be truncated.
     * Next step if more speed is ever needed: a clustered columnstore index on
       personnel_performance, or a nightly aggregate table. Not done here.
   ========================================================================== */

SET NOCOUNT ON;

/* @section:preflight ------------------------------------------------------- */

PRINT '--- preflight: value lengths vs. target column sizes';

DECLARE @bad TABLE (tbl SYSNAME, col SYSNAME, maxLen INT, target INT);

INSERT INTO @bad (tbl, col, maxLen, target)
SELECT 'personnel_performance', v.col, v.maxLen, v.target
FROM (
  SELECT 'Start_Date' col,        MAX(LEN(Start_Date))        maxLen, 10  target FROM personnel_performance
  UNION ALL SELECT 'End_Date',             MAX(LEN(End_Date)),             10  FROM personnel_performance
  UNION ALL SELECT 'CreatedAtPersian',     MAX(LEN(CreatedAtPersian)),     10  FROM personnel_performance
  UNION ALL SELECT 'NationalCode',         MAX(LEN(NationalCode)),         20  FROM personnel_performance
  UNION ALL SELECT 'CityName',             MAX(LEN(CityName)),             50  FROM personnel_performance
  UNION ALL SELECT 'NameFamily',           MAX(LEN(NameFamily)),           200 FROM personnel_performance
  UNION ALL SELECT 'TownName',             MAX(LEN(TownName)),             200 FROM personnel_performance
  UNION ALL SELECT 'BranchCode',           MAX(LEN(BranchCode)),           100 FROM personnel_performance
  UNION ALL SELECT 'BranchName',           MAX(LEN(BranchName)),           600 FROM personnel_performance
  UNION ALL SELECT 'BranchType',           MAX(LEN(BranchType)),           100 FROM personnel_performance
) v;

INSERT INTO @bad (tbl, col, maxLen, target)
SELECT 'users_info', v.col, v.maxLen, v.target
FROM (
  SELECT 'NationalCode' col,       MAX(LEN(NationalCode))       maxLen, 20  target FROM users_info
  UNION ALL SELECT 'PersonnelCode',       MAX(LEN(PersonnelCode)),       50  FROM users_info
  UNION ALL SELECT 'ProjectType',         MAX(LEN(ProjectType)),         100 FROM users_info
  UNION ALL SELECT 'Role',                MAX(LEN(Role)),                200 FROM users_info
  UNION ALL SELECT 'RoleType',            MAX(LEN(RoleType)),            100 FROM users_info
  UNION ALL SELECT 'ContractType',        MAX(LEN(ContractType)),        100 FROM users_info
  UNION ALL SELECT 'DateInfo',            MAX(LEN(DateInfo)),            20  FROM users_info
  UNION ALL SELECT 'PhoneNumber',         MAX(LEN(PhoneNumber)),         30  FROM users_info
  UNION ALL SELECT 'ContractStartDate',   MAX(LEN(ContractStartDate)),   20  FROM users_info
  UNION ALL SELECT 'ContractEndDate',     MAX(LEN(ContractEndDate)),     20  FROM users_info
  UNION ALL SELECT 'TotalPresence',       MAX(LEN(TotalPresence)),       50  FROM users_info
  UNION ALL SELECT 'ChargedPresence',     MAX(LEN(ChargedPresence)),     50  FROM users_info
  UNION ALL SELECT 'OverTimeHour',        MAX(LEN(OverTimeHour)),        50  FROM users_info
) v;

INSERT INTO @bad (tbl, col, maxLen, target)
SELECT 'users', v.col, v.maxLen, v.target
FROM (
  SELECT 'NationalCode' col, MAX(LEN(NationalCode)) maxLen, 20 target FROM users
  UNION ALL SELECT 'CityName',     MAX(LEN(CityName)),     50  FROM users
  UNION ALL SELECT 'NameFamily',   MAX(LEN(NameFamily)),   200 FROM users
) v;

INSERT INTO @bad (tbl, col, maxLen, target)
SELECT 'depos', v.col, v.maxLen, v.target
FROM (
  SELECT 'Start_Date' col,   MAX(LEN(Start_Date))   maxLen, 10  target FROM depos
  UNION ALL SELECT 'End_Date',       MAX(LEN(End_Date)),        10  FROM depos
  UNION ALL SELECT 'CreatedAtPersian', MAX(LEN(CreatedAtPersian)), 10 FROM depos
  UNION ALL SELECT 'CityName',       MAX(LEN(CityName)),        50  FROM depos
  UNION ALL SELECT 'ServiceName',    MAX(LEN(ServiceName)),     100 FROM depos
  UNION ALL SELECT 'BillType',       MAX(LEN(BillType)),        50  FROM depos
) v;

DELETE FROM @bad WHERE maxLen IS NULL OR maxLen <= target;

IF EXISTS (SELECT 1 FROM @bad)
BEGIN
  DECLARE @detail NVARCHAR(MAX) = N'';
  SELECT @detail = @detail + N'  ' + tbl + N'.' + col + N' max LEN='
    + CAST(maxLen AS NVARCHAR(10)) + N' > target ' + CAST(target AS NVARCHAR(10)) + NCHAR(10)
  FROM @bad ORDER BY tbl, col;
  PRINT @detail;
  THROW 50001, N'Preflight failed: values would be truncated. Raise the target sizes above, then re-run.', 1;
END

-- ALTER COLUMN is blocked on columns an index depends on. Only MAX columns are
-- being narrowed, so restricting the check to max_length = -1 keeps this guard
-- correct on the second run (when the new indexes already exist).
IF EXISTS (
  SELECT 1
  FROM sys.index_columns ic
  JOIN sys.tables t  ON t.object_id = ic.object_id
  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
  JOIN sys.types ty  ON ty.user_type_id = c.user_type_id
  WHERE t.name IN ('personnel_performance', 'users_info', 'users', 'depos')
    AND ty.name = 'nvarchar'
    AND c.max_length = -1
)
BEGIN
  THROW 50002, N'Preflight failed: an NVARCHAR(MAX) column on a target table is already indexed. Drop that index first.', 1;
END

PRINT '    preflight OK';

/* @section:end ------------------------------------------------------------ */

/* ---------------------------------------------------------------------------
   1. Narrow the string columns (idempotent)
   ------------------------------------------------------------------------- */

PRINT '--- narrowing NVARCHAR(MAX) columns';

DECLARE @sql NVARCHAR(MAX) = N'';

-- Only emits ALTER COLUMN for columns still typed NVARCHAR(MAX), so re-runs
-- generate no statements at all.
;WITH targets AS (
  SELECT 'personnel_performance' AS tbl, 'Start_Date' AS col, 10 AS len UNION ALL
  SELECT 'personnel_performance', 'End_Date', 10 UNION ALL
  SELECT 'personnel_performance', 'CreatedAtPersian', 10 UNION ALL
  SELECT 'personnel_performance', 'NationalCode', 20 UNION ALL
  SELECT 'personnel_performance', 'CityName', 50 UNION ALL
  SELECT 'personnel_performance', 'NameFamily', 200 UNION ALL
  SELECT 'personnel_performance', 'TownName', 200 UNION ALL
  SELECT 'personnel_performance', 'BranchCode', 100 UNION ALL
  SELECT 'personnel_performance', 'BranchName', 600 UNION ALL
  SELECT 'personnel_performance', 'BranchType', 100 UNION ALL
  SELECT 'users_info', 'NationalCode', 20 UNION ALL
  SELECT 'users_info', 'PersonnelCode', 50 UNION ALL
  SELECT 'users_info', 'ProjectType', 100 UNION ALL
  SELECT 'users_info', 'Role', 200 UNION ALL
  SELECT 'users_info', 'RoleType', 100 UNION ALL
  SELECT 'users_info', 'ContractType', 100 UNION ALL
  SELECT 'users_info', 'DateInfo', 20 UNION ALL
  SELECT 'users_info', 'PhoneNumber', 30 UNION ALL
  SELECT 'users_info', 'ContractStartDate', 20 UNION ALL
  SELECT 'users_info', 'ContractEndDate', 20 UNION ALL
  SELECT 'users_info', 'TotalPresence', 50 UNION ALL
  SELECT 'users_info', 'ChargedPresence', 50 UNION ALL
  SELECT 'users_info', 'OverTimeHour', 50 UNION ALL
  SELECT 'users', 'NationalCode', 20 UNION ALL
  SELECT 'users', 'CityName', 50 UNION ALL
  SELECT 'users', 'NameFamily', 200 UNION ALL
  SELECT 'depos', 'Start_Date', 10 UNION ALL
  SELECT 'depos', 'End_Date', 10 UNION ALL
  SELECT 'depos', 'CreatedAtPersian', 10 UNION ALL
  SELECT 'depos', 'CityName', 50 UNION ALL
  SELECT 'depos', 'ServiceName', 100 UNION ALL
  SELECT 'depos', 'BillType', 50
)
SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(t.name) + N' ALTER COLUMN '
  + QUOTENAME(c.name) + N' NVARCHAR(' + CAST(tg.len AS NVARCHAR(10)) + N') '
  + CASE WHEN c.is_nullable = 1 THEN N'NULL' ELSE N'NOT NULL' END + N';' + NCHAR(10)
FROM targets tg
JOIN sys.tables  t  ON t.name = tg.tbl
JOIN sys.columns c  ON c.object_id = t.object_id AND c.name = tg.col
JOIN sys.types   ty ON ty.user_type_id = c.user_type_id
WHERE ty.name = 'nvarchar' AND c.max_length = -1;

IF @sql = N''
  PRINT '    nothing to narrow (already sized)';
ELSE
BEGIN
  DECLARE @count INT = (LEN(@sql) - LEN(REPLACE(@sql, N'ALTER TABLE', N'')))
                       / LEN(N'ALTER TABLE');
  PRINT '    applying ' + CAST(@count AS NVARCHAR(10)) + ' ALTER COLUMN statement(s)';
  EXEC sys.sp_executesql @sql;
  PRINT '    columns narrowed';
END

/* ---------------------------------------------------------------------------
   2. Covering indexes (idempotent)

   Key order is (CityName, Start_Date) so a monthly multi-city query is an
   equality seek on CityName followed by a range seek on Start_Date. With no
   city filter the same index still serves as a narrow, compressed scan, which
   is far cheaper than scanning the heap.
   ------------------------------------------------------------------------- */

PRINT '--- creating covering indexes';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_pp_City_StartDate' AND object_id = OBJECT_ID('personnel_performance'))
BEGIN
  PRINT '    IX_pp_City_StartDate';
  CREATE NONCLUSTERED INDEX IX_pp_City_StartDate
    ON personnel_performance (CityName, Start_Date)
    INCLUDE (
      NationalCode, NameFamily, TownName, BranchCode, BranchName, BranchType,
      HasTheDayOff, DirectPerFormance, IndirectPerFormance, TotalPerformance,
      SabtAvalieAsnad, PazireshVaSabtAvalieAsnad,
      ArzyabiAsanadBimarsetaniDirect, ArzyabiAsnadBimarestaniIndirect,
      ArzyabiAsnadDandanVaParaDirect, ArzyabiAsnadDandanVaParaIndirect,
      ArzyabiAsnadDandanDirect, ArzyabiAsnadDandanIndirect,
      ArzyabiAsnadDaroDirect, ArzyabiAsnadDaroIndirect,
      WithScanCount, WithoutScanCount, WithoutScanInDirectCount,
      ArchiveDirectCount, ArchiveInDirectCount,
      ArzyabiVisitDirectCount, ArzyabiVisitInDirectCount
    )
    WITH (DATA_COMPRESSION = PAGE, ONLINE = ON);
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ui_NationalCode_DateInfo' AND object_id = OBJECT_ID('users_info'))
BEGIN
  PRINT '    IX_ui_NationalCode_DateInfo';
  CREATE NONCLUSTERED INDEX IX_ui_NationalCode_DateInfo
    ON users_info (NationalCode, DateInfo DESC)
    INCLUDE (PersonnelCode, ProjectType, ContractType, Role, RoleType)
    WITH (DATA_COMPRESSION = PAGE, ONLINE = ON);
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_NationalCode' AND object_id = OBJECT_ID('users'))
BEGIN
  PRINT '    IX_users_NationalCode';
  CREATE NONCLUSTERED INDEX IX_users_NationalCode
    ON users (NationalCode)
    INCLUDE (CityName, NameFamily)
    WITH (DATA_COMPRESSION = PAGE, ONLINE = ON);
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_depos_City_StartDate' AND object_id = OBJECT_ID('depos'))
BEGIN
  PRINT '    IX_depos_City_StartDate';
  CREATE NONCLUSTERED INDEX IX_depos_City_StartDate
    ON depos (CityName, Start_Date)
    INCLUDE (ServiceName, BillType, CaseType, DepoCount, EntryCount, Capicity)
    WITH (DATA_COMPRESSION = PAGE, ONLINE = ON);
END

PRINT '    indexes ready';

/* ---------------------------------------------------------------------------
   3. Postflight: load statistics so the optimizer actually picks the new
      indexes instead of falling back to a heap scan.
   ------------------------------------------------------------------------- */

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_pp_City_StartDate' AND object_id = OBJECT_ID('personnel_performance'))
BEGIN
  PRINT '--- updating statistics on index key columns';
  UPDATE STATISTICS personnel_performance IX_pp_City_StartDate WITH FULLSCAN;
  UPDATE STATISTICS users_info            IX_ui_NationalCode_DateInfo WITH FULLSCAN;
  UPDATE STATISTICS users                IX_users_NationalCode WITH FULLSCAN;
  UPDATE STATISTICS depos                IX_depos_City_StartDate WITH FULLSCAN;
END

PRINT '--- done';
