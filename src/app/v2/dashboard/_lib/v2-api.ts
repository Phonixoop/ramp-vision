/**
 * Typed client for the `/api/v2` routes.
 *
 * These pages deliberately avoid tRPC's batched link: a table page needs one
 * request per interaction (page, sort, filter), and a plain `fetch` gives us
 * abort-on-change, `If-None-Match` revalidation, and separate loading states for
 * the grid vs the footer/summary without fighting a batching client.
 *
 * Every hook here is built on React Query so:
 *   - `keepPreviousData` keeps the old page on screen while the next one loads
 *     (no layout jump while paging),
 *   - an in-flight request is aborted when the filters change,
 *   - a `304` from the ETag handshake is transparently served from cache.
 */
"use client";

import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import type {
  DepoChartsResponse,
  DepoEstimateResponse,
  DepoTableQuery,
  DepoTableResponse,
  PersonnelOptionsResponse,
  PersonnelSummaryResponse,
  PersonnelTableResponse,
  TableQuery,
} from "~/server/ramp-performance/params";

export type { TableQuery, DepoTableQuery };

const BASE = "/api/v2";

/** Serialise filters into the query-string shape the routes parse. */
function toSearchParams(input: object): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(",");
      if (joined) params.set(key, joined);
      continue;
    }
    params.set(key, String(value));
  }
  return params;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch JSON with abort + error mapping.
 *
 * A `304` cannot reach here: the fetch spec only produces one for a
 * revalidating request and then hands back the cached body, so `response.ok` is
 * always true for a success. The explicit guard is for a proxy that forwards
 * `304` verbatim.
 */
async function getJson<T>(path: string, params: URLSearchParams, signal: AbortSignal): Promise<T> {
  const qs = params.toString();
  const response = await fetch(qs ? `${path}?${qs}` : path, {
    signal,
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });

  if (response.status === 304) {
    throw new ApiError(304, "NOT_MODIFIED", "Not modified.");
  }

  if (!response.ok) {
    let code = "HTTP_ERROR";
    let message = `Request failed with ${response.status}.`;
    try {
      const body = (await response.json()) as { error?: string; message?: string };
      if (body.error) code = body.error;
      if (body.message) message = body.message;
    } catch {
      // Non-JSON error body (proxy, crash page) — keep the status message.
    }
    throw new ApiError(response.status, code, message);
  }

  return (await response.json()) as T;
}

/** One page of the personnel performance grid. */
export function usePersonnelTable(
  query: TableQuery | null,
): UseQueryResult<PersonnelTableResponse> {
  return useQuery({
    queryKey: ["v2", "pp-table", query],
    queryFn: ({ signal }) =>
      getJson<PersonnelTableResponse>(
        `${BASE}/personnel-performance/table`,
        toSearchParams(query!),
        signal,
      ),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    // The underlying data is a nightly load; an ETag revalidation is cheap.
    staleTime: 30_000,
  });
}

/**
 * Footer / KPI totals over the **full** filtered set (not just the page).
 * Kept separate from the table request so paging never recomputes it.
 */
export function usePersonnelSummary(
  query: TableQuery | null,
): UseQueryResult<PersonnelSummaryResponse> {
  return useQuery({
    queryKey: ["v2", "pp-summary", query],
    queryFn: ({ signal }) =>
      getJson<PersonnelSummaryResponse>(
        `${BASE}/personnel-performance/summary`,
        toSearchParams(query!),
        signal,
      ),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    // Aggregates over a month are the most expensive call; cache them longer.
    staleTime: 60_000,
  });
}

/** Facet values for the filter popovers. */
export function usePersonnelOptions(
  query: TableQuery | null,
): UseQueryResult<PersonnelOptionsResponse> {
  return useQuery({
    queryKey: ["v2", "pp-options", query],
    queryFn: ({ signal }) =>
      getJson<PersonnelOptionsResponse>(
        `${BASE}/personnel-performance/options`,
        toSearchParams(query!),
        signal,
      ),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    // Facets change only when the roster snapshot does.
    staleTime: 5 * 60_000,
  });
}

/** One page of the depo grid. */
export function useDepoTable(
  query: DepoTableQuery | null,
): UseQueryResult<DepoTableResponse> {
  return useQuery({
    queryKey: ["v2", "depo-table", query],
    queryFn: ({ signal }) =>
      getJson<DepoTableResponse>(`${BASE}/depo/table`, toSearchParams(query!), signal),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Service / city aggregates and KPI totals for the depo cards. */
export function useDepoCharts(
  query: DepoTableQuery | null,
): UseQueryResult<DepoChartsResponse> {
  return useQuery({
    queryKey: ["v2", "depo-charts", query],
    queryFn: ({ signal }) =>
      getJson<DepoChartsResponse>(`${BASE}/depo/charts`, toSearchParams(query!), signal),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/** Completion projection for the selected period. */
export function useDepoEstimate(
  query: DepoTableQuery | null,
): UseQueryResult<DepoEstimateResponse> {
  return useQuery({
    queryKey: ["v2", "depo-estimate", query],
    queryFn: ({ signal }) =>
      getJson<DepoEstimateResponse>(`${BASE}/depo/estimate`, toSearchParams(query!), signal),
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/** Direct download URL for the streamed CSV export (full filtered set). */
export function personnelExportUrl(query: TableQuery): string {
  const params = toSearchParams(query);
  params.delete("page");
  params.delete("pageSize");
  return `${BASE}/personnel-performance/export?${params.toString()}`;
}

/** Depo filter facets (cities, services, bill types, case types). */
export type DepoOptionsResponse = {
  cities: string[];
  services: string[];
  billTypes: string[];
  caseTypes: string[];
};

export function useDepoOptions(): UseQueryResult<DepoOptionsResponse> {
  return useQuery({
    queryKey: ["v2", "depo-options"],
    queryFn: ({ signal }) =>
      getJson<DepoOptionsResponse>(`${BASE}/depo/options`, new URLSearchParams(), signal),
    // Facets change only when the nightly load does.
    staleTime: 5 * 60_000,
  });
}
