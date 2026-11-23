/**
 * URL ⇄ API mapping for the v2 depo page.
 *
 * Depo filters are a strict subset of the personnel ones (period + dates +
 * cities + three dimensions), and the page keeps the same grid state (page,
 * pageSize, sort, dir) in the URL so a filtered view is shareable.
 */
"use client";

import moment from "jalali-moment";

import {
  parsePeriod,
  splitCsv,
  type PeriodType,
} from "../personnel_performance/chart/model";
import type { DepoTableQuery } from "~/server/ramp-performance/params";

export type DepoUrlState = {
  period: PeriodType;
  dates: string[];
  cities: string[];
  services: string[];
  billTypes: string[];
  caseTypes: string[];
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
};

export type DepoSearchParams = {
  period?: string;
  dates?: string;
  cities?: string;
  services?: string;
  bill_types?: string;
  case_types?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  dir?: string;
};

export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

/**
 * v1's depo default: `subtract(2, "days")` (`depo/context.tsx`), one day further
 * back than the personnel pages. Matching it matters because the nightly load
 * lags — defaulting to *yesterday* opens the page on an empty range whenever the
 * latest load hasn't landed yet.
 */
function defaultDates(): string[] {
  return [moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD")];
}

export function resolveDepoUrlState(
  searchParams: DepoSearchParams,
): DepoUrlState {
  const page = Number.parseInt(searchParams.page ?? "", 10);
  const pageSize = Number.parseInt(searchParams.pageSize ?? "", 10);
  const dates = splitCsv(searchParams.dates);

  return {
    period: searchParams.period ? parsePeriod(searchParams.period) : "روزانه",
    dates: dates.length ? dates : defaultDates(),
    cities: splitCsv(searchParams.cities),
    services: splitCsv(searchParams.services),
    billTypes: splitCsv(searchParams.bill_types),
    caseTypes: splitCsv(searchParams.case_types),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    sort: searchParams.sort ?? "",
    dir: searchParams.dir === "desc" ? "desc" : "asc",
  };
}

/** One query object feeds `/table`, `/charts` and `/estimate` alike. */
export function toDepoQuery(state: DepoUrlState): DepoTableQuery {
  return {
    periodType: state.period,
    dates: state.dates,
    cities: state.cities,
    services: state.services,
    billTypes: state.billTypes,
    caseTypes: state.caseTypes,
    page: state.page,
    pageSize: state.pageSize,
    sort: state.sort || undefined,
    dir: state.dir,
  };
}

export function depoActiveFilterCount(state: DepoUrlState): number {
  let count = 0;
  for (const value of [
    state.dates,
    state.cities,
    state.services,
    state.billTypes,
    state.caseTypes,
  ]) {
    if (value?.length) count += 1;
  }
  return count;
}
