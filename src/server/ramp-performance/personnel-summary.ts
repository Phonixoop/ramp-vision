/**
 * Footer / KPI aggregates computed over the **full** filtered set.
 *
 * This is the piece that makes server-side pagination honest: the page shows 50
 * rows, but the footer, average performance, role breakdown and city breakdown
 * all describe every matching row. It reuses the exact `joined` CTE from
 * `personnel-table.ts`, so the numbers cannot drift from the table.
 */
import { sql, type RawBuilder } from "kysely";

import { getRampDb } from "~/server/db/ramp-kysely";
import { batchTag, executeBatch, splitByTag } from "~/server/db/ramp-batch";
import { PERFORMANCE_MEASURE_COLUMNS } from "~/server/db/ramp-schema";
import type { FilterQuery, PersonnelSummaryResponse } from "./params";
import { resolveCityFilter } from "./permissions";
import { personLevelCte } from "./personnel-table";

/** Rows must be filtered identically to the table or the footer lies. */
const ZERO_FILTER = sql`ROUND(j.TotalPerformance, 2) <> 0`;

export async function getPersonnelSummary(
  filters: FilterQuery,
  permittedCities: string[],
  workDays: number | null,

): Promise<PersonnelSummaryResponse> {
  const allowedCities = resolveCityFilter(filters.cities, permittedCities);

  if (filters.cities?.length && !allowedCities.length) {
    return emptySummary();
  }

  const where = filters.includeZeroPerformance ? sql`` : sql`WHERE ${ZERO_FILTER}`;

  // Three independent aggregates share one CTE and one round trip. Each result
  // set is read positionally, which is why they are issued in a fixed order.
  // Three independent aggregates share one CTE and one round trip. Kysely's
  // MSSQL driver flattens every recordset into one `rows` array, so each
  // statement tags its rows with `__set` and we partition instead of relying on
  // recordset boundaries.
  const query = sql`
    ${personLevelCte(filters, allowedCities, workDays)}
    SELECT TOP 1
      ${batchTag("totals")},
      COUNT(*) AS total,
      ${sql.join(
        PERFORMANCE_MEASURE_COLUMNS.map(
          (column) => sql`COALESCE(SUM(j.${sql.ref(column)}), 0) AS ${sql.ref(column)}`,
        ),
        sql`, `,
      )},
      COALESCE(AVG(j.DirectPerFormance), 0) AS avg_DirectPerFormance,
      COALESCE(AVG(j.InDirectPerFormance), 0) AS avg_InDirectPerFormance,
      COALESCE(AVG(j.TotalPerformance), 0) AS avg_TotalPerformance
    FROM joined AS j
    ${where};

    ${personLevelCte(filters, allowedCities, workDays)}
    SELECT TOP 30
      ${batchTag("role")},
      COALESCE(NULLIF(j.Role, ''), N'نامشخص') AS Role,
      COUNT(*) AS count,
      COALESCE(AVG(j.TotalPerformance), 0) AS TotalPerformance
    FROM joined AS j
    ${where}
    GROUP BY COALESCE(NULLIF(j.Role, ''), N'نامشخص')
    ORDER BY COUNT(*) DESC;

    ${personLevelCte(filters, allowedCities, workDays)}
    SELECT TOP 60
      ${batchTag("city")},
      j.CityName,
      COUNT(*) AS count,
      COALESCE(AVG(j.TotalPerformance), 0) AS TotalPerformance
    FROM joined AS j
    ${where}
    GROUP BY j.CityName
    ORDER BY COUNT(*) DESC;
  `;

  const sets = splitByTag(await executeBatch<Record<string, unknown>>(query));
  const totals = sets.totals ?? [];
  const byRole = sets.role ?? [];
  const byCity = sets.city ?? [];

  const summary = totals[0] ?? {};
  const numericTotals: Record<string, number> = {};
  for (const column of PERFORMANCE_MEASURE_COLUMNS) {
    numericTotals[column] = Number(summary[column] ?? 0);
  }

  return {
    total: Number(summary.total ?? 0),
    totals: numericTotals,
    average: {
      TotalPerformance: Number(summary.avg_TotalPerformance ?? 0),
      DirectPerFormance: Number(summary.avg_DirectPerFormance ?? 0),
      InDirectPerFormance: Number(summary.avg_InDirectPerFormance ?? 0),
    },
    byRole: byRole.map((row) => ({
      Role: String(row.Role ?? ""),
      count: Number(row.count ?? 0),
      TotalPerformance: Number(row.TotalPerformance ?? 0),
    })),
    byCity: byCity.map((row) => ({
      CityName: String(row.CityName ?? ""),
      count: Number(row.count ?? 0),
      TotalPerformance: Number(row.TotalPerformance ?? 0),
    })),
  };
}

