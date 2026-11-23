import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import { capturePointer, releasePointer } from "~/components/motion/touch";
import type { HeaderCellRefs, TableColumn } from "./types";
import { isRtlElement } from "./utils";

/**
 * Column resizing that respects writing direction.
 *
 * The handle sits on the header's *inline-end* edge (visual right in LTR,
 * visual left in RTL), so the drag delta has the opposite sign in RTL: pulling
 * the handle toward the inline-start edge must *grow* the column. Detected once
 * per gesture from the header cell's computed `direction`, because `dir` can be
 * set on any ancestor and nothing here should have to know where.
 *
 * `widthsRef` mirrors the state so the pointer handlers — which run between
 * renders — always measure against the widths actually on screen.
 */
export function useColumnResize<T>({
  orderedColumns,
  thRefs,
  minColumnWidth,
  onColumnResize,
}: {
  orderedColumns: TableColumn<T>[];
  thRefs: HeaderCellRefs;
  minColumnWidth: number;
  onColumnResize?: (key: string, width: number) => void;
}) {
  const [widths, setWidths] = useState<Record<string, number>>({});
  const widthsRef = useRef<Record<string, number>>({});
  const resizeRef = useRef<{
    key: string;
    startX: number;
    startWidth: number;
    /** Width as of the last move, so `endResize` never reads stale state. */
    lastWidth: number;
    /** `-1` when the delta must be negated (RTL), `+1` in LTR. */
    sign: 1 | -1;
  } | null>(null);

  const commit = useCallback((next: Record<string, number>) => {
    widthsRef.current = next;
    setWidths(next);
  }, []);

  const startResize = useCallback(
    (key: string, e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Freeze every column to its current pixel width so resizing one only
      // moves the trailing filler, never the other columns. In RTL the widths
      // are the same numbers — only the delta's sign changes.
      const snapshot = { ...widthsRef.current };
      for (const column of orderedColumns) {
        if (snapshot[column.key] == null) {
          const measured = thRefs.current[column.key]?.getBoundingClientRect()
            .width;
          snapshot[column.key] = measured ? Math.round(measured) : minColumnWidth;
        }
      }
      const startWidth = snapshot[key] ?? minColumnWidth;
      snapshot[key] = startWidth;
      commit(snapshot);

      resizeRef.current = {
        key,
        startX: e.clientX,
        startWidth,
        lastWidth: startWidth,
        sign: isRtlElement(e.currentTarget.parentElement) ? -1 : 1,
      };
      capturePointer(e.currentTarget, e.pointerId);
    },
    [commit, minColumnWidth, orderedColumns, thRefs],
  );

  const moveResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      if (!state) return;
      // RTL: the handle moved left, so `clientX - startX` is negative and the
      // sign flips it positive — dragging the inline-end edge outward always
      // grows the column, in both directions.
      const delta = (e.clientX - state.startX) * state.sign;
      const width = Math.max(minColumnWidth, Math.round(state.startWidth + delta));
      state.lastWidth = width;
      commit({ ...widthsRef.current, [state.key]: width });
    },
    [commit, minColumnWidth],
  );

  const endResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      resizeRef.current = null;
      releasePointer(e.currentTarget, e.pointerId);
      if (state) onColumnResize?.(state.key, state.lastWidth);
    },
    [onColumnResize],
  );

  return { widths, startResize, moveResize, endResize };
}
