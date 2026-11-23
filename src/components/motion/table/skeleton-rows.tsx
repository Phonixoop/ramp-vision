"use client";

import { cn } from "~/lib/utils";
import type { TableColumn } from "./types";
import { alignText } from "./utils";

export function SkeletonRows<T>({
  count,
  columns,
  selectable,
  rowHeight,
}: {
  count: number;
  columns: TableColumn<T>[];
  selectable: boolean;
  rowHeight: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, r) => (
        <tr
          key={r}
          style={{ height: rowHeight }}
          className="border-b border-border-color/10"
        >
          {selectable ? <td /> : null}
          {columns.map((column) => (
            <td key={column.key} className={cn("px-3", alignText(column.align))}>
              <div
                className={cn(
                  "h-2.5 animate-pulse rounded-full bg-primary/10",
                  column.align === "center"
                    ? "mx-auto w-10"
                    : column.align === "end" || column.align === "right"
                      ? "ms-auto w-10"
                      : "w-2/3",
                )}
              />
            </td>
          ))}
          <td aria-hidden />
        </tr>
      ))}
    </>
  );
}
