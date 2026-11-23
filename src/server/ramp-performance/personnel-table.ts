/**
 * Server-side port of the v1 browser pipeline for the personnel-performance
 * table.
 *
 * v1 shipped every daily row to the browser and did this in JavaScript:
 *
 *   1. join users_info  (fan-out: one performance row × N role rows)
 *   2. dedupePersonnelPerformanceRows   (PERSONNEL_PERFORMANCE_DEDUPE_BY)
 *   3. aggregate by (NationalCode, NameFamily, CityName), counting rows
 *   4. calculate direct/indirect performance from Indicators
 *   5. filterOutZeroPerformanceRows
 *   6. sort, then render every row
 *
 * Steps 1–6 are ported to one SQL pipeline here, so step 6 can be paginated and
 * the browser only ever receives one page. The dedupe in step 2 becomes a
 * `ROW_NUMBER()` **before** aggregation, which is what removes the fan-out — in
 * v1 the fan-out happened first and was repaired afterwards.
 *
 * `rowCount` is deliberately kept identical to v1's `key.rowCount` (the deduped
 * daily-row count) because it is the divisor for the percentage maths.
 */
import { sql, type RawBuilder } from "kysely";

import { getRampDb } from "~/server/db/ramp-kysely";
import {
  PERFORMANCE_MEASURE_COLUMNS,
  type PerformanceMeasureColumn,
} from "~/server/db/ramp-schema";
import type {
  ExportQuery,
  FilterQuery,
  PersonnelTableResponse,
  PersonnelTableRow,
  TableQuery,
} from "./params";
import {
  dateRangePredicate,
  isSortableColumn,
  performanceExpressions,
  ppDedupePartition,
  startDateRanges,
} from "./sql-expressions";
import { resolveCityFilter } from "./permissions";

/** Sort keys that are aliases on the aggregate, not raw columns. */
const SORT_ALIASES: Record<string, string> = {
  NameFamily: "NameFamily",
  CityName: "CityName",
  NationalCode: "NationalCode",
  PersonnelCode: "PersonnelCode",
  Role: "Role",
  RoleType: "RoleType",
  ContractType: "ContractType",
  ProjectType: "ProjectType",
  DateInfo: "DateInfo",
  TotalPerformance: "TotalPerformance",
  DirectPerFormance: "DirectPerFormance",
  InDirectPerFormance: "InDirectPerFormance",
};

/** Aggregate alias for a measure column (`sum_<Column>` in the CTE). */
function measureAlias(column: PerformanceMeasureColumn): string {
  return `sum_${column}`;
}

/**
 * `users_info` narrowed to one row per NationalCode.
 *
 * v1 joined every role row and then deduped by performance identity, which kept
 * *whichever* role row SQL returned first — effectively arbitrary. Picking the
 * newest `DateInfo` (ties broken by `Id`) is deterministic and matches the row
 * the UI showed in practice. Role/contract filters must be applied *inside* this
 * subquery: filtering after the dedupe would drop people whose newest role does
 * not match, whereas v1 filtered the whole set of role rows.
 */
function usersInfoCte(filters: RawBuilder<unknown>): RawBuilder<unknown> {
  return sql`
    SELECT NationalCode, PersonnelCode, ProjectType, ContractType,
           Role, RoleType, DateInfo
    FROM (
      SELECT ui.NationalCode, ui.PersonnelCode, ui.ProjectType,
             ui.ContractType, ui.Role, ui.RoleType, ui.DateInfo,
             ROW_NUMBER() OVER (
               PARTITION BY ui.NationalCode
               ORDER BY ui.DateInfo DESC, ui.Id DESC
             ) AS rn
      FROM users_info AS ui
      ${filters}
    ) AS ranked
    WHERE ranked.rn = 1
  `;
}

/**
 * Filter predicate for `users_info`, mirroring `USERS_INFO_WHERE_COLUMNS`.
 * `DateInfo` is applied here because it describes the roster snapshot, exactly
 * as v1 applied it to the joined row.
 */
