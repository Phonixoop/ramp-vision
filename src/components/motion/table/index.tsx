"use client";
// Adapted from beui.dev/components/motion/table for this project: Radix-era
// `shadcn` tokens replaced with the app's `--primary` / `--border-color` triad,
// physical direction utilities replaced with logical ones, and a
// `manualSorting` escape hatch added for server-paginated data.

import { useVirtualizer } from "@tanstack/react-virtual-v9";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Checkbox } from "~/components/motion/checkbox";
import { cn } from "~/lib/utils";
import { SkeletonRows } from "./skeleton-rows";
import { TableHeader } from "./table-header";
import type { HeaderCellRefs, TableProps } from "./types";
import { useColumnReorder } from "./use-column-reorder";
import { useColumnResize } from "./use-column-resize";
import { useColumnSort } from "./use-column-sort";
import { useRowSelection } from "./use-row-selection";
import { alignText, CHECKBOX_PX, CHECKBOX_WIDTH, readCell } from "./utils";

export { type TableMessages, tableMessages } from "./messages";
export type { SortDirection, SortState, TableColumn, TableProps } from "./types";

const DEFAULT_ROOT_FONT_SIZE = 16;

/**
 * What one `rem` is worth here, in px. The default until the first client
 * layout, so the server and the hydrating client emit the same floor.
 */
function useRootFontSize() {
  const [size, setSize] = useState(DEFAULT_ROOT_FONT_SIZE);
  useEffect(() => {
    const measured = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    if (measured > 0) setSize(measured);
  }, []);
  return size;
}

/**
 * The absolute width a column declared, in px, or null when it declared a share
 * of the remainder instead (`fr`, `%`, `auto`, `calc()`, nothing at all).
 */
function resolveColumnWidth(
  width: string | undefined,
  rootFontSize: number,
): number | null {
  if (!width) return null;
  const value = Number.parseFloat(width);
  if (!Number.isFinite(value)) return null;
  if (width.endsWith("px")) return value;
  if (width.endsWith("rem")) return value * rootFontSize;
  return null;
}

/** Persian placeholder strings, so a bare <Table> is still readable here. */
const DEFAULT_LABELS: TableProps<unknown>["labels"] = {
  empty: "داده‌ای برای نمایش وجود ندارد",
  selectAll: "انتخاب همه ردیف‌ها",
  selectRow: "انتخاب ردیف {row}",
  resizeColumn: "تغییر عرض ستون {column}",
  reorderColumn: "جابه‌جایی ستون {column}",
};

