// Minimal Comlink worker that holds Arrow IPC (ArrayBuffer)
// and performs filtering/CSV export off the main thread.
// NOTE: This intentionally avoids app-specific schema assumptions.

import * as Comlink from "comlink";

export type RawFilters = Record<string, unknown>;
export type ResolvedFilters = Record<string, unknown>;

type ViewKind = "table" | "charts" | "table+charts";

export type ApplyFiltersResult = {
  resolvedFilters: ResolvedFilters;
  results: {
    validOptions?: Record<string, unknown>;
    footerTotals?: Record<string, number>;
    chartSeriesArrow?: ArrayBuffer;
    tableWindowArrow?: ArrayBuffer;
  };
};

let originalBuffer: ArrayBuffer | null = null;

function normalizeFilters(raw: RawFilters): ResolvedFilters {
  // Placeholder normalization; real logic should mirror server validation
  // and ensure period/date logic stays identical to the UI.
  const out: ResolvedFilters = { ...raw };
  return out;
}

function shallowFilterBuffer(buf: ArrayBuffer): ArrayBuffer {
  // This placeholder returns the same buffer. Replace with real Arrow filtering.
  // We clone into a new ArrayBuffer so transfer semantics don’t detach original.
  const u8 = new Uint8Array(buf);
  const clone = new Uint8Array(u8.length);
  clone.set(u8);
  return clone.buffer;
}

async function init(buffer: ArrayBuffer) {
  // Keep a reference to raw Arrow IPC (or Parquet) bytes in the worker.
  originalBuffer = buffer;
}

async function applyFilters(
  rawFilters: RawFilters,
  view: ViewKind,
): Promise<ApplyFiltersResult> {
  if (!originalBuffer) {
    throw new Error("Worker not initialized: call init(buffer) first");
  }

  const resolved = normalizeFilters(rawFilters);

  // Compute filtered views. Replace with real Arrow computation.
  const needTable = view === "table" || view === "table+charts";
  const needCharts = view === "charts" || view === "table+charts";

  const tableWindowArrow = needTable
    ? shallowFilterBuffer(originalBuffer)
    : undefined;
  const chartSeriesArrow = needCharts
    ? shallowFilterBuffer(originalBuffer)
    : undefined;

  const results = {
    validOptions: undefined as Record<string, unknown> | undefined,
    footerTotals: undefined as Record<string, number> | undefined,
    chartSeriesArrow,
    tableWindowArrow,
  };

  // Use Comlink.transfer to keep the main thread responsive and transfer ownership.
  const transferables: ArrayBuffer[] = [];
  if (results.chartSeriesArrow) transferables.push(results.chartSeriesArrow);
  if (results.tableWindowArrow) transferables.push(results.tableWindowArrow);

  return Comlink.transfer(
    { resolvedFilters: resolved, results },
    transferables,
  );
}

async function exportCSV(
  resolvedFilters: ResolvedFilters,
  onChunk: (chunk: string) => void,
): Promise<void> {
  if (!originalBuffer) {
    throw new Error("Worker not initialized: call init(buffer) first");
  }
  // Placeholder: emit a tiny CSV derived from buffer metadata. Replace with real Arrow->CSV.
  // We simulate chunked streaming to demonstrate backpressure-friendly behavior.
  const header = "col1,col2,col3\n";
  const size = (originalBuffer.byteLength || 0).toString();
  const rows = [
    `size,${size},bytes\n`,
    `filters,${Object.keys(resolvedFilters).length},fields\n`,
  ];
  const chunks = [header, ...rows];
  for (const c of chunks) {
    // eslint-disable-next-line no-await-in-loop
    await onChunk(c);
  }
}

const api = { init, applyFilters, exportCSV };
export type DataWorker = typeof api;

Comlink.expose(api);