function usersInfoFilters(filters: FilterQuery): RawBuilder<unknown> {
  const conditions: RawBuilder<unknown>[] = [];

  const inList = (
    column: string,
    values: string[] | undefined,
  ): RawBuilder<unknown> | null =>
    values?.length
      ? sql`${sql.ref(`ui.${column}`)} IN (${sql.join(values.map((v) => sql`${v}`), sql`, `)})`
      : null;

  for (const [column, values] of [
    ["ProjectType", filters.projectTypes],
    ["ContractType", filters.contractTypes],
    ["Role", filters.roles],
    ["RoleType", filters.roleTypes],
    ["DateInfo", filters.dateInfos],
  ] as const) {
    const condition = inList(column, values);
    if (condition) conditions.push(condition);
  }

  return conditions.length
    ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
    : sql``;
}

/** Filters applied directly to `personnel_performance` (`p.*`). */
function performanceFilters(
  filters: FilterQuery,
  allowedCities: string[],
): RawBuilder<unknown> {
  const conditions: RawBuilder<unknown>[] = [
    sql`p.CityName IS NOT NULL`,
    sql`p.HasTheDayOff = 0`,
  ];

  const ranges = startDateRanges(filters.periodType, filters.dates ?? []);
  conditions.push(dateRangePredicate(ranges, "p.Start_Date"));

  if (allowedCities.length) {
    conditions.push(
      sql`p.CityName IN (${sql.join(allowedCities.map((c) => sql`${c}`), sql`, `)})`,
    );
  }

  const inList = (
    column: string,
    values: string[] | undefined,
  ): RawBuilder<unknown> | null =>
    values?.length
      ? sql`${sql.ref(`p.${column}`)} IN (${sql.join(values.map((v) => sql`${v}`), sql`, `)})`
      : null;

  for (const [column, values] of [
    ["TownName", filters.towns],
    ["BranchCode", filters.branchCodes],
    ["BranchName", filters.branchNames],
    ["BranchType", filters.branchTypes],
  ] as const) {
    const condition = inList(column, values);
    if (condition) conditions.push(condition);
  }

  return sql`WHERE ${sql.join(conditions, sql` AND `)}`;
}

/**
 * The `WITH` block shared by the table, summary and export queries.
 *
 * `agg` is one row per (NationalCode, CityName, NameFamily) with every measure
 * summed and `rowCount` set to the deduped daily-row count. `RealCityName` comes
 * from the `users` CROSS APPLY (TOP 1), matching `USERS_REAL_CITY_JOIN`.
 */
function aggregationCte(
  filters: FilterQuery,
  allowedCities: string[],
): RawBuilder<unknown> {
  const measureSums = PERFORMANCE_MEASURE_COLUMNS.map(
    (column) => sql`SUM(d.${sql.ref(column)}) AS ${sql.ref(measureAlias(column))}`,
  );

  const storedSums = [
    sql`SUM(d.DirectPerFormance) AS ${sql.ref("sum_DirectPerFormance")}`,
    sql`SUM(d.IndirectPerFormance) AS ${sql.ref("sum_IndirectPerFormance")}`,
    sql`SUM(d.TotalPerformance) AS ${sql.ref("sum_TotalPerformance")}`,
  ];

  return sql`
    ;WITH ui AS (
      ${usersInfoCte(usersInfoFilters(filters))}
    ),
    filtered AS (
      SELECT p.NationalCode, p.CityName, p.NameFamily, p.Start_Date,
             p.TownName, p.BranchCode, p.BranchName, p.BranchType,
             p.HasTheDayOff,
             ${sql.join(
               PERFORMANCE_MEASURE_COLUMNS.map((column) => sql.ref(`p.${column}`)),
               sql`, `,
             )},
             p.DirectPerFormance, p.IndirectPerFormance, p.TotalPerformance
      FROM personnel_performance AS p
      ${performanceFilters(filters, allowedCities)}
    ),
    deduped AS (
      SELECT filtered.*,
             ROW_NUMBER() OVER (
               PARTITION BY ${ppDedupePartition("filtered")}
               ORDER BY filtered.Start_Date DESC
             ) AS rn
      FROM filtered
    ),
    agg AS (
      SELECT d.NationalCode,
             d.CityName,
             MAX(d.NameFamily) AS NameFamily,
             COUNT(*) AS dayCount,
             ${sql.join([...measureSums, ...storedSums], sql`, `)}
      FROM deduped AS d
      WHERE d.rn = 1
      GROUP BY d.NationalCode, d.CityName
    )
  `;
}

