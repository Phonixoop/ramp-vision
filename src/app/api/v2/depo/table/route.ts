import {
  cacheKey,
  cached,
  parseQuery,
  requireRouteContext,
  respondJson,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import { depoTableQuerySchema } from "~/server/ramp-performance/params";
import { getDepoTable } from "~/server/ramp-performance/depo";

/**
 * One page of depo rows.
 *
 * Split from the charts/estimate endpoints on purpose: in v1 all three shared a
 * single unpaginated fetch, which is exactly why the depo table could not
 * paginate. Now the grid pages while the cards read their own cached endpoints.
 */
export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(depoTableQuerySchema, url.searchParams);

  const key = cacheKey("depo-table", context.scope.permittedCities, query);

  const body = await cached(key, 60_000, () =>
    getDepoTable(query, context.scope.permittedCities),
  );

  return respondJson(request, body);
});
