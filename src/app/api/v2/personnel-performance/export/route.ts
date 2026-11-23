import { PersonnelPerformanceTranslate } from "~/constants/personnel-performance";
import {
  parseQuery,
  requireRouteContext,
  routeHandler,
} from "~/server/ramp-performance/route-helpers";
import {
  exportQuerySchema,
  type PersonnelTableRow,
} from "~/server/ramp-performance/params";
import { iteratePersonnelRows } from "~/server/ramp-performance/personnel-table";
import { PERFORMANCE_MEASURE_COLUMNS } from "~/server/db/ramp-schema";

/**
 * Streams the full filtered set as CSV.
 *
 * Two differences from v1's export, both intentional:
 * 1. The rows come from the same SQL pipeline as the grid, so what you download
 *    matches what you see — v1 exported whatever the browser had aggregated.
 * 2. It streams: the response starts before the query finishes, and memory stays
 *    at one 1,000-row page instead of the entire result set.
 */

/** Column order and Persian headers, matching the v1 export labels. */
const COLUMNS: { key: keyof PersonnelTableRow; header: string }[] = [
  { key: "NameFamily", header: PersonnelPerformanceTranslate.NameFamily },
  { key: "NationalCode", header: PersonnelPerformanceTranslate.NationalCode },
  { key: "PersonnelCode", header: PersonnelPerformanceTranslate.PersonnelCode },
  { key: "CityName", header: PersonnelPerformanceTranslate.CityName },
  { key: "Role", header: PersonnelPerformanceTranslate.Role },
  { key: "RoleType", header: PersonnelPerformanceTranslate.RoleType },
  { key: "ContractType", header: PersonnelPerformanceTranslate.ContractType },
  { key: "ProjectType", header: PersonnelPerformanceTranslate.ProjectType },
  { key: "DateInfo", header: PersonnelPerformanceTranslate.DateInfo },
  ...PERFORMANCE_MEASURE_COLUMNS.map((column) => ({
    key: column as keyof PersonnelTableRow,
    header: PersonnelPerformanceTranslate[column],
  })),
  { key: "DirectPerFormance", header: PersonnelPerformanceTranslate.DirectPerFormance },
  { key: "InDirectPerFormance", header: PersonnelPerformanceTranslate.InDirectPerFormance },
  { key: "TotalPerformance", header: PersonnelPerformanceTranslate.TotalPerformance },
];

/** RFC 4180 quoting; Excel needs the BOM to read Persian correctly. */
function csvCell(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvLine(values: unknown[]): string {
  return values.map(csvCell).join(",") + "\r\n";
}

export const GET = routeHandler(async (request) => {
  const context = await requireRouteContext();
  const url = new URL(request.url);
  const query = parseQuery(exportQuerySchema, url.searchParams);

  const workDays = query.workDays ? (query.workDaysCount ?? null) : null;
  const rows = iteratePersonnelRows(
    query,
    context.scope.permittedCities,
    workDays,
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\uFEFF"));
        controller.enqueue(
          encoder.encode(csvLine(COLUMNS.map((column) => column.header))),
        );

        for await (const row of rows) {
          controller.enqueue(
            encoder.encode(csvLine(COLUMNS.map((column) => row[column.key]))),
          );
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  const filename = `personnel-performance-${query.periodType}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      "Cache-Control": "no-store",
      // Disable proxy buffering so rows arrive as they are produced.
      "X-Accel-Buffering": "no",
    },
  });
});
