import {
  cacheKey,
  cached,
  parseQuery,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { filterQuerySchema } from "~/server/ramp-performance/params";
import { getPersonnelOptions } from "~/server/ramp-performance/personnel-summary";

/**
 * Facet values for the filter popovers.
 *
 * Cached for 5 minutes: these lists change when the nightly load lands, not
 * while a user is filtering, and the underlying DISTINCT scans are the slowest
 * part of first paint.
 */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(filterQuerySchema, url.searchParams);

  const key = cacheKey("pp-options", context.scope.permittedCities, {
    dateInfos: query.dateInfos,
    cities: query.cities,
  });

  const body = await cached(key, 300_000, () =>
    getPersonnelOptions(
      query,
      context.scope.permittedCities,
    ),
  );

  return respondJson(request, body);
});
