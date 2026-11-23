import {
  cacheKey,
  cached,
  parseQuery,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { filterQuerySchema } from "~/server/ramp-performance/params";
import { getPersonnelSummary } from "~/server/ramp-performance/personnel-summary";

/**
 * Footer totals, average performance, and role/city breakdowns over the **whole**
 * filtered set — not just the current page.
 *
 * Deliberately a separate endpoint from `/table` so the sticky footer and the
 * grid can settle independently: fast interactions re-page the grid while the
 * footer (which is the expensive aggregate) stays cached.
 */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(filterQuerySchema, url.searchParams);

  const key = cacheKey("pp-summary", context.scope.permittedCities, query);

  const body = await cached(key, 60_000, () =>
    getPersonnelSummary(
      query,
      context.scope.permittedCities,
      query.workDays ? (query.workDaysCount ?? null) : null,
    ),
  );

  return respondJson(request, body);
});