export function Table<T>({
  data,
  columns,
  getRowId,
  selectable = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
  resizable = false,
  minColumnWidth = 64,
  onColumnResize,
  reorderable = false,
  onColumnOrderChange,
  rowHeight = 44,
  height,
  overscan = 10,
  onEndReached,
  loading = false,
  skeletonRows = 3,
  emptyState,
  labels,
  className,
}: TableProps<T>) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thRefs: HeaderCellRefs = useRef<Record<string, HTMLTableCellElement | null>>(
    {},
  );

  const rows = useMemo(
    () =>
      data.map((row, index) => ({
        row,
        id: getRowId ? getRowId(row, index) : String(index),
      })),
    [data, getRowId],
  );

  const { orderedColumns, dragKey, dropIndex, startReorder, moveReorder, endReorder } =
    useColumnReorder({ columns, thRefs, onColumnOrderChange });

  const { sort, sortedRows, toggleSort } = useColumnSort({
    rows,
    columns,
    sort: sortProp,
    defaultSort,
    onSortChange,
    manual: manualSorting,
  });

  const { widths, startResize, moveResize, endResize } = useColumnResize({
    orderedColumns,
    thRefs,
    minColumnWidth,
    onColumnResize,
  });

  const { selected, allSelected, someSelected, toggleAll, toggleRow } =
    useRowSelection({
      sortedRows,
      selectedRowIds,
      defaultSelectedRowIds,
      onSelectionChange,
    });

  // The sticky header is one `rowHeight` tall and sits *above* row 0 inside the
  // same scroll box, so the virtual list's origin is offset by it. `scrollMargin`
  // tells the virtualizer where the items actually begin; without it every
  // computed offset is short by a header and the render window drifts up as you
  // scroll past the first screen.
  const headerHeight = rowHeight;
  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
    scrollMargin: headerHeight,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  // `start`/`end` are measured against the scroll container, so both include
  // `scrollMargin` (the sticky header's height). The tbody sits *below* that
  // header, hence `start - scrollMargin` for the leading spacer and
  // `totalSize - end` for the trailing one: together with the rendered rows
  // they add up to exactly `totalSize - scrollMargin`, the tbody's full height.
  const paddingTop =
    virtualItems.length > 0
      ? Math.max(0, virtualItems[0]!.start - headerHeight)
      : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? Math.max(
          0,
          totalSize - virtualItems[virtualItems.length - 1]!.end,
        )
      : 0;

  // The table always fills its container (`w-full`) and the trailing filler
  // column absorbs the slack; `minWidth` below is what makes it overflow and
  // scroll once the columns' total width exceeds the viewport. Upstream's
  // `w-max` switch after the first resize made the table shrink-wrap and jump
  // narrower, which is why it is not reproduced here.
  const rootFontSize = useRootFontSize();
  // In a container narrower than the columns, `table-layout: fixed` shrinks
  // every column toward zero instead of scrolling. Floor the table at what the
  // columns asked for, then let the viewport scroll past it.
  const minTableWidth = useMemo(() => {
    const total = orderedColumns.reduce((sum, column) => {
      const resized = widths[column.key];
      if (resized != null) return sum + resized;
      const declared = resolveColumnWidth(column.width, rootFontSize);
      if (declared != null) return sum + declared;
      return sum + minColumnWidth;
    }, selectable ? CHECKBOX_PX : 0);
    return Math.round(total);
  }, [minColumnWidth, orderedColumns, rootFontSize, selectable, widths]);

  // Infinite scroll: fire onEndReached once per near-bottom dwell, paused while
  // loading; the guard resets when the load completes.
  const endReachedRef = useRef(false);
  useEffect(() => {
    if (!loading) endReachedRef.current = false;
  }, [loading]);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onEndReached || loading || endReachedRef.current) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < rowHeight * 4) {
      endReachedRef.current = true;
      onEndReached();
    }
  }, [onEndReached, loading, rowHeight]);

  // Real columns + checkbox; the trailing filler adds one more in colSpans.
  const leadColumns = columns.length + (selectable ? 1 : 0);
  const translated = useMemo<typeof labels>(
    () => ({ ...DEFAULT_LABELS, ...labels }),
    [labels],
  );
  // `useMessages` was dropped with the provider: resolve against the merged
  // labels, then the message defaults, so callers only pass what they change.
  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      const template =
        (translated as Record<string, string | undefined>)[key] ?? key;
      if (!values) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = values[name];
        return value === undefined ? match : String(value);
      });
    },
    [translated],
  );

  return (
    <div
      className={cn(
        // Deliberate divider choice: `--border-color` is a near-black (light
        // theme) / near-white (dark theme) triple, so a plain `border-border`
        // — undefined here and falling back to `currentColor` — reads as a
        // bright hairline. The frame and the header's bottom edge use /15, the
        // row separators /8: structure you can see, no glare.
        // Transparent, not `bg-secondary`: the row area should sit on the page's
        // own `bg-third` panel exactly as the ReUI container did.
        "flex w-full flex-col overflow-hidden rounded-xl border border-border-color/15 bg-transparent text-sm text-primary",
        className,
      )}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        // A `height` prop pins the viewport; without one the scroll box takes
        // whatever the flex parent has left, which is what the depo page wants
        // (`min-h-0` so it can actually shrink and scroll).
        className={cn("overflow-auto", height == null && "min-h-0 flex-1")}
        style={height != null ? { height } : undefined}
      >
        <table
          className="w-full border-collapse"
          style={{
            tableLayout: "fixed",
            minWidth: `max(100%, ${minTableWidth}px)`,
          }}
        >
          <colgroup>
            {selectable ? <col style={{ width: CHECKBOX_WIDTH }} /> : null}
            {orderedColumns.map((column) => {
              const override = widths[column.key];
              const width = override ? `${override}px` : column.width;
              return <col key={column.key} style={width ? { width } : undefined} />;
            })}
            {/* Empty filler owns the leftover space — no gap, content unpinned. */}
            <col />
          </colgroup>

          <TableHeader
            columns={orderedColumns}
            rowHeight={rowHeight}
            reduce={!!reduce}
            thRefs={thRefs}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={toggleAll}
            sort={sort}
            onToggleSort={toggleSort}
            resizable={resizable}
            onResizeStart={startResize}
            onResizeMove={moveResize}
            onResizeEnd={endResize}
            reorderable={reorderable}
            dragKey={dragKey}
            dropIndex={dropIndex}
            onReorderStart={startReorder}
            onReorderMove={moveReorder}
            onReorderEnd={endReorder}
            t={t}
          />

          <tbody>
            {sortedRows.length === 0 ? (
              loading ? (
                <SkeletonRows
                  count={Math.max(1, Math.ceil((height ?? rowHeight * 10) / rowHeight))}
                  columns={orderedColumns}
                  selectable={selectable}
                  rowHeight={rowHeight}
                />
              ) : (
                <tr>
                  <td
                    colSpan={leadColumns + 1}
                    className="px-4 py-12 text-center text-xs text-primary/45"
                  >
                    {emptyState ?? t("empty")}
                  </td>
                </tr>
              )
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {virtualItems.map((vItem) => {
                  const entry = sortedRows[vItem.index]!;
                  const isSelected = selected.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      data-selected={isSelected}
                      style={{ height: rowHeight }}
                      className={cn(
                        // Row separators at /8: the faintest value that still
                        // reads as a divider on `bg-secondary`. Chosen over
                        // `border-border` (undefined here → currentColor) and
                        // over /15 (reserved for the header's bottom edge).
                        "border-b border-border-color/[0.08] transition-colors last:border-b-0",
                        "data-[selected=true]:bg-primary/[0.04]",
                        "hover:bg-primary/[0.03]",
                      )}
                    >
                      {selectable ? (
                        <td className="text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(entry.id)}
                              aria-label={t("selectRow", {
                                row: vItem.index + 1,
                              })}
                            />
                          </div>
                        </td>
                      ) : null}
                      {orderedColumns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "overflow-hidden text-ellipsis whitespace-nowrap px-3 text-primary/85",
                            alignText(column.align),
                          )}
                        >
                          {readCell(entry.row, column, vItem.index)}
                        </td>
                      ))}
                      <td aria-hidden />
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {loading ? (
                  <SkeletonRows
                    count={skeletonRows}
                    columns={orderedColumns}
                    selectable={selectable}
                    rowHeight={rowHeight}
                  />
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