/** Join `agg` to the deduped roster and compute the performance expressions. */
export function personLevelCte(
  filters: FilterQuery,
  allowedCities: string[],
  workDays: number | null,
): RawBuilder<unknown> {
  const performance = performanceExpressionSet(workDays);

  // Note: no leading semicolon and no trailing `joined` select — callers append
  // their own `SELECT … FROM joined` so one CTE definition serves table,
  // summary, options and export without drifting apart.
  return sql`
    ${aggregationCte(filters, allowedCities)},
    joined AS (
      SELECT agg.NationalCode, agg.NameFamily, agg.CityName,
             realuser.CityName AS RealCityName,
             ui.PersonnelCode, ui.Role, ui.RoleType, ui.ContractType,
             ui.ProjectType, ui.DateInfo,
             agg.dayCount,
             ${sql.join(
               PERFORMANCE_MEASURE_COLUMNS.map(
                 (column) => sql`COALESCE(agg.${sql.ref(measureAlias(column))}, 0) AS ${sql.ref(column)}`,
               ),
               sql`, `,
             )},
             realuser.NameFamily AS RosterNameFamily,
             ${performance.DirectPerFormance} AS DirectPerFormance,
             ${performance.InDirectPerFormance} AS InDirectPerFormance,
             ${performance.TotalPerformance} AS TotalPerformance
      FROM agg
      JOIN ui ON ui.NationalCode = agg.NationalCode
      OUTER APPLY (
        SELECT TOP 1 realusr.CityName, realusr.NameFamily
        FROM users AS realusr
        WHERE realusr.NationalCode = agg.NationalCode
      ) AS realuser
    )
  `;
}

/**
 * Divisor + the three performance expressions, shared by the CTE and anything
 * that needs to recompute them (e.g. the summary averaging directly over `agg`).
 */
export function performanceExpressionSet(workDays: number | null) {
  // Divisor: work days when the toggle is on, otherwise the deduped row count
  // (v1's `key.rowCount`, applied per (NationalCode, CityName) group).
  const divisor = workDays ? sql`${workDays}` : sql`NULLIF(agg.dayCount, 0)`;
  return performanceExpressions(divisor, "agg");
}

/**
 * `filterOutZeroPerformanceRows` — compare the two-decimal value the UI shows so
 * floating-point noise (0.001) does not leave a row reading "0.00".
 */
const ZERO_PERFORMANCE_PREDICATE = sql`ROUND(j.TotalPerformance, 2) <> 0`;

/** Free-text search across the columns the v1 UI searches. */
function searchPredicate(q: string | undefined): RawBuilder<unknown> | null {
  if (!q) return null;
  const like = `%${q}%`;
  return sql`(
    j.NameFamily LIKE ${like}
    OR j.NationalCode LIKE ${like}
    OR j.PersonnelCode LIKE ${like}
    OR j.CityName LIKE ${like}
  )`;
}

function buildWhere(
  filters: FilterQuery,
  q: string | undefined,
): RawBuilder<unknown> {
  const conditions: RawBuilder<unknown>[] = [];
  if (!filters.includeZeroPerformance) conditions.push(ZERO_PERFORMANCE_PREDICATE);
  const search = searchPredicate(q);
  if (search) conditions.push(search);
  return conditions.length
    ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
    : sql``;
}

