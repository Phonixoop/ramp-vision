Personnel v2 (non-invasive) wiring notes

- Provider: wrap your page/segment with `PersonnelProvider` from `app/(personnel)/lib/PersonnelContext`.
- Init data: load Arrow IPC (ArrayBuffer) via fetch/FS and call `initData(buffer)` once.
- Set filters: call `setFilter(key, value)` as UI changes.
- Apply: call `applyFilters('table+charts')` to compute off-main-thread.
- Results: parse `results.tableWindowArrow` and `results.chartSeriesArrow` once per update.
- Export (client-worker): call `exportCSV()` for quick CSV directly in the browser.
- Export (server, cached): call tRPC `exports.getExportUrl` to get a signed URL and `window.location.href = url`.

Routers
- Add `src/server/api/routers/personnel_v2.ts` and `exports_v2.ts` to your tRPC root.

Server export
- Route handler: `app/api/export/personnel/route.ts` streams CSV or ZIP with cache headers and ETag.
- Requires env: `MSSQL_CONNECTION_STRING`, `EXPORT_SIGNING_SECRET`.

