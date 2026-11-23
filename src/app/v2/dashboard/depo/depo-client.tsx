/**
 * The v2 depo page.
 *
 * Three endpoints back this screen, each owning one concern:
 *
 * - `/depo/table`    — one page of rows; paging/sorting never re-derives cards
 * - `/depo/charts`   — KPI totals + per-service/per-city aggregates over the
 *                      whole filtered set
 * - `/depo/estimate` — the completion projection (v1's four queries in one)
 *
 * Filters live in the URL through `useUrlParams` and every endpoint receives
 * the identical query object, so a shared link reproduces the whole screen while
 * the grid only ever holds one page. This is what v1 could not do: it downloaded
 * every depo row to aggregate in the browser, which is why the monthly view was
 * effectively unusable.
 *
 * The table itself is the motion `Table` from `~/components/motion/table`:
 * virtualized, sortable, resizable and RTL-aware. It is client-side over the
 * page it is given, and runs with `manualSorting` so the server's `ORDER BY`
 * (and its tiebreakers) always wins.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useUrlParams } from "~/hooks/use-url-params";
import { Table } from "~/components/motion/table";
import type { SortState } from "~/components/motion/table";
import {
  useDepoCharts,
  useDepoEstimate,
  useDepoOptions,
  useDepoTable,
} from "../_lib/v2-api";
import type { DepoTableRow } from "~/server/ramp-performance/params";
import { buildDepoColumns } from "./columns";
import { DepoColumnsMenu } from "./components/depo-columns-menu";
import { DepoPagination } from "./components/depo-pagination";
import { DepoCards } from "./components/depo-cards";
import { DepoToolbar } from "./components/depo-toolbar";
import {
  depoActiveFilterCount,
  resolveDepoUrlState,
  toDepoQuery,
  type DepoSearchParams,
  type DepoUrlState,
} from "./depo-state";

type DepoClientProps = {
  searchParams: DepoSearchParams;
};

/**
 * Reads the query string and hands it to `DepoClient` as plain props.
 *
 * This lives in the client module (and the page's Suspense boundary) because
 * `useSearchParams` is client-only. `layout.tsx` stays a server component so it
 * can hold the auth gate.
 */
export function DepoMount() {
  const searchParams = useSearchParams();
  const search: DepoSearchParams = {};
  for (const [key, value] of searchParams.entries()) {
    (search as Record<string, string>)[key] = value;
  }
  return <DepoClient searchParams={search} />;
}

/** A row's identity across pages: the grain `/depo/table` groups by. */
function depoRowId(row: DepoTableRow): string {
  return [
    row.CityName,
    row.ServiceName,
    row.BillType ?? "",
    row.CaseType ?? "",
  ].join("|");
}

/** Columns that must stay visible: the positional anchor. */
const LOCKED_COLUMNS = new Set<string>(["rowNumber"]);