function orderBy(sort: string | undefined, dir: "asc" | "desc"): RawBuilder<unknown> {
  const column = sort && isSortableColumn(sort) ? (SORT_ALIASES[sort] ?? sort) : null;
  const direction = dir === "desc" ? sql`DESC` : sql`ASC`;

  if (!column) {
    return sql`ORDER BY j.CityName ASC, j.NameFamily ASC`;
  }

  // Stable tiebreak so pagination never repeats or skips a row.
  return sql`ORDER BY j.${sql.ref(column)} ${direction}, j.NationalCode ASC, j.CityName ASC`;
}

/** Per-city distinct worked days — v1's `dateLength`, used by the chart maths. */
export async function fetchDateLengthPerCity(
  filters: FilterQuery,
  allowedCities: string[],
): Promise<Record<string, number>> {
  const ranges = startDateRanges(filters.periodType, filters.dates ?? []);
  if (!ranges.length) return {};

  const query = sql<{ CityName: string; days: number }>`
    SELECT p.CityName, COUNT(DISTINCT p.Start_Date) AS days
    FROM personnel_performance AS p
    WHERE p.CityName IS NOT NULL
      AND p.HasTheDayOff = 0
      AND ${dateRangePredicate(ranges, "p.Start_Date")}
      ${allowedCities.length
        ? sql`AND p.CityName IN (${sql.join(allowedCities.map((c) => sql`${c}`), sql`, `)})`
        : sql``}
    GROUP BY p.CityName
  `;

  const result = await execute<{ CityName: string; days: number }>(query);
  return Object.fromEntries(
    result.rows.map((row) => [row.CityName, Number(row.days)]),
  );
}

/**
 * One page of the table plus the total count, in a single round trip
 * (`COUNT(*) OVER ()` rides along with the page).
 */
export async function getPersonnelTable(
  query: TableQuery,
  permittedCities: string[],
  workDays: number | null,

): Promise<PersonnelTableResponse> {
  const allowedCities = resolveCityFilter(query.cities, permittedCities);

  // Requested cities that are all outside the caller's scope: return empty
  // rather than silently widening to the whole scope.
  if (query.cities?.length && !allowedCities.length) {
    return { rows: [], total: 0, page: query.page, pageSize: query.pageSize, workDays, dateLength: {} };
  }

  const offset = (query.page - 1) * query.pageSize;
  const where = buildWhere(query, query.q);

  const pageQuery = sql`
    ${personLevelCte(query, allowedCities, workDays)}
    SELECT
      j.NationalCode,
      COALESCE(NULLIF(j.NameFamily, ''), j.RosterNameFamily) AS NameFamily,
      j.CityName,
      j.RealCityName,
      j.PersonnelCode,
      j.Role,
      j.RoleType,
      j.ContractType,
      j.ProjectType,
      j.DateInfo,
      j.dayCount,
      ${sql.join(
        PERFORMANCE_MEASURE_COLUMNS.map((column) => sql`j.${sql.ref(column)}`),
        sql`, `,
      )},
      j.DirectPerFormance,
      j.InDirectPerFormance,
      j.TotalPerformance,
      COUNT(*) OVER () AS __total
    FROM joined AS j
    ${where}
    ${orderBy(query.sort, query.dir)}
    OFFSET ${offset} ROWS FETCH NEXT ${query.pageSize} ROWS ONLY
  `;

  const result = await execute(pageQuery);
  const rows = result.rows as (RawPersonnelRow & { __total: number })[];
  const total = rows.length ? Number(rows[0]!.__total) : 0;

  return {
    rows: rows.map(({ __total, ...row }) => normalizeRow(row)),
    total,
    page: query.page,
    pageSize: query.pageSize,
    workDays,
    dateLength: await fetchDateLengthPerCity(query, allowedCities),
  };
}

