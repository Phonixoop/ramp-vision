import {
  cacheKey,
  cached,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { getDepoOptions } from "~/server/ramp-performance/depo";

/** Depo filter facets (cities, services, bill types, case types). */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();

  const key = cacheKey("depo-options", context.scope.permittedCities, {});

  const body = await cached(key, 300_000, () =>
    getDepoOptions(context.scope.permittedCities),
  );

  return respondJson(request, body);
});
