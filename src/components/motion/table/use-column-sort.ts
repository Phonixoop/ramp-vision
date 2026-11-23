import { useCallback, useMemo, useState } from "react";

import type { SortState, TableColumn, TableRow } from "./types";
import { readSortValue } from "./utils";

/**
 * Header-click sorting. Cycles asc → desc → none.
 *
 * With `manual` set the owner sorts (the server does, in this app): `sort` is
 * still reported so headers can show their arrow, but `data` is handed back
 * untouched in the order it arrived — re-sorting one page here would override
 * the server's `ORDER BY` and scramble its stable tiebreakers.
 */
export function useColumnSort<T>({
  rows,
  columns,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manual = false,
}: {
  rows: TableRow<T>[];
  columns: TableColumn<T>[];
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  manual?: boolean;
}) {
  const [internalSort, setInternalSort] = useState<SortState | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : internalSort;

  const commit = useCallback(
    (next: SortState | null) => {
      if (sortProp === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [sortProp, onSortChange],
  );

  const toggleSort = useCallback(
    (key: string) => {
      if (!sort || sort.key !== key) {
        commit({ key, direction: "asc" });
      } else if (sort.direction === "asc") {
        commit({ key, direction: "desc" });
      } else {
        commit(null);
      }
    },
    [sort, commit],
  );

  const sortedRows = useMemo(() => {
    if (manual || !sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = readSortValue(a.row, column);
      const bv = readSortValue(b.row, column);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns, manual]);

  return { sort, sortedRows, toggleSort };
}
