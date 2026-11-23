/**
 * URL ⇄ API mapping for the v2 table page.
 *
 * Filter *semantics* are inherited from the v2 chart page's `model.ts`
 * (`resolveInitialFilters`, `toApiFilters`, `withV1QueryDefaults`), so both v2
 * pages and v1 agree on defaults, the legacy `RoleType` whitelist cleanup and
 * the `DateInfo` fallback. What is added here is only the grid-specific state
 * that the chart page has no equivalent for: `page`, `pageSize`, `sort`, `dir`.
 */
"use client";

import {
  resolveInitialFilters,
  splitCsv,
  toApiFilters,
  withV1QueryDefaults,
  type ChartFilterValues,
  type ChartSearchParams,
} from "../../personnel_performance/chart/model";
import type { TableQuery } from "~/server/ramp-performance/params";

/** Everything the table page keeps in the URL. */
export type TableUrlState = ChartFilterValues & {
  /**
   * City scope. `ChartFilterValues` has no city field because the chart page
   * never filters by city (its whole point is comparing them); the table does,
   * and multi-city selection is allowed in every period including monthly.
   */
  cities: string[];
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
};

export type TableSearchParams = ChartSearchParams & {
  cities?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  dir?: string;
};

export const DEFAULT_PAGE_SIZE = 50;

/** Page sizes the grid offers. */
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

/**
 * Build URL state from the incoming query string.
 *
 * `saved` is the localStorage default set the chart page already maintains; the
 * table reuses it so a user's period/contract preferences carry across pages.
 */
export function resolveTableUrlState(
  searchParams: TableSearchParams,
  saved: Parameters<typeof resolveInitialFilters>[1],
): TableUrlState {
  const filters = resolveInitialFilters(searchParams, saved);

  const page = Number.parseInt(searchParams.page ?? "", 10);
  const pageSize = Number.parseInt(searchParams.pageSize ?? "", 10);

  return {
    ...filters,
    cities: splitCsv(searchParams.cities),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    sort: searchParams.sort ?? "",
    dir: searchParams.dir === "desc" ? "desc" : "asc",
  };
}

/**
 * Map URL state to the `/api/v2` query, applying v1's query-time fallbacks.
 *
 * `dateInfoFallback` comes from the `/options` response (`dateInfos[0]`, the
 * newest snapshot) and only matters when the URL carries no `DateInfo`.
 */
export function toTableQuery(
  state: TableUrlState,
  dateInfoFallback?: string[] | null,
): TableQuery {
  const mapped = withV1QueryDefaults(toApiFilters(state), dateInfoFallback);
  const filter = mapped.filter;

  return {
    periodType: state.period,
    dates: filter.Start_Date,
    cities: state.cities,
    projectTypes: filter.ProjectType,
    contractTypes: filter.ContractType,
    roles: filter.Role,
    roleTypes: filter.RoleType,
    dateInfos: filter.DateInfo,
    towns: filter.TownName,
    branchCodes: filter.BranchCode,
    branchNames: filter.BranchName,
    branchTypes: filter.BranchType,
    // Work days are a divisor choice, not a filter; the count is the configured
    // calendar value the toggle implies (v1 hardcodes 30 for month views).
    workDays: state.work_days,
    workDaysCount: state.work_days ? 30 : undefined,
    page: state.page,
    pageSize: state.pageSize,
    sort: state.sort || undefined,
    dir: state.dir,
  };
}

/** Number of filters the user has actively narrowed (drives the badge count). */
export function activeFilterCount(state: TableUrlState): number {
  let count = 0;
  for (const value of [
    state.dates,
    state.cities as string[] | undefined,
    state.project,
    state.contract,
    state.role,
    state.role_type,
    state.date_info,
    state.town,
    state.branch,
    state.branch_code,
    state.branch_type,
  ]) {
    if (value?.length) count += 1;
  }
  return count;
}
