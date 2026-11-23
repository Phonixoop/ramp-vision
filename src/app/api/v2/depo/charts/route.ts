import {
  cacheKey,
  cached,
  parseQuery,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { depoTableQuerySchema } from "~/server/ramp-performance/params";
import { getDepoCharts } from "~/server/ramp-performance/depo";

/**
 * Service aggregates, per-city breakdown and KPI totals.
 *
 * Independent of `/depo/table` so paging the grid never recomputes the cards,
 * and the cards stay warm in the cache while the user pages.
 */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(depoTableQuerySchema, url.searchParams);

  const key = cacheKey("depo-charts", context.scope.permittedCities, {
    periodType: query.periodType,
    dates: query.dates,
    cities: query.cities,
    services: query.services,
    billTypes: query.billTypes,
    caseTypes: query.caseTypes,
  });

  const body = await cached(key, 120_000, () =>
    getDepoCharts(query, context.scope.permittedCities),
  );

  return respondJson(request, body);
});
