/**
 * The v2 personnel performance table.
 *
 * Data flow, and why it is shaped this way:
 *
 *   URL  →  `toTableQuery`  →  /api/v2/personnel-performance/{table,summary,options}
 *
 * - The **grid** only ever holds one page (`pageSize` rows). That is the whole
 *   point of this page: the browser payload no longer scales with the filter.
 * - The **footer** is fed by `/summary`, which aggregates the *entire* filtered
 *   set in SQL. It therefore stays correct while the grid shows page 3 of 40.
 * - `keepPreviousData` keeps the previous page visible during a refetch, so
 *   paging and sorting never flash an empty table.
 *
 * All state lives in the URL via `useUrlParams`, so a filtered table can be
 * shared, bookmarked and reloaded without losing position.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTable } from "@tanstack/react-table-v9";
import type { PaginationState, SortingState } from "@tanstack/react-table-v9";

import { useUrlParams } from "~/hooks/use-url-params";

import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
} from "~/components/reui/data-grid/data-grid";
import { DataGridPagination } from "~/components/reui/data-grid/data-grid-pagination";
import { DataGridScrollArea } from "~/components/reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "~/components/reui/data-grid/data-grid-table";
import { DataGridColumnVisibility } from "~/components/reui/data-grid/data-grid-column-visibility";
import { cn } from "~/lib/utils";
import {
  personnelExportUrl,
  usePersonnelOptions,
  usePersonnelSummary,
  usePersonnelTable,
} from "../../_lib/v2-api";
import type { PersonnelTableRow } from "~/server/ramp-performance/params";
import { buildPersonnelColumns, type FooterTotals } from "./columns";
import { TableToolbar } from "./components/table-toolbar";
import {
  activeFilterCount,
  PAGE_SIZE_OPTIONS,
  resolveTableUrlState,
  toTableQuery,
  type TableSearchParams,
  type TableUrlState,
} from "./table-state";
import {
  readSavedDefaults,
  systemSelectDefaults,
  type SelectDefaults,
} from "../chart/model";

type TableClientProps = {
  searchParams: TableSearchParams;
};

/**
 * Reads the query string and passes it to `TableClient` as plain props.
 *
 * Lives in this client module (and the layout's Suspense boundary) because
 * `useSearchParams` is client-only, which lets `layout.tsx` stay a server
 * component so it can hold the auth gate.
 */
export function TableMount() {
  const searchParams = useSearchParams();
  const search: TableSearchParams = {};
  for (const [key, value] of searchParams.entries()) {
    (search as Record<string, string>)[key] = value;
  }
  return <TableClient searchParams={search} />;
}

