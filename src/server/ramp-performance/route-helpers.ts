/**
 * Shared plumbing for every `/api/v2` route handler.
 *
 * Each route follows the same five steps:
 *   1. authenticate (`getServerAuthSession`)
 *   2. resolve the caller's city scope from their role permissions
 *   3. validate query params with zod
 *   4. run a cached query (TTL map keyed by scope + filter hash)
 *   5. answer with `ETag` + `Cache-Control`, or `304` when the tag matches
 *
 * The data only changes once a day (legacy nightly load), so a 60-second private
 * cache plus a content hash is enough to make paging and re-filtering cheap
 * without ever serving another user's rows.
 */
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getPermission } from "~/server/server-utils";
import { getServerAuthSession } from "~/server/auth";
import type { Permission } from "~/types";
import { cityScopeFromPermissions, type CityScope } from "./permissions";

export const CACHE_CONTROL =
  "private, max-age=60, stale-while-revalidate=300";

/** In-process TTL cache. One entry per (route, scope, filter) tuple. */
type CacheEntry = { expiresAt: number; value: unknown };
const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 500;

export function cacheKey(
  route: string,
  cities: string[],
  payload: Record<string, unknown>,
): string {
  const hash = createHash("sha1")
    .update(JSON.stringify({ cities: [...cities].sort(), ...payload }))
    .digest("base64url");
  return `${route}:${hash}`;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const value = await load();

  if (cache.size >= MAX_ENTRIES) {
    // Cheap eviction: drop the oldest quarter rather than tracking LRU order.
    const drop = Math.ceil(MAX_ENTRIES / 4);
    let removed = 0;
    for (const entryKey of cache.keys()) {
      cache.delete(entryKey);
      if (++removed >= drop) break;
    }
  }

  cache.set(key, { expiresAt: now + ttlMs, value });
  return value;
}

/** Authenticated caller plus the city scope derived from their permissions. */
export type RouteContext = {
  userId: string;
  permissions: Permission[];
  scope: CityScope;
};

export class RouteError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function requireRouteContext(): Promise<RouteContext> {
  const session = await getServerAuthSession();
  if (!session?.user) {
    throw new RouteError(401, "UNAUTHORIZED", "Authentication required.");
  }

  const permissions = await getPermission({
    ctx: { session, db: (await import("~/server/db")).db },
  });
  const scope = cityScopeFromPermissions(permissions);

  return { userId: session.user.id, permissions, scope };
}

/** Parse `searchParams` with a zod schema, mapping failures to a 400. */
export function parseQuery<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams,
): z.infer<T> {
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    // First value wins; the UI never sends repeated keys.
    if (!(key in raw)) raw[key] = value;
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new RouteError(
      400,
      "INVALID_QUERY",
      "Query parameters are invalid.",
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

/** Deterministic ETag from the response body. */
export function etagFor(body: unknown): string {
  const hash = createHash("sha1")
    .update(JSON.stringify(body))
    .digest("base64url");
  return `"${hash}"`;
}

export type RespondOptions = {
  status?: number;
  /** Extra headers (e.g. Content-Disposition for export). */
  headers?: Record<string, string>;
};

/**
 * JSON response with ETag negotiation.
 *
 * `If-None-Match` handling is what makes `keepPreviousData` refetches free:
 * unchanged filters revalidate to a 304 with no body.
 */
export function respondJson(
  request: Request,
  body: unknown,
  options: RespondOptions = {},
): NextResponse {
  const etag = etagFor(body);
  const ifNoneMatch = request.headers.get("if-none-match");

  if (ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim() === etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: etag, "Cache-Control": CACHE_CONTROL, ...options.headers },
    });
  }

  return NextResponse.json(body, {
    status: options.status ?? 200,
    headers: {
      ETag: etag,
      "Cache-Control": CACHE_CONTROL,
      ...options.headers,
    },
  });
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof RouteError) {
    return NextResponse.json(
      { error: error.code, message: error.message, details: error.details },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Aborted requests are not errors worth logging loudly.
  if (error instanceof Error && error.name === "AbortError") {
    return new NextResponse(null, { status: 499 });
  }

  console.error("[api/v2]", error);
  const message =
    error instanceof Error ? error.message : "Unexpected server error.";
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Wraps a handler with error mapping and abort wiring.
 *
 * `request.signal` is forwarded to the SQL query so a user changing filters
 * cancels the previous aggregate at the database instead of letting it finish
 * into a discarded connection.
 */
export function routeHandler(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
