import {
  cacheKey,
  cached,
  parseQuery,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { depoTableQuerySchema } from "~/server/ramp-performance/params";
import { getDepoEstimate } from "~/server/ramp-performance/depo";

/**
 * Depo completion estimate.
 *
 * v1 ran four separate round trips (last-available-date probe, previous-period
 * capacity, latest depo, entry total) and rebuilt its WHERE clause by string
 * concatenation five times. Here it is one round trip with one predicate builder.
 */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(depoTableQuerySchema, url.searchParams);

  const key = cacheKey("depo-estimate", context.scope.permittedCities, {
    periodType: query.periodType,
    dates: query.dates,
    cities: query.cities,
    services: query.services,
    billTypes: query.billTypes,
    caseTypes: query.caseTypes,
  });

  const body = await cached(key, 120_000, () =>
    getDepoEstimate(query, context.scope.permittedCities),
  );

  return respondJson(request, body);
});