export function TableClient({ searchParams }: TableClientProps) {
  // localStorage defaults are read once on mount (client-only) so the first
  // render matches the server HTML and the second adopts saved preferences.
  const [saved, setSaved] = useState<SelectDefaults | null>(null);
  useEffect(
    () => setSaved(readSavedDefaults() ?? systemSelectDefaults()),
    [],
  );

  const { params, updateParams, resetParams } = useUrlParams<TableUrlState>(
    resolveTableUrlState(searchParams, saved),
    { replace: true },
  );

  // Options first: their newest DateInfo is the fallback the query needs when
  // the URL selects no roster snapshot.
  const optionsQuery = usePersonnelOptions(null);
  const dateInfoFallback = useMemo(
    () => optionsQuery.data?.dateInfos?.slice(0, 1) ?? null,
    [optionsQuery.data?.dateInfos],
  );

  const query = useMemo(
    () => toTableQuery(params, dateInfoFallback),
    [params, dateInfoFallback],
  );

  const tableQuery = usePersonnelTable(query);
  const summaryQuery = usePersonnelSummary(query);

  const footer: FooterTotals | undefined = summaryQuery.data
    ? {
        totals: summaryQuery.data.totals,
        average: summaryQuery.data.average,
        total: summaryQuery.data.total,
      }
    : undefined;

  const columns = useMemo(
    () => buildPersonnelColumns(footer, (params.page - 1) * params.pageSize),
    [footer, params.page, params.pageSize],
  );

  const rows = tableQuery.data?.rows ?? [];
  const total = tableQuery.data?.total ?? 0;

  const pagination: PaginationState = {
    pageIndex: params.page - 1,
    pageSize: params.pageSize,
  };

  const sorting: SortingState = params.sort
    ? [{ id: params.sort, desc: params.dir === "desc" }]
    : [];

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    getRowId: (row: PersonnelTableRow) =>
      `${row.NationalCode}|${row.CityName}`,
    state: { pagination, sorting },
    // Server owns paging and sorting; the client must not re-slice or re-sort.
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.max(1, Math.ceil(total / params.pageSize)),
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      updateParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      updateParams({
        sort: first?.id ?? "",
        dir: first ? (first.desc ? "desc" : "asc") : "asc",
        page: 1,
      });
    },
  });

  const [exporting, setExporting] = useState(false);
  const handleExport = useCallback(() => {
    setExporting(true);
    // Streamed server-side; the browser never materialises the full set.
    window.location.href = personnelExportUrl(query);
    // The download has no completion event; clear the flag shortly after.
    setTimeout(() => setExporting(false), 4000);
  }, [query]);

  const activeFilters = activeFilterCount(params);

  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TableToolbar
        state={params}
        options={optionsQuery.data}
        optionsLoading={optionsQuery.isFetching}
        activeFilters={activeFilters}
        total={total}
        exporting={exporting}
        onFilterChange={(patch) => updateParams(patch)}
        onReset={() => resetParams()}
        onExport={handleExport}
      />

      <div className="min-h-0 flex-1 overflow-auto p-3">
        <DataGrid
          table={table}
          recordCount={total}
          isLoading={tableQuery.isFetching && !tableQuery.data}
          tableLayout={{
            width: "fixed",
            dense: true,
            headerSticky: true,
            columnsResizable: true,
          }}
          tableClassNames={{
            headerSticky: "sticky top-0 z-40 bg-fourth/95 backdrop-blur",
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-primary/50">
                هر تغییر فیلتر در پایگاه داده محاسبه می‌شود؛ فقط یک صفحه در
                مرورگر نگه داشته می‌شود.
              </p>
              <DataGridColumnVisibility
                table={table}
                trigger={
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-color/15 px-2.5 text-xs text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    ستون‌ها
                  </button>
                }
              />
            </div>

            <DataGridContainer>
              <DataGridScrollArea className="max-h-[calc(100vh-260px)]">
                <DataGridTable />
              </DataGridScrollArea>
            </DataGridContainer>

            <DataGridPagination
              sizes={PAGE_SIZE_OPTIONS}
              rowsPerPageLabel="ردیف در صفحه"
            />
          </div>
        </DataGrid>
      </div>

      {/* Footer totals come from /summary (full filtered set), never the page. */}
      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 border-t border-border-color/10 bg-third/60 px-3 py-2 text-[11px] text-primary/60",
          summaryQuery.isFetching && "opacity-60",
        )}
      >
        <span>
          مجموع عملکرد:{" "}
          <strong className="tabular-nums text-primary">
            {Number(footer?.totals?.TotalPerformance ?? 0).toFixed(2)}
          </strong>
        </span>
        <span>
          میانگین عملکرد:{" "}
          <strong className="tabular-nums text-primary">
            {Number(footer?.average?.TotalPerformance ?? 0).toFixed(2)}
          </strong>
        </span>
        <span>
          پرسنل نمایش‌داده‌شده:{" "}
          <strong className="tabular-nums text-primary">
            {(footer?.total ?? 0).toLocaleString("fa-IR")}
          </strong>
        </span>
        {params.work_days ? (
          <span className="text-accent">مبنای روزهای کاری فعال است</span>
        ) : null}
      </div>
    </div>
  );
}
