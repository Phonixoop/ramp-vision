/**
 * `depos` query layer: three independent endpoints instead of one.
 *
 * v1 computed the table, the KPI/pie aggregates and the estimate from the same
 * unpaginated fetch, so the page could not paginate without breaking the cards.
 * v2 separates them:
 *
 *   getDepoTable()    — paginated, sorted rows for the grid
 *   getDepoCharts()   — service + city aggregates and KPI totals
 *   getDepoEstimate() — the four estimate queries in ONE round trip
 *
 * Two v1 bugs are fixed on the way:
 * 1. The daily branch grouped by `Start_Date` while selecting `DISTINCT` without
 *    it, so a day with two rows per (service, city, bill, case) produced
 *    duplicate rows. Grouping now includes every selected column.
 * 2. `getDepoEstimate` rebuilt its WHERE clause five times as string
 *    concatenation; it is built once here and reused.
 */
import { sql, type RawBuilder } from "kysely";

import { getRampDb } from "~/server/db/ramp-kysely";
import { batchTag, executeBatch, splitByTag } from "~/server/db/ramp-batch";
import {
  getDatesBetweenTwoDates,
  getSecondOrLaterDayOfNextMonth,
} from "~/utils/date-utils";
import moment from "jalali-moment";
import type {
  DepoChartsResponse,
  DepoEstimateResponse,
  DepoTableQuery,
  DepoTableResponse,
} from "./params";
import { resolveCityFilter } from "./permissions";
import { dateRangePredicate, startDateRanges } from "./sql-expressions";

/** Same period→dates expansion the personnel queries use (SARGable). */
function depoRanges(periodType: DepoTableQuery["periodType"], dates: string[] | undefined) {
  const clean = (dates ?? []).filter(Boolean);
  if (!clean.length) return [];

  if (periodType === "هفتگی" && clean.length >= 2) {
    return startDateRanges("هفتگی", [clean[0]!, clean[clean.length - 1]!]);
  }
  return startDateRanges(periodType, clean);
}

/**
 * `DepoCount` is a *point-in-time* measure: v1 took it from a single day (last
 * selected day for daily, second-to-last for weekly, the last available day of
 * the month for monthly) rather than summing it. Reproducing that exactly is
 * what keeps the pie/estimate numbers identical.
 */
function depoCountDate(
  periodType: DepoTableQuery["periodType"],
  dates: string[],
  monthLastDate: string | null,
): string | null {
  if (!dates.length) return null;
  if (periodType === "روزانه") return dates.at(-1) ?? null;
  if (periodType === "هفتگی") {
    const expanded = getDatesBetweenTwoDates(dates[0]!, dates[dates.length - 1]!);
    return expanded.at(-2) ?? expanded.at(-1) ?? null;
  }
  return monthLastDate ?? dates.at(-1)!;
}

/**
 * The last `Start_Date` in the data for the selected month.
 *
 * v1 preferred the second day of the *next* month when it exists (so the month
 * is treated as complete) and otherwise fell back to the newest row overall.
 */
async function resolveMonthLastDate(
  filters: DepoTableQuery,
  allowedCities: string[],
  dates: string[],

): Promise<string | null> {
  const last = dates.at(-1);
  if (!last) return null;

  const [year, month] = last.split("/").map(Number);
  const secondDayOfNextMonth = getSecondOrLaterDayOfNextMonth(year!, month!);

  const cityFilter = allowedCities.length
    ? sql`AND d.CityName IN (${sql.join(allowedCities.map((c) => sql`${c}`), sql`, `)})`
    : sql``;

  const query = sql`
    SELECT TOP 1 COALESCE(
      (SELECT MAX(d.Start_Date) FROM depos AS d
        WHERE d.Start_Date = ${secondDayOfNextMonth} ${cityFilter}),
      (SELECT MAX(d.Start_Date) FROM depos AS d WHERE 1 = 1 ${cityFilter})
    ) AS LastDate
  `;

  const rows = await execute<{ LastDate: string | null }>(query);
  return rows[0]?.LastDate ?? null;
}

/** Shared WHERE for `depos` — city scope, date ranges and dimension filters. */
function depoWhere(
  filters: DepoTableQuery,
  allowedCities: string[],
  ranges: ReturnType<typeof depoRanges>,
  extra?: RawBuilder<unknown>,
): RawBuilder<unknown> {
  const conditions: RawBuilder<unknown>[] = [sql`d.CityName IS NOT NULL`];

  if (allowedCities.length) {
    conditions.push(
      sql`d.CityName IN (${sql.join(allowedCities.map((c) => sql`${c}`), sql`, `)})`,
    );
  }
  if (ranges.length) conditions.push(dateRangePredicate(ranges, "d.Start_Date"));

  const inList = (column: string, values: string[] | undefined) =>
    values?.length
      ? sql`${sql.ref(`d.${column}`)} IN (${sql.join(values.map((v) => sql`${v}`), sql`, `)})`
      : null;

  for (const [column, values] of [
    ["ServiceName", filters.services],
    ["BillType", filters.billTypes],
    ["CaseType", filters.caseTypes],
  ] as const) {
    const condition = inList(column, values);
    if (condition) conditions.push(condition);
  }

  if (extra) conditions.push(extra);

  return sql`WHERE ${sql.join(conditions, sql` AND `)}`;
}