/**
 * Every filtered row for CSV export, walked in server-side pages.
 *
 * Kysely v0.28 does not expose a row cursor, so export pages with OFFSET/FETCH
 * and the route writes each batch out immediately. Memory stays bounded at one
 * page instead of the whole result set, and the export no longer depends on what
 * the browser happens to have loaded.
 */
export async function* iteratePersonnelRows(
  query: ExportQuery,
  permittedCities: string[],
  workDays: number | null,
): AsyncGenerator<PersonnelTableRow> {
  const allowedCities = resolveCityFilter(query.cities, permittedCities);
  if (query.cities?.length && !allowedCities.length) return;

  const pageSize = 1000;
  // The CTE is identical for every page, but SQL Server re-runs it; export is an
  // explicit user action, so a few hundred ms per 1K rows is acceptable.
  for (let page = 1; ; page += 1) {
    const offset = (page - 1) * pageSize;

    const pageQuery = sql`
      ${personLevelCte(query, allowedCities, workDays)}
      SELECT
        j.NationalCode,
        COALESCE(NULLIF(j.NameFamily, ''), j.RosterNameFamily) AS NameFamily,
        j.CityName,
        j.RealCityName,
        j.PersonnelCode,
        j.Role,
        j.RoleType,
        j.ContractType,
        j.ProjectType,
        j.DateInfo,
        j.dayCount,
        ${sql.join(
          PERFORMANCE_MEASURE_COLUMNS.map((column) => sql`j.${sql.ref(column)}`),
          sql`, `,
        )},
        j.DirectPerFormance,
        j.InDirectPerFormance,
        j.TotalPerformance
      FROM joined AS j
      ${buildWhere(query, query.q)}
      ${orderBy(query.sort, query.dir)}
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;

    const { rows } = await execute<RawPersonnelRow>(pageQuery);
    if (!rows.length) return;

    for (const row of rows) yield normalizeRow(row);

    if (rows.length < pageSize) return;
  }
}

/**
 * Shape returned by the SQL before normalisation.
 *
 * The day-count column is aliased `dayCount` (not `rowCount`) because
 * `ROWCOUNT` is a reserved T-SQL keyword — `SET ROWCOUNT` — and an unquoted
 * alias makes the whole batch fail to parse. The API-facing name stays
 * `rowCount` via {@link normalizeRow}.
 */
export type RawPersonnelRow = Omit<PersonnelTableRow, "rowCount"> & { dayCount: number };

function normalizeRow(row: RawPersonnelRow): PersonnelTableRow {
  const normalized: Record<string, unknown> = { ...row };

  for (const column of PERFORMANCE_MEASURE_COLUMNS) {
    normalized[column] = Number(normalized[column] ?? 0);
  }

  normalized.rowCount = Number(row.dayCount ?? 0);
  normalized.DirectPerFormance = Number(row.DirectPerFormance ?? 0);
  normalized.InDirectPerFormance = Number(row.InDirectPerFormance ?? 0);
  normalized.TotalPerformance = Number(row.TotalPerformance ?? 0);
  normalized.HasTheDayOff = Boolean(row.HasTheDayOff);

  return normalized as PersonnelTableRow;
}

/**
 * Run a compiled multi-statement batch and return the flattened rows.
 *
 * Kysely v0.28's `executeQuery` accepts a `QueryId`, not an `AbortSignal`, so
 * cancellation is handled where it is actually effective: `tedious` cancels the
 * server-side request when the HTTP client disconnects (the route's
 * `request.signal` triggers stream teardown, which closes the connection).
 */
async function execute<T>(query: RawBuilder<unknown>): Promise<{ rows: T[] }> {
  const compiled = query.compile(getRampDb());
  const result = await getRampDb().executeQuery<T>({
    sql: compiled.sql,
    parameters: compiled.parameters,
    query: compiled.query,
  } as never);
  return { rows: result.rows };
}
