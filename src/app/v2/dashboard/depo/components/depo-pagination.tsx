/**
 * Pagination footer for the depo table.
 *
 * beui's `Table` renders exactly the array it is given and has no pager at all,
 * so paging stays here, driven entirely by URL state. Nothing is sliced in the
 * browser: `page` and `pageSize` go to `/depo/table`, which returns one page.
 *
 * Written from scratch rather than reusing ReUI's `DataGridPagination` so the
 * page keeps zero runtime dependency on `~/components/reui`.
 *
 * RTL: the arrows are *reading-order* arrows, so "next" points left (the way
 * the page numbers advance in Persian) and "previous" points right. Page
 * numbers are formatted with `fa-IR`, like every other number on this screen.
 */
"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "~/lib/utils";

const num = new Intl.NumberFormat("fa-IR");

/** How many numbered buttons the middle of the row may show. */
const MIDDLE_LIMIT = 5;

type Slot =
  | { type: "page"; page: number }
  | { type: "ellipsis"; target: number; key: string };

/**
 * First page, a window around the current one, last page, with one ellipsis per
 * hidden stretch (each jumps over the stretch it stands for). Truncation only
 * starts once there is something worth hiding, so short result sets show every
 * page and no ellipsis.
 */
function pageSlots(page: number, pageCount: number, limit = MIDDLE_LIMIT): Slot[] {
  if (pageCount <= limit + 1) {
    return Array.from({ length: pageCount }, (_, i) => ({
      type: "page" as const,
      page: i + 1,
    }));
  }

  const windowSize = Math.max(3, limit);
  const half = Math.floor(windowSize / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(pageCount - 1, start + windowSize - 1);
  // Near the end the window would run short; slide it back instead.
  start = Math.max(1, Math.min(start, end - windowSize + 1));

  const slots: Slot[] = [{ type: "page", page: 1 }];
  if (start > 2) {
    slots.push({ type: "ellipsis", target: start - 1, key: `s-${start}` });
  }
  for (let p = start; p <= end; p++) {
    if (p === 1 || p === pageCount) continue;
    slots.push({ type: "page", page: p });
  }
  if (end < pageCount - 1) {
    slots.push({
      type: "ellipsis",
      target: end + 1,
      key: `e-${end}`,
    });
  }
  slots.push({ type: "page", page: pageCount });
  return slots;
}

const NAV_BUTTON =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-color/15 text-primary/60 transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";

const PAGE_BUTTON =
  "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs tabular-nums transition-colors";

export type DepoPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  sizes?: number[];
  /** Server round-trip in flight: dims the footer without unmounting it. */
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

export function DepoPagination({
  page,
  pageSize,
  total,
  sizes = [25, 50, 100, 200],
  loading = false,
  onPageChange,
  onPageSizeChange,
  className,
}: DepoPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  // An empty result still reports "0 - 0 از 0" rather than a bogus first row.
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(current * pageSize, total);
  const slots = pageSlots(current, pageCount);

  const go = (next: number) => {
    const clamped = Math.min(Math.max(1, next), pageCount);
    if (clamped !== current) onPageChange(clamped);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-xs text-primary/60",
        loading && "opacity-60",
        className,
      )}
    >
      {/* Info line: "{from} - {to} از {count}" */}
      <p className="tabular-nums">
        <span className="text-primary/80">
          {num.format(from)} - {num.format(to)}
        </span>{" "}
        از <span className="text-primary/80">{num.format(total)}</span>
      </p>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5">
          <span className="hidden text-primary/45 sm:inline">ردیف در صفحه</span>
          {/*
            A native <select> on purpose: four fixed options need no popover,
            it is keyboard- and screen-reader-native, and it inherits the
            browser's RTL rendering instead of fighting a portal's positioning.
          */}
          <select
            aria-label="تعداد ردیف در صفحه"
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(Number.parseInt(event.target.value, 10))
            }
            className="h-7 cursor-pointer rounded-md border border-border-color/15 bg-transparent px-1.5 text-xs text-primary/75 outline-none transition-colors hover:bg-primary/5 focus-visible:ring-1 focus-visible:ring-accent/40"
          >
            {sizes.map((size) => (
              <option key={size} value={size} className="bg-fourth text-primary">
                {num.format(size)}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="صفحه‌بندی" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="صفحه اول"
            className={cn(NAV_BUTTON, "hidden sm:inline-flex")}
            onClick={() => go(1)}
            disabled={current === 1}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <ChevronRightIcon className="-ms-2 h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="صفحه قبل"
            className={NAV_BUTTON}
            onClick={() => go(current - 1)}
            disabled={current === 1}
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-0.5">
            {slots.map((slot) =>
              slot.type === "page" ? (
                <button
                  key={slot.page}
                  type="button"
                  aria-label={`صفحه ${num.format(slot.page)}`}
                  aria-current={slot.page === current ? "page" : undefined}
                  className={cn(
                    PAGE_BUTTON,
                    slot.page === current
                      ? "bg-primary text-secondary"
                      : "text-primary/65 hover:bg-primary/5 hover:text-primary",
                  )}
                  onClick={() => go(slot.page)}
                >
                  {num.format(slot.page)}
                </button>
              ) : (
                <button
                  key={slot.key}
                  type="button"
                  aria-label={`پرش به صفحه ${num.format(slot.target)}`}
                  className={cn(PAGE_BUTTON, "text-primary/35 hover:text-primary")}
                  onClick={() => go(slot.target)}
                >
                  …
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            aria-label="صفحه بعد"
            className={NAV_BUTTON}
            onClick={() => go(current + 1)}
            disabled={current === pageCount}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="صفحه آخر"
            className={cn(NAV_BUTTON, "hidden sm:inline-flex")}
            onClick={() => go(pageCount)}
            disabled={current === pageCount}
          >
            <ChevronLeftIcon className="-me-2 h-3.5 w-3.5" />
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
        </nav>
      </div>
    </div>
  );
}
