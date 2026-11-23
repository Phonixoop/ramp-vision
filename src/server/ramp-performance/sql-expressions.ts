/**
 * The single source of truth for the SQL that reproduces the v1 browser-side
 * performance maths.
 *
 * Everything here mirrors a named function in `~/utils/personnel-performance.ts`
 * so the two implementations can be diffed line by line:
 *
 *   startDateRanges()          ← weekly/monthly date expansion (replaces `LIKE`)
 *   directPerformanceSql()     ← calculateDirectPerformance()
 *   inDirectPerformanceSql()   ← calculateInDirectPerformance()
 *   totalPerformanceSql()      ← distinctPersonnelPerformanceData() divisor logic
 *   hasIndicatorActivitySql()  ← hasIndicatorPerformanceActivity()
 *
 * Two rules that are easy to get wrong and are therefore centralised here:
 *
 * 1. **Dates are half-open ranges, not `LIKE`.** `Start_Date` is a
 *    `YYYY/MM/DD` string; `LIKE '1404/08/%'` is not SARGable and forces a scan.
 *    `>= '1404/08/01' AND < '1404/09/01'` is an index range seek.
 * 2. **The divisor is not always `COUNT(*)`.** Daily rows divide by the number
 *    of worked days; when the UI's work-days toggle is on, month/week views
 *    divide by the configured work days instead. The fallback (no Indicator
 *    activity) divides the stored percentage by that same divisor.
 */
import { sql, type RawBuilder } from "kysely";

import { Indicators } from "~/constants/personnel-performance";
import type { PeriodType } from "./params";

/** Direct fields, in the order `DIRECT_PERFORMANCE_FIELDS` lists them. */
export const DIRECT_FIELDS = [
  "SabtAvalieAsnad",
  "PazireshVaSabtAvalieAsnad",
  "ArzyabiAsanadBimarsetaniDirect",
  "ArzyabiAsnadDandanVaParaDirect",
  "ArzyabiAsnadDandanDirect",
  "ArzyabiAsnadDaroDirect",
  "WithScanCount",
  "WithoutScanCount",
] as const;

/** Indirect fields, in the order `INDIRECT_PERFORMANCE_FIELDS` lists them. */
export const INDIRECT_FIELDS = [
  "ArzyabiAsnadBimarestaniIndirect",
  "ArzyabiAsnadDandanVaParaIndirect",
  "ArzyabiAsnadDandanIndirect",
  "ArzyabiAsnadDaroIndirect",
  "WithoutScanInDirectCount",
] as const;

/** Fields whose Indicator weight exists in `Indicators` (drive the formula). */
export const INDICATOR_FIELDS = [...DIRECT_FIELDS, ...INDIRECT_FIELDS] as const;

export type IndicatorField = (typeof INDICATOR_FIELDS)[number];

/**
 * Persian month lengths are not in `Date`; the data is a string range, so the
 * only correct expansion is `month → [firstDay, firstDayOfNextMonth)`.
 * Jalali months 1–6 are 31 days and 7–11 are 30, month 12 is 29/30 — but since
 * the ranges are compared as *strings*, `month+1` is all that is needed and the
 * day count never has to be known here.
 */
export type DateRange = { start: string; endExclusive: string };

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month >= 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function nextDay(isoDate: string): string {
  const [year, month, day] = isoDate.split("/").map(Number);
  // Only used to build exclusive bounds; a 31-day upper bound is fine because
  // the calendar day itself is included by the lower bound of no other range.
  if (day < 30) return `${year}/${pad2(month)}/${pad2(day + 1)}`;
  const following = nextMonth(year, month);
  return `${following.year}/${pad2(following.month)}/01`;
}

/**
 * Turn the UI's date selection into SARGable half-open ranges.
 *
 * - `daily`: one range per selected day.
 * - `weekly`: one range spanning the first→last selected day (inclusive).
 * - `monthly`: one range per selected month, keyed on `YYYY/MM`.
 *
 * Ranges are merged and de-overlapped so a contiguous month selection does not
 * produce a long `OR` chain.
 */
export function startDateRanges(
  periodType: PeriodType,
  dates: string[],
): DateRange[] {
  const clean = dates.filter((date) => /^\d{4}\/\d{2}(\/\d{2})?$/.test(date));
  if (!clean.length) return [];

  if (periodType === "روزانه") {
    const sorted = [...new Set(clean)].sort();
    return mergeRanges(
      sorted.map((start) => ({ start, endExclusive: nextDay(start) })),
    );
  }

  if (periodType === "هفتگی") {
    const sorted = [...new Set(clean)].sort();
    const first = sorted[0]!;
    const last = sorted[sorted.length - 1]!;
    return [{ start: first, endExclusive: nextDay(last) }];
  }

  // ماهانه — group by YYYY/MM.
  const months = new Set(clean.map((date) => date.slice(0, 7)));
  return mergeRanges(
    [...months].sort().map((key) => {
      const [year, month] = key.split("/").map(Number);
      const following = nextMonth(year!, month!);
      return {
        start: `${key}/01`,
        endExclusive: `${following.year}/${pad2(following.month)}/01`,
      };
    }),
  );
}

/** Merge overlapping/adjacent half-open ranges so the WHERE stays short. */
function mergeRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length <= 1) return ranges;

  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
  const merged: DateRange[] = [sorted[0]!];

  for (const range of sorted.slice(1)) {
    const last = merged[merged.length - 1]!;
    if (range.start <= last.endExclusive) {
      if (range.endExclusive > last.endExclusive) last.endExclusive = range.endExclusive;
      continue;
    }
    merged.push({ ...range });
  }

  return merged;
}