/** `DepoCount` summed only on the chosen day, everything else range-summed. */
function depoCountExpression(depoDate: string | null): RawBuilder<number> {
  return depoDate
    ? sql<number>`COALESCE(SUM(CASE WHEN d.Start_Date = ${depoDate} THEN d.DepoCount ELSE 0 END), 0)`
    : sql<number>`COALESCE(SUM(d.DepoCount), 0)`;
}

const DEPO_SORTABLE = new Set([
  "ServiceName",
  "CityName",
  "BillType",
  "CaseType",
  "EntryCount",
  "Capicity",
  "DepoCount",
]);

export async function getDepoTable(
  query: DepoTableQuery,
  permittedCities: string[],

): Promise<DepoTableResponse> {
  const allowedCities = resolveCityFilter(query.cities, permittedCities);
  if (query.cities?.length && !allowedCities.length) {
    return { rows: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  const dates = query.dates ?? [];
  const ranges = depoRanges(query.periodType, dates);
  if (!ranges.length) {
    return { rows: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  const monthLastDate =
    query.periodType === "ماهانه"
      ? await resolveMonthLastDate(query, allowedCities, dates)
      : null;
  const depoDate = depoCountDate(query.periodType, dates, monthLastDate);

  const where = depoWhere(query, allowedCities, ranges);
  const sort = query.sort && DEPO_SORTABLE.has(query.sort) ? query.sort : "CityName";
  const direction = query.dir === "desc" ? sql`DESC` : sql`ASC`;
  const offset = (query.page - 1) * query.pageSize;

  // Stable tiebreakers, but never a column twice: SQL Server rejects
  // "ORDER BY CityName …, d.CityName" outright, and the default sort *is*
  // CityName, so the old unconditional pair broke every default first load.
  const tiebreakers = (["ServiceName", "CityName"] as const)
    .filter((column) => column !== sort)
    .map((column) => sql`d.${sql.ref(column)} ASC`);

  const querySql = sql`
    SELECT
      d.ServiceName,
      d.CityName,
      d.BillType,
      d.CaseType,
      COALESCE(SUM(d.EntryCount), 0) AS EntryCount,
      COALESCE(SUM(d.Capicity), 0) AS Capicity,
      ${depoCountExpression(depoDate)} AS DepoCount,
      ${depoDate ? sql`${depoDate}` : sql`MAX(d.Start_Date)`} AS Start_Date,
      COUNT(*) OVER () AS __total
    FROM depos AS d
    ${where}
    GROUP BY d.ServiceName, d.CityName, d.BillType, d.CaseType
    ORDER BY ${sql.ref(sort)} ${direction}${
      tiebreakers.length ? sql`, ${sql.join(tiebreakers, sql`, `)}` : sql``
    }
    OFFSET ${offset} ROWS FETCH NEXT ${query.pageSize} ROWS ONLY
  `;

  const rows = await execute<
    Omit<DepoTableResponse["rows"][number], "DepoCount"> & {
      __total: number;
      DepoCount: number;
    }
  >(querySql);

  const total = rows.length ? Number(rows[0]!.__total) : 0;

  return {
    rows: rows.map(({ __total, ...row }) => ({
      ...row,
      EntryCount: Number(row.EntryCount ?? 0),
      Capicity: Number(row.Capicity ?? 0),
      DepoCount: Number(row.DepoCount ?? 0),
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

/** Service-level table, city breakdown and KPI totals — one round trip. */
export async function getDepoCharts(
  query: DepoTableQuery,
  permittedCities: string[],

): Promise<DepoChartsResponse> {
  const allowedCities = resolveCityFilter(query.cities, permittedCities);
  const empty: DepoChartsResponse = {
    services: [],
    totals: { EntryCount: 0, Capicity: 0, DepoCount: 0, DepoCompleteTime: 0 },
    byCity: [],
  };
  if (query.cities?.length && !allowedCities.length) return empty;

  const dates = query.dates ?? [];
  const ranges = depoRanges(query.periodType, dates);
  if (!ranges.length) return empty;

  const monthLastDate =
    query.periodType === "ماهانه"
      ? await resolveMonthLastDate(query, allowedCities, dates)
      : null;
  const depoDate = depoCountDate(query.periodType, dates, monthLastDate);
  const where = depoWhere(query, allowedCities, ranges);

  const querySql = sql`
    SELECT
      ${batchTag("service")},
      d.ServiceName,
      COALESCE(SUM(d.EntryCount), 0) AS EntryCount,
      COALESCE(SUM(d.Capicity), 0) AS Capicity,
      ${depoCountExpression(depoDate)} AS DepoCount,
      COUNT(*) AS __rows
    FROM depos AS d
    ${where}
    GROUP BY d.ServiceName
    ORDER BY COALESCE(SUM(d.EntryCount), 0) DESC;

    SELECT
      ${batchTag("city")},
      d.CityName,
      COALESCE(SUM(d.EntryCount), 0) AS EntryCount,
      COALESCE(SUM(d.Capicity), 0) AS Capicity,
      ${depoCountExpression(depoDate)} AS DepoCount
    FROM depos AS d
    ${where}
    GROUP BY d.CityName
    ORDER BY COALESCE(SUM(d.EntryCount), 0) DESC;
  `;

  const sets = splitByTag(await execute<Record<string, unknown>>(querySql));

  const services = (sets.service ?? []).map((row) => {
    const entryCount = Number(row.EntryCount ?? 0);
    const capicity = Number(row.Capicity ?? 0);
    const depoCount = Number(row.DepoCount ?? 0);
    return {
      ServiceName: String(row.ServiceName ?? ""),
      EntryCount: entryCount,
      Capicity: capicity,
      DepoCount: depoCount,
      // Same formula as calculateDepoCompleteTime, aggregated.
      DepoCompleteTime: depoCompleteTime(depoCount, capicity, entryCount),
    };
  });

  const byCity = (sets.city ?? []).map((row) => ({
    CityName: String(row.CityName ?? ""),
    EntryCount: Number(row.EntryCount ?? 0),
    Capicity: Number(row.Capicity ?? 0),
    DepoCount: Number(row.DepoCount ?? 0),
  }));

  const totals = services.reduce(
    (acc, service) => ({
      EntryCount: acc.EntryCount + service.EntryCount,
      Capicity: acc.Capicity + service.Capicity,
      DepoCount: acc.DepoCount + service.DepoCount,
      DepoCompleteTime: 0,
    }),
    { EntryCount: 0, Capicity: 0, DepoCount: 0, DepoCompleteTime: 0 },
  );
  totals.DepoCompleteTime = depoCompleteTime(
    totals.DepoCount,
    totals.Capicity,
    totals.EntryCount,
  );

  return { services, totals, byCity };
}

/** Mirrors `calculateDepoCompleteTime`: 0 when nothing is pending. */
function depoCompleteTime(depoCount: number, capicity: number, entryCount: number): number {
  if (depoCount === 0) return 0;
  const remaining = capicity - entryCount;
  if (remaining === 0) return depoCount;
  return depoCount / remaining;
}

/**
 * All four estimate inputs in ONE round trip.
 *
 * The previous-capacity window is the period immediately before the selection
 * (previous month / previous week / previous N days), which is what makes
 * `estimate` a projection rather than a ratio of the same window.
 */
export async function getDepoEstimate(
  query: DepoTableQuery,
  permittedCities: string[],

): Promise<DepoEstimateResponse> {
  const allowedCities = resolveCityFilter(query.cities, permittedCities);
  const empty: DepoEstimateResponse = {
    latestDepo: 0,
    depoDate: null,
    prevCapicity: 0,
    entryTotal: 0,
    estimate: 0,
  };
  if (query.cities?.length && !allowedCities.length) return empty;

  const dates = (query.dates ?? []).filter(Boolean);
  if (!dates.length) return empty;

  const last = dates.at(-1)!;

  // Dimension filters (city/service/bill/case) without any date predicate; each
  // of the four reads below adds its own date condition on top.
  const dimensionOnly = depoWhere(query, allowedCities, []);

  let depoDate: string | null = null;
  let previousRange: { start: string; endExclusive: string } | null = null;

  if (query.periodType === "ماهانه") {
    depoDate =
      (await resolveMonthLastDate(query, allowedCities, dates)) ?? null;

    // The comparison window is the whole previous month, which is what v1 used
    // for `prevCapicity` (it queried `LIKE 'prevYear/prevMonth/%'`).
    const previousMonth = moment(dates[0]!, "jYYYY/jMM/jDD").subtract(
      1,
      "jMonth",
    );
    const previousYear = previousMonth.format("jYYYY");
    const previousMonthNumber = previousMonth.format("jMM");
    previousRange = {
      start: `${previousYear}/${previousMonthNumber}/01`,
      endExclusive: nextMonthStart(previousYear, previousMonthNumber),
    };
  } else if (query.periodType === "هفتگی") {
    const expanded = getDatesBetweenTwoDates(dates[0]!, last);
    depoDate = expanded.at(-2) ?? expanded.at(-1) ?? null;

    const start = moment(dates[0]!, "jYYYY/jMM/jDD").subtract(7, "days");
    previousRange = {
      start: start.format("YYYY/MM/DD"),
      endExclusive: moment(dates[0]!, "jYYYY/jMM/jDD").format("YYYY/MM/DD"),
    };
  } else {
    depoDate = last;
    const days = dates.length;
    previousRange = {
      start: moment(dates[0]!, "jYYYY/jMM/jDD")
        .subtract(days, "days")
        .format("YYYY/MM/DD"),
      endExclusive: moment(dates[0]!, "jYYYY/jMM/jDD").format("YYYY/MM/DD"),
    };
  }

  const currentRanges = depoRanges(query.periodType, dates);

  const depoDateWhere = depoDate
    ? sql`${dimensionOnly} AND d.Start_Date = ${depoDate}`
    : sql`${dimensionOnly} AND 1 = 0`;

  const previousWhere = previousRange
    ? sql`${dimensionOnly} AND ${dateRangePredicate([previousRange], "d.Start_Date")}`
    : sql`${dimensionOnly} AND 1 = 0`;

  const entryWhere = sql`${dimensionOnly} AND ${dateRangePredicate(currentRanges, "d.Start_Date")}`;

  const querySql = sql`
    SELECT TOP 1 ${batchTag("depo")}, COALESCE(SUM(d.DepoCount), 0) AS DepoTotal FROM depos AS d ${depoDateWhere};

    SELECT TOP 1 ${batchTag("capicity")}, COALESCE(SUM(d.Capicity), 0) AS TotalCapicity FROM depos AS d ${previousWhere};

    SELECT TOP 1 ${batchTag("entry")}, COALESCE(SUM(d.EntryCount), 0) AS EntryTotal FROM depos AS d ${entryWhere};
  `;

  const sets = splitByTag(await execute<Record<string, unknown>>(querySql));

  const latestDepo = Number(sets.depo?.[0]?.DepoTotal ?? 0);
  const prevCapicity = Number(sets.capicity?.[0]?.TotalCapicity ?? 0);
  const entryTotal = Number(sets.entry?.[0]?.EntryTotal ?? 0);

  const denominator = prevCapicity - entryTotal;
  const estimate =
    !depoDate || !Number.isFinite(denominator) || denominator <= 0
      ? 0
      : latestDepo / denominator;

  return { latestDepo, depoDate, prevCapicity, entryTotal, estimate };
}

function nextMonthStart(year: string, month: string): string {
  const m = Number(month);
  const y = Number(year);
  return m >= 12 ? `${y + 1}/01/01` : `${y}/${String(m + 1).padStart(2, "0")}/01`;
}

/** Depo facet options (cities, services, bill types, case types). */
export async function getDepoOptions(
  permittedCities: string[],

): Promise<{
  cities: string[];
  services: string[];
  billTypes: string[];
  caseTypes: string[];
}> {
  const cityList = permittedCities.length
    ? sql`WHERE d.CityName IN (${sql.join(permittedCities.map((c) => sql`${c}`), sql`, `)})`
    : sql`WHERE 1 = 1`;

  const querySql = sql`
    SELECT DISTINCT ${batchTag("city")}, d.CityName FROM depos AS d
    ${cityList} AND d.CityName IS NOT NULL AND d.CityName <> ''
    ORDER BY d.CityName;

    SELECT DISTINCT ${batchTag("service")}, d.ServiceName FROM depos AS d
    WHERE d.ServiceName IS NOT NULL AND d.ServiceName <> ''
    ORDER BY d.ServiceName;

    SELECT DISTINCT ${batchTag("billType")}, d.BillType FROM depos AS d
    WHERE d.BillType IS NOT NULL AND d.BillType <> ''
    ORDER BY d.BillType;

    SELECT DISTINCT ${batchTag("caseType")}, d.CaseType FROM depos AS d
    WHERE d.CaseType IS NOT NULL AND d.CaseType <> ''
    ORDER BY d.CaseType;
  `;

  const sets = splitByTag(await execute<Record<string, string>>(querySql));
  const column = (tag: string, key: string): string[] =>
    (sets[tag] ?? []).map((row) => row[key]).filter((value): value is string => Boolean(value));

  return {
    cities: column("city", "CityName"),
    services: column("service", "ServiceName"),
    billTypes: column("billType", "BillType"),
    caseTypes: column("caseType", "CaseType"),
  };
}

/** Batch execution; rows from all statements arrive flattened and carry `__set`. */
const execute = executeBatch;