function emptySummary(): PersonnelSummaryResponse {
  const totals: Record<string, number> = {};
  for (const column of PERFORMANCE_MEASURE_COLUMNS) totals[column] = 0;

  return {
    total: 0,
    totals,
    average: { TotalPerformance: 0, DirectPerFormance: 0, InDirectPerFormance: 0 },
    byRole: [],
    byCity: [],
  };
}

/**
 * Facet values for the filter popovers.
 *
 * Every list is clipped to the caller's city scope and, for the personnel-ish
 * lists, to the active `DateInfo` snapshot — otherwise the dropdowns would offer
 * values that can only ever produce an empty table.
 */
export async function getPersonnelOptions(
  filters: FilterQuery,
  permittedCities: string[],

): Promise<{
  cities: string[];
  projectTypes: string[];
  contractTypes: string[];
  roles: string[];
  roleTypes: string[];
  dateInfos: string[];
  towns: string[];
  branchCodes: string[];
  branchNames: string[];
  branchTypes: string[];
}> {
  const allowedCities = resolveCityFilter(filters.cities, permittedCities);

  const cityList = allowedCities.length
    ? sql`AND p.CityName IN (${sql.join(allowedCities.map((c) => sql`${c}`), sql`, `)})`
    : sql``;

  const dateInfoFilter = filters.dateInfos?.length
    ? sql`WHERE ui.DateInfo IN (${sql.join(filters.dateInfos.map((v) => sql`${v}`), sql`, `)})`
    : sql``;

  const query = sql`
    SELECT DISTINCT ${batchTag("city")}, CityName FROM personnel_performance AS p
    WHERE p.CityName IS NOT NULL AND p.CityName <> '' ${cityList}
    ORDER BY CityName;

    SELECT DISTINCT ${batchTag("projectType")}, ProjectType FROM users_info AS ui
    ${dateInfoFilter}
    ${filters.dateInfos?.length ? sql`AND` : sql`WHERE`} ui.ProjectType IS NOT NULL AND ui.ProjectType <> ''
    ORDER BY ProjectType;

    SELECT DISTINCT ${batchTag("contractType")}, ContractType FROM users_info AS ui
    ${dateInfoFilter}
    ${filters.dateInfos?.length ? sql`AND` : sql`WHERE`} ui.ContractType IS NOT NULL AND ui.ContractType <> ''
    ORDER BY ContractType;

    SELECT DISTINCT ${batchTag("role")}, Role FROM users_info AS ui
    ${dateInfoFilter}
    ${filters.dateInfos?.length ? sql`AND` : sql`WHERE`} ui.Role IS NOT NULL AND ui.Role <> ''
    ORDER BY Role;

    SELECT DISTINCT ${batchTag("roleType")}, RoleType FROM users_info AS ui
    ${dateInfoFilter}
    ${filters.dateInfos?.length ? sql`AND` : sql`WHERE`} ui.RoleType IS NOT NULL AND ui.RoleType <> ''
    ORDER BY RoleType;

    SELECT DISTINCT ${batchTag("dateInfo")}, DateInfo FROM users_info AS ui
    WHERE ui.DateInfo IS NOT NULL AND ui.DateInfo <> ''
    ORDER BY DateInfo DESC;

    SELECT DISTINCT ${batchTag("town")}, TownName FROM personnel_performance AS p
    WHERE p.TownName IS NOT NULL AND p.TownName <> '' ${cityList}
    ORDER BY TownName;

    SELECT DISTINCT ${batchTag("branchCode")}, BranchCode FROM personnel_performance AS p
    WHERE p.BranchCode IS NOT NULL AND p.BranchCode <> '' ${cityList}
    ORDER BY BranchCode;

    SELECT DISTINCT ${batchTag("branchName")}, BranchName FROM personnel_performance AS p
    WHERE p.BranchName IS NOT NULL AND p.BranchName <> '' ${cityList}
    ORDER BY BranchName;

    SELECT DISTINCT ${batchTag("branchType")}, BranchType FROM personnel_performance AS p
    WHERE p.BranchType IS NOT NULL AND p.BranchType <> '' ${cityList}
    ORDER BY BranchType;
  `;

  const sets = splitByTag(await executeBatch<Record<string, string>>(query));
  const pick = (tag: string, key: string): string[] =>
    (sets[tag] ?? []).map((row) => row[key]).filter((value): value is string => Boolean(value));

  return {
    cities: pick("city", "CityName"),
    projectTypes: pick("projectType", "ProjectType"),
    contractTypes: pick("contractType", "ContractType"),
    roles: pick("role", "Role"),
    roleTypes: pick("roleType", "RoleType"),
    dateInfos: pick("dateInfo", "DateInfo"),
    towns: pick("town", "TownName"),
    branchCodes: pick("branchCode", "BranchCode"),
    branchNames: pick("branchName", "BranchName"),
    branchTypes: pick("branchType", "BranchType"),
  };
}
