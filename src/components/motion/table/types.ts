import type { ReactNode } from "react";

import type { TableMessages } from "./messages";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
};

/**
 * Cell alignment. `start` / `end` are logical and are what RTL screens should
 * use; `left` / `right` are accepted for API compatibility and are interpreted
 * logically too (`left` → start, `right` → end), so nothing silently renders on
 * the wrong side when `dir="rtl"`.
 */
export type ColumnAlign = "start" | "end" | "center" | "left" | "right";

export type TableColumn<T> = {
  /** Stable key; also the default object property read for the cell + sort value. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Allow clicking the header to sort by this column. */
  sortable?: boolean;
  /** Cell text alignment (logical). Defaults to the document direction. */
  align?: ColumnAlign;
  /** Column width as a CSS length, e.g. "160px" or "1.4fr". Omit to share the rest. */
  width?: string;
  /**
   * Custom cell renderer. Falls back to `row[key]`.
   *
   * `index` is the row's zero-based position in the current page, so a column
   * like a row number can stay page-absolute (`pageOffset + index + 1`) without
   * the table having to know about paging.
   */
  cell?: (row: T, index: number) => ReactNode;
  /** Value used for client-side sorting. Falls back to `row[key]`. */
  sortValue?: (row: T) => string | number;
};

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  /** Stable id per row, required for correct selection across sorts. Defaults to row index. */
  getRowId?: (row: T, index: number) => string;
  /** Render a leading checkbox column with select-all in the header. */
  selectable?: boolean;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /**
   * Hand sorting to the owner (server-paginated data): `sort` still drives the
   * header arrows and `onSortChange` still fires, but `data` is rendered in the
   * order it arrived. Without this the table re-sorts the one page in hand,
   * which fights the server's `ORDER BY` and its tiebreakers.
   */
  manualSorting?: boolean;
  /** Allow dragging a header's inline-end edge to resize that column (RTL-aware). */
  resizable?: boolean;
  /** Minimum column width in px when resizing. */
  minColumnWidth?: number;
  onColumnResize?: (key: string, width: number) => void;
  /** Allow dragging a header grip to reorder columns (RTL-aware). */
  reorderable?: boolean;
  onColumnOrderChange?: (keys: string[]) => void;
  /** Fixed row height in px — required for virtualization. */
  rowHeight?: number;
  /** Scroll viewport height in px. Omit to fill the flex parent instead. */
  height?: number;
  /** Rows rendered above/below the viewport. */
  overscan?: number;
  /** Fires when the viewport scrolls near the bottom — load the next page. */
  onEndReached?: () => void;
  /** Currently fetching — shows skeleton rows and pauses `onEndReached`. */
  loading?: boolean;
  /** How many skeleton rows to show while loading more (default 3). */
  skeletonRows?: number;
  emptyState?: ReactNode;
  /** Override any built-in string. `{row}` and `{column}` fill the per-row and per-column labels. */
  labels?: Partial<TableMessages>;
  className?: string;
}

/** A data row paired with its stable id. */
export type TableRow<T> = { row: T; id: string };

/** Ref map from column key to its header cell, shared across the resize/reorder hooks. */
export type HeaderCellRefs = {
  current: Record<string, HTMLTableCellElement | null>;
};
