"use client";

import { ChevronUp, GripVertical } from "lucide-react";
import { motion } from "motion/react";
import { type PointerEvent as ReactPointerEvent } from "react";

import { TOUCH_GESTURE_CLASS } from "~/components/motion/touch";
import { Checkbox } from "~/components/motion/checkbox";
import { EASE_OUT, SPRING_PRESS } from "~/components/motion/ease";
import { cn } from "~/lib/utils";
import type { TableTranslate } from "./messages";
import type { HeaderCellRefs, SortState, TableColumn } from "./types";
import { alignFlex, alignText } from "./utils";

export interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  rowHeight: number;
  reduce: boolean;
  thRefs: HeaderCellRefs;
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  sort: SortState | null;
  onToggleSort: (key: string) => void;
  resizable: boolean;
  onResizeStart: (key: string, e: ReactPointerEvent) => void;
  onResizeMove: (e: ReactPointerEvent) => void;
  onResizeEnd: (e: ReactPointerEvent) => void;
  reorderable: boolean;
  dragKey: string | null;
  dropIndex: number | null;
  onReorderStart: (key: string, e: ReactPointerEvent) => void;
  onReorderMove: (e: ReactPointerEvent) => void;
  onReorderEnd: (e: ReactPointerEvent) => void;
  t: TableTranslate;
}

/**
 * Header row. Sticky cells carry their own opaque background because Chromium
 * paints sticky `<th>` over scrolling cells without one.
 *
 * Every direction-dependent class here is logical:
 * - the resize handle sits at `end-0` — visual right in LTR, visual left in RTL,
 *   which is where the pointer expects a column's trailing edge to be;
 * - the drop indicator uses `start-0` / `end-0` rather than `left-0` / `right-0`.
 */
export function TableHeader<T>({
  columns,
  rowHeight,
  reduce,
  thRefs,
  selectable,
  allSelected,
  someSelected,
  onToggleAll,
  sort,
  onToggleSort,
  resizable,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  reorderable,
  dragKey,
  dropIndex,
  onReorderStart,
  onReorderMove,
  onReorderEnd,
  t,
}: TableHeaderProps<T>) {
  return (
    <thead>
      <tr style={{ height: rowHeight }}>
        {selectable ? (
          <th className="sticky top-0 z-20 bg-fourth/95 shadow-[inset_0_-1px_0_0_rgba(var(--border-color),0.15)] backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onCheckedChange={onToggleAll}
                aria-label={t("selectAll")}
              />
            </div>
          </th>
        ) : null}
        {columns.map((column, index) => {
          const active = sort?.key === column.key;
          const isDragging = dragKey === column.key;
          return (
            <th
              key={column.key}
              ref={(el) => {
                thRefs.current[column.key] = el;
              }}
              aria-sort={
                active
                  ? sort?.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : column.sortable
                    ? "none"
                    : undefined
              }
              data-drop={dragKey ? dropIndex === index : undefined}
              data-dropend={
                dragKey
                  ? dropIndex === columns.length && index === columns.length - 1
                  : undefined
              }
              className={cn(
                // The header's bottom edge is drawn as an inset shadow, not a
                // border: under `border-collapse` the border of a sticky cell
                // is dropped by Chrome/Firefox as soon as it starts scrolling.
                "group sticky top-0 z-20 bg-fourth/95 p-0 text-xs font-medium text-primary/55 shadow-[inset_0_-1px_0_0_rgba(var(--border-color),0.15)] backdrop-blur-sm",
                "data-[drop=true]:before:absolute data-[drop=true]:before:inset-y-0 data-[drop=true]:before:start-0 data-[drop=true]:before:z-10 data-[drop=true]:before:w-0.5 data-[drop=true]:before:bg-accent",
                "data-[dropend=true]:after:absolute data-[dropend=true]:after:inset-y-0 data-[dropend=true]:after:end-0 data-[dropend=true]:after:z-10 data-[dropend=true]:after:w-0.5 data-[dropend=true]:after:bg-accent",
              )}
            >
              <motion.div
                className={cn("flex h-full items-center", alignFlex(column.align))}
                style={{ height: rowHeight }}
                animate={
                  reduce
                    ? { opacity: isDragging ? 0.5 : 1 }
                    : {
                        scale: isDragging ? 1.04 : 1,
                        opacity: isDragging ? 0.5 : 1,
                      }
                }
                transition={SPRING_PRESS}
              >
                {reorderable ? (
                  <button
                    type="button"
                    aria-label={t("reorderColumn", {
                      column: typeof column.header === "string" ? column.header : column.key,
                    })}
                    onPointerDown={(e) => onReorderStart(column.key, e)}
                    onPointerMove={onReorderMove}
                    onPointerUp={onReorderEnd}
                    onPointerCancel={onReorderEnd}
                    className={cn(
                      "flex h-full w-5 cursor-grab touch-none items-center justify-center text-primary/25 transition-colors hover:text-primary/60 active:cursor-grabbing",
                      TOUCH_GESTURE_CLASS,
                    )}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.key)}
                    className={cn(
                      "flex h-full min-w-0 flex-1 select-none items-center gap-1 px-3 transition-colors hover:text-primary",
                      alignFlex(column.align),
                      active && "text-primary",
                    )}
                  >
                    <span className="truncate">{column.header}</span>
                    <motion.span
                      aria-hidden
                      className="inline-flex shrink-0"
                      animate={{
                        rotate: active && sort?.direction === "desc" ? 180 : 0,
                        opacity: active ? 1 : 0.3,
                      }}
                      transition={
                        reduce ? { duration: 0 } : { duration: 0.18, ease: EASE_OUT }
                      }
                    >
                      <ChevronUp className="h-3 w-3" />
                    </motion.span>
                  </button>
                ) : (
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate px-3",
                      alignText(column.align),
                    )}
                  >
                    {column.header}
                  </span>
                )}
              </motion.div>
              {resizable ? (
                <button
                  type="button"
                  aria-label={t("resizeColumn", {
                    column: typeof column.header === "string" ? column.header : column.key,
                  })}
                  tabIndex={-1}
                  onPointerDown={(e) => onResizeStart(column.key, e)}
                  onPointerMove={onResizeMove}
                  onPointerUp={onResizeEnd}
                  onPointerCancel={onResizeEnd}
                  className={cn(
                    // `end-0` = visual right in LTR, visual left in RTL: the
                    // trailing edge of the column in reading order, which is
                    // the edge the resize delta is measured against.
                    "absolute top-0 end-0 h-full w-1.5 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-accent/30",
                    TOUCH_GESTURE_CLASS,
                  )}
                />
              ) : null}
            </th>
          );
        })}
        <th
          aria-hidden
          className="sticky top-0 z-20 bg-fourth/95 shadow-[inset_0_-1px_0_0_rgba(var(--border-color),0.15)] backdrop-blur-sm"
        />
      </tr>
    </thead>
  );
}
