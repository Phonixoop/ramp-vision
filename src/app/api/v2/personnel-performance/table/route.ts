import {
  cacheKey,
  cached,
  parseQuery,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { tableQuerySchema } from "~/server/ramp-performance/params";
import { getPersonnelTable } from "~/server/ramp-performance/personnel-table";

/**
 * One page of aggregated personnel performance.
 *
 * GET /api/v2/personnel-performance/table?periodType=ماهانه&dates=1404/08/01
 *   &cities=Tehran,Fars&page=1&pageSize=50&sort=TotalPerformance&dir=desc
 *
 * Multi-city monthly filters are allowed here: the aggregation happens in SQL,
 * so nothing scales with the number of rows the browser would have received.
 */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(tableQuerySchema, url.searchParams);

  const key = cacheKey("pp-table", context.scope.permittedCities, query);

  const body = await cached(key, 60_000, () =>
    getPersonnelTable(
      query,
      context.scope.permittedCities,
      query.workDays ? (query.workDaysCount ?? null) : null,
    ),
  );

  return respondJson(request, body);
});
