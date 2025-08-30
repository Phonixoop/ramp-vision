// import { NextRequest } from "next/server";
// import { getExportFilters } from "../../../../../server/lib/filters";
// import { buildWhere, streamQuery } from "../../../../../server/db/sql";
// import { signHmacSHA256 } from "../../../../../server/lib/filters";
// import crypto from "crypto";
// import type sql from "mssql";

// export const dynamic = "force-dynamic";

// function verifySignature(
//   key: string,
//   fmt: "csv" | "zip",
//   sig: string,
// ): boolean {
//   const secret = process.env.EXPORT_SIGNING_SECRET || "dev-secret-change-me";
//   const expected = signHmacSHA256(`${key}:${fmt}`, secret);
//   return crypto.timingSafeEqual(
//     Buffer.from(expected, "hex") as unknown as Uint8Array,
//     Buffer.from(sig, "hex") as unknown as Uint8Array,
//   );
// }

// function toCSVLine(obj: Record<string, unknown>, columns: string[]): string {
//   const esc = (v: unknown) => {
//     if (v == null) return "";
//     const s = String(v);
//     if (s.includes('"') || s.includes(",") || s.includes("\n")) {
//       return '"' + s.replace(/"/g, '""') + '"';
//     }
//     return s;
//   };
//   return columns.map((c) => esc(obj[c])).join(",") + "\n";
// }

// async function streamCSV(
//   where: ReturnType<typeof buildWhere>,
//   request: NextRequest,
// ) {
//   const columns = ["PersonId", "Department", "Date", "MetricA", "MetricB"];
//   const header = columns.join(",") + "\n";

//   const stream = new ReadableStream<Uint8Array>({
//     start: async (controller) => {
//       const enc = new TextEncoder();
//       controller.enqueue(enc.encode(header));
//       const req = await streamQuery(
//         where,
//         request.signal as any as AbortSignal,
//       );

//       req.on("row", (row: Record<string, unknown>) => {
//         const line = toCSVLine(row, columns);
//         controller.enqueue(enc.encode(line));
//       });
//       req.on("error", (err: Error) => {
//         controller.error(err);
//       });
//       req.on("done", () => {
//         controller.close();
//       });
//     },
//     cancel: () => {
//       // streamQuery wires cancellation via AbortSignal already
//     },
//   });

//   return stream;
// }

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const key = searchParams.get("key") || "";
//   const fmt = (searchParams.get("fmt") || "csv") as "csv" | "zip";
//   const sig = searchParams.get("sig") || "";

//   if (!key || !sig || !verifySignature(key, fmt, sig)) {
//     return new Response("Invalid signature", { status: 403 });
//   }

//   const filters = getExportFilters(key);
//   if (!filters) {
//     // Key may not be in memory (after deploy/restart). Respond 404 so client can re-sign.
//     return new Response("Export cache miss", { status: 404 });
//   }

//   const where = buildWhere(filters);

//   const etag = key;
//   const cacheHeaders = {
//     "Cache-Control": "public, s-maxage=86400, immutable",
//     ETag: etag,
//   } as const;

//   // Freshness/ETag handling
//   const ifNoneMatch = request.headers.get("if-none-match");
//   if (ifNoneMatch === etag) {
//     return new Response(null, { status: 304, headers: cacheHeaders });
//   }

//   if (fmt === "csv") {
//     const body = await streamCSV(where, request);
//     return new Response(body, {
//       status: 200,
//       headers: {
//         "Content-Type": "text/csv; charset=utf-8",
//         "Content-Disposition": 'attachment; filename="personnel.csv"',
//         ...cacheHeaders,
//       },
//     });
//   }

//   // fmt === 'zip': stream CSV into a ZIP entry using archiver
//   const archiver = (await import("archiver")).default;
//   const { PassThrough, Readable } = await import("stream");
//   const { ReadableStream: NodeReadableStream } = await import("stream/web");

//   const zip = archiver("zip", { zlib: { level: 9 } });

//   // Wire CSV stream into the archive as a file
//   const csvStream = await streamCSV(where, request);
//   const nodeCSV = Readable.fromWeb(
//     csvStream as unknown as NodeReadableStream<any>,
//   );
//   zip.append(nodeCSV, { name: "personnel.csv" });
//   zip.finalize();

//   const pass = new PassThrough();
//   zip.pipe(pass);

//   const body = Readable.toWeb(pass) as unknown as ReadableStream;
//   return new Response(body, {
//     status: 200,
//     headers: {
//       "Content-Type": "application/zip",
//       "Content-Disposition": 'attachment; filename="personnel.zip"',
//       ...cacheHeaders,
//     },
//   });
// }