export function DepoClient({ searchParams }: DepoClientProps) {
  const { params, updateParams, resetParams } = useUrlParams<DepoUrlState>(
    resolveDepoUrlState(searchParams),
    { replace: true },
  );

  const query = useMemo(() => toDepoQuery(params), [params]);

  const tableQuery = useDepoTable(query);
  const chartsQuery = useDepoCharts(query);
  const estimateQuery = useDepoEstimate(query);
  const optionsQuery = useDepoOptions();

  const rows = tableQuery.data?.rows ?? [];
  const total = tableQuery.data?.total ?? 0;

  const allColumns = useMemo(
    // Row numbers stay absolute across pages: page 2 of 50 starts at 51.
    () => buildDepoColumns((params.page - 1) * params.pageSize),
    [params.page, params.pageSize],
  );

  const sorting: SortState | null = params.sort
    ? { key: params.sort, direction: params.dir }
    : null;

  /**
   * Local-first column visibility. Kept off the URL on purpose: the previous
   * grid kept it in component state too, and hiding a column is not a filter —
   * two links that differ only in that would return the same rows.
   */
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const columns = useMemo(() => {
    const hidden = new Set(hiddenColumns);
    return allColumns.filter(
      (column) => !hidden.has(column.key) || LOCKED_COLUMNS.has(column.key),
    );
  }, [allColumns, hiddenColumns]);

  const handleSortChange = useCallback(
    (next: SortState | null) => {
      // Cycle end (third click) clears the sort server-side, which falls back
      // to `CityName`; page resets either way because the order changed.
      updateParams({
        sort: next?.key ?? "",
        dir: next?.direction ?? "asc",
        page: 1,
      });
    },
    [updateParams],
  );

  const options = optionsQuery.data;
  const activeFilters = depoActiveFilterCount(params);

  const handleFilterChange = useCallback(
    (patch: Partial<DepoUrlState>) => updateParams(patch),
    [updateParams],
  );

  const initialLoading = tableQuery.isFetching && !tableQuery.data;

  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DepoToolbar
        state={params}
        cities={options?.cities ?? []}
        services={options?.services ?? []}
        billTypes={options?.billTypes ?? []}
        caseTypes={options?.caseTypes ?? []}
        optionsLoading={optionsQuery.isFetching}
        activeFilters={activeFilters}
        total={total}
        onFilterChange={handleFilterChange}
        onReset={resetParams}
      />

      {/* The table is the primary work surface: it gets the whole remaining
          height and scrolls internally, with the cards scroll-adjacent below. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 pb-1 pt-1">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <p className="text-[11px] text-primary/45">
            هر تغییر فیلتر در پایگاه داده محاسبه می‌شود؛ فقط یک صفحه از ردیف‌ها
            در مرورگر نگه داشته می‌شود.
          </p>
          <DepoColumnsMenu
            options={allColumns.map((column) => ({
              key: column.key,
              header:
                typeof column.header === "string" ? column.header : column.key,
              locked: LOCKED_COLUMNS.has(column.key),
            }))}
            hidden={hiddenColumns}
            onToggle={(key) =>
              setHiddenColumns((prev) =>
                prev.includes(key)
                  ? prev.filter((value) => value !== key)
                  : [...prev, key],
              )
            }
            onReset={() => setHiddenColumns([])}
          />
        </div>

        <div className="min-h-0 flex-1">
          <Table<DepoTableRow>
            data={rows}
            columns={columns}
            getRowId={depoRowId}
            sort={sorting}
            onSortChange={handleSortChange}
            // The server owns the ORDER BY; re-sorting one page here would
            // silently disagree with the next page.
            manualSorting
            resizable
            minColumnWidth={72}
            // Reordering is session-scoped, like the old grid's: the order
            // lives inside the table and survives paging because the column
            // keys are stable. The drop index is measured against each
            // header's visual midpoint, so it follows RTL column order.
            reorderable
            rowHeight={38}
            overscan={12}
            loading={initialLoading}
            skeletonRows={Math.min(params.pageSize, 12)}
            emptyState="داده‌ای برای این بازه یافت نشد"
            labels={{
              resizeColumn: "تغییر عرض ستون {column}",
              reorderColumn: "جابه‌جایی ستون {column}",
              empty: "داده‌ای برای این بازه یافت نشد",
            }}
            // The wrapper paints the frame; the table fills it so the header's
            // sticky offset stays pinned to the scroll container.
            className="h-full rounded-xl"
          />
        </div>

        <DepoPagination
          className="shrink-0"
          page={params.page}
          pageSize={params.pageSize}
          total={total}
          loading={tableQuery.isFetching}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(pageSize) => updateParams({ pageSize, page: 1 })}
        />
      </div>

      {tableQuery.isError ? (
        <p className="border-t border-border-color/10 px-3 py-2 text-xs text-red-500">
          دریافت داده‌های دپو ناموفق بود.
        </p>
      ) : null}

      {/* Summary cards, under the table. `shrink-0` keeps them fully visible
          while the table above absorbs the remaining height. */}
      <div className="shrink-0 border-t border-border-color/10 bg-third/40 px-3 py-3">
        <DepoCards
          charts={chartsQuery.data}
          estimate={estimateQuery.data}
          loading={chartsQuery.isFetching || estimateQuery.isFetching}
        />
      </div>
    </div>
  );
}
