import type { ReactNode } from "react";

import type { TableColumn } from "./types";

export const CHECKBOX_PX = 40;
export const CHECKBOX_WIDTH = `${CHECKBOX_PX}px`;

/**
 * Logical alignment. `left`/`right` are treated as `start`/`end`: a component
 * API written for LTR would otherwise pin Arabic text to the wrong edge.
 */
export function alignFlex(align: TableColumn<unknown>["align"]) {
  if (align === "end" || align === "right") return "justify-end";
  if (align === "center") return "justify-center";
  return "justify-start";
}

export function alignText(align: TableColumn<unknown>["align"]) {
  if (align === "end" || align === "right") return "text-end";
  if (align === "center") return "text-center";
  return "text-start";
}

/**
 * `index` is the row's position in the rendered page, handed to `cell` so a
 * caller can render page-absolute row numbers without a positional column type.
 */
export function readCell<T>(
  row: T,
  column: TableColumn<T>,
  index: number,
): ReactNode {
  if (column.cell) return column.cell(row, index);
  return (row as Record<string, ReactNode>)[column.key];
}

export function readSortValue<T>(
  row: T,
  column: TableColumn<T>,
): string | number {
  if (column.sortValue) return column.sortValue(row);
  return (row as Record<string, string | number>)[column.key];
}

/**
 * The document direction at `el`. Reads the computed style rather than a prop,
 * so a table nested anywhere inside `[dir="rtl"]` resizes the right way without
 * every caller passing a flag.
 */
export function isRtlElement(el: Element | null | undefined): boolean {
  if (!el || typeof window === "undefined") return false;
  return getComputedStyle(el).direction === "rtl";
}