/** `(Start_Date >= @a AND Start_Date < @b) OR (…)` — parameterised. */
export function dateRangePredicate(
  ranges: DateRange[],
  column = "p.Start_Date",
): RawBuilder<unknown> {
  if (!ranges.length) return sql`1 = 0`;

  const parts = ranges.map(
    (range) =>
      sql`(${sql.ref(column)} >= ${range.start} AND ${sql.ref(column)} < ${range.endExclusive})`,
  );

  return parts.length === 1 ? parts[0]! : sql`(${sql.join(parts, sql` OR `)})`;
}

/**
 * `COUNT(CASE WHEN … ) > 0` for Indicator-backed fields — mirrors
 * `hasIndicatorPerformanceActivity`. `SUM` never returns NULL here because every
 * measure column is NOT NULL in practice; `COALESCE` keeps it safe anyway.
 */
export function hasIndicatorActivitySql(alias = "agg"): RawBuilder<unknown> {
  const checks = INDICATOR_FIELDS.map(
    (field) => sql`COALESCE(${sql.ref(`${alias}.sum_${field}`)}, 0) > 0`,
  );
  return sql`(CASE WHEN ${sql.join(checks, sql` OR `)} THEN 1 ELSE 0 END)`;
}

/**
 * SUM(count / ((d * indicator) / 1)) * 100 for one field group.
 * `divisor` is a SQL expression (work days or row count) so it stays a single
 * scalar query — the same formula `sumPerformanceFields` applies in the browser.
 */
function performanceSumSql(
  fields: readonly (keyof typeof Indicators)[],
  divisor: RawBuilder<unknown>,
  alias: string,
): RawBuilder<number> {
  const terms = fields.map((field) => {
    const indicator = Indicators[field];
    // `count / ((d * indicator) / 1)` === `count / (d * indicator)`.
    //
    // The explicit `CAST(... AS float)` is load-bearing: the measure columns are
    // integers, so `SUM(x) / (int * int)` is *integer* division in T-SQL and
    // truncates every contribution to 0. JavaScript divides in floating point,
    // so without the cast the whole formula collapses to 0% and every row is
    // then dropped by the zero-performance filter.
    return sql`(
      CAST(COALESCE(${sql.ref(`${alias}.sum_${field}`)}, 0) AS float)
      / NULLIF(((${divisor}) * ${indicator}), 0)
    )`;
  });

  return sql<number>`((${sql.join(terms, sql` + `)}) * 100)`;
}

/**
 * The four performance outputs, in one expression set.
 *
 * - When any Indicator activity exists: use the Indicator formula (matches the
 *   C# `CalculateDirectPerformance` / `CalculateInDirectPerformance`).
 * - Otherwise: divide the *stored* SQL percentage by the divisor. This is the
 *   Archive/Visit-only fallback; without it those rows would wrongly read 0%.
 */
export function performanceExpressions(
  divisor: RawBuilder<unknown>,
  alias = "agg",
): {
  DirectPerFormance: RawBuilder<number>;
  InDirectPerFormance: RawBuilder<number>;
  TotalPerformance: RawBuilder<number>;
} {
  const direct = performanceSumSql(DIRECT_FIELDS, divisor, alias);
  const inDirect = performanceSumSql(INDIRECT_FIELDS, divisor, alias);

  // Same integer-division trap as above: cast before dividing so the stored
  // percentage is not truncated to 0.
  const directFallback = sql<number>`CAST(COALESCE(${sql.ref(`${alias}.sum_DirectPerFormance`)}, 0) AS float) / NULLIF(${divisor}, 0)`;
  const inDirectFallback = sql<number>`CAST(COALESCE(${sql.ref(`${alias}.sum_IndirectPerFormance`)}, 0) AS float) / NULLIF(${divisor}, 0)`;
  const totalFallback = sql<number>`CAST(COALESCE(${sql.ref(`${alias}.sum_TotalPerformance`)}, 0) AS float) / NULLIF(${divisor}, 0)`;

  const hasActivity = hasIndicatorActivitySql(alias);

  return {
    DirectPerFormance: sql<number>`(CASE WHEN ${hasActivity} = 1 THEN ${direct} ELSE ${directFallback} END)`,
    InDirectPerFormance: sql<number>`(CASE WHEN ${hasActivity} = 1 THEN ${inDirect} ELSE ${inDirectFallback} END)`,
    TotalPerformance: sql<number>`(CASE WHEN ${hasActivity} = 1 THEN (${direct} + ${inDirect}) ELSE ${totalFallback} END)`,
  };
}

/**
 * `ROW_NUMBER() OVER (PARTITION BY … ORDER BY Id) = 1` over the personnel
 * performance identity columns — reproduces `PERSONNEL_PERFORMANCE_DEDUPE_BY`
 * (which keeps the first matching row after the users_info join fan-out).
 */
export const PP_DEDUPE_COLUMNS = [
  "NationalCode",
  "CityName",
  "Start_Date",
  "TownName",
  "BranchCode",
  "BranchName",
  "BranchType",
  "HasTheDayOff",
] as const;

export function ppDedupePartition(alias = "p"): RawBuilder<unknown> {
  return sql.join(
    PP_DEDUPE_COLUMNS.map((column) => sql.ref(`${alias}.${column}`)),
    sql`, `,
  );
}

/** Columns the table can sort on. Anything else falls back to the default. */
export const SORTABLE_COLUMNS = [
  "NameFamily",
  "CityName",
  "NationalCode",
  "PersonnelCode",
  "Role",
  "RoleType",
  "ContractType",
  "ProjectType",
  "DateInfo",
  "TotalPerformance",
  "DirectPerFormance",
  "InDirectPerFormance",
  ...INDICATOR_FIELDS,
] as const;

export type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export function isSortableColumn(value: string): value is SortableColumn {
  return (SORTABLE_COLUMNS as readonly string[]).includes(value);
}
