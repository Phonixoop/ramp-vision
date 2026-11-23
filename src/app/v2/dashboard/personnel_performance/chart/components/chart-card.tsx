/**
 * Presentational card shell for the v2 personnel-performance chart page.
 *
 * Mirrors the aesthetic of `v2/dashboard/depo/components/depo-cards.tsx`
 * (`rounded-2xl border-border-color/10 bg-fourth p-3`) so both v2 pages read as
 * one product.
 *
 * Everything here is display-only: no data fetching, no filter state, no
 * `enabled` flags. That keeps it safe to apply while the chart data wiring is
 * being fixed elsewhere.
 *
 * Theme notes (see `src/styles/globals.css`):
 * - tokens are RGB triples, used as `text-primary/60`, `border-border-color/10`
 * - there are no shadcn semantic tokens (`--muted`, `--card`, …) in this theme,
 *   so none of those classes appear here
 * - `--primary` and `--secondary` swap between light and dark, hence any filled
 *   surface is `bg-primary text-secondary` (never `bg-primary text-primary`)
 */
"use client";

import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export type ChartCardProps = {
  /** Persian title. */
  title: string;
  /** One-line insight / explanation shown under the title. */
  subtitle?: string;
  /** Optional trailing controls (toggles, links). Kept out of the title flow. */
  actions?: ReactNode;
  /**
   * Reserved inner height so the card does not jump between skeleton, empty
   * and loaded states. Pass any Tailwind height/min-height class.
   * @default "min-h-[18rem]"
   */
  minHeightClassName?: string;
  /** Renders the skeleton instead of `children`. */
  loading?: boolean;
  /** Renders `empty` instead of `children` when there is nothing to show. */
  isEmpty?: boolean;
  /** Persian empty state (message + optional action). */
  empty?: ReactNode;
  /** Skeleton shape for `loading`: chart (default) or list. */
  skeletonVariant?: "chart" | "list" | "kpi";
  className?: string;
  /** Applied to the body wrapper. */
  bodyClassName?: string;
  children?: ReactNode;
};

export function ChartCard({
  title,
  subtitle,
  actions,
  minHeightClassName = "min-h-[18rem]",
  loading = false,
  isEmpty = false,
  empty,
  skeletonVariant = "chart",
  className,
  bodyClassName,
  children,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-border-color/10 bg-fourth",
        className,
      )}
      aria-busy={loading || undefined}
    >
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border-color/10 px-3 py-2.5">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          {subtitle ? (
            <p className="text-xs leading-relaxed text-primary/70">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
        ) : null}
      </header>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col p-3",
          minHeightClassName,
          bodyClassName,
        )}
      >
        {loading ? (
          <ChartCardSkeleton variant={skeletonVariant} />
        ) : isEmpty ? (
          (empty ?? <ChartCardEmpty message="داده‌ای برای نمایش نیست." />)
        ) : (
          children
        )}
      </div>
    </section>
  );
}

/** Skeleton used for every card — never a blank or flashing panel. */
export function ChartCardSkeleton({
  variant = "chart",
}: {
  variant?: "chart" | "list" | "kpi";
}) {
  if (variant === "kpi") {
    return (
      <div className="grid flex-1 gap-2 sm:grid-cols-3" aria-hidden>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-border-color/10 bg-third/60 p-2.5"
          >
            <div className="h-2.5 w-16 animate-pulse rounded bg-primary/10" />
            <div className="mt-2 h-5 w-20 animate-pulse rounded bg-primary/10" />
            <div className="mt-2 h-1.5 w-full animate-pulse rounded-full bg-primary/10" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex flex-1 flex-col gap-2" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-9 animate-pulse rounded-lg bg-third/60"
            style={{ animationDelay: `${index * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2" aria-hidden>
      <div className="flex flex-1 items-end gap-1.5">
        {[38, 62, 48, 74, 55, 82, 66].map((height, index) => (
          <div
            key={index}
            className="flex-1 animate-pulse rounded-t-md bg-primary/10"
            style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
          />
        ))}
      </div>
      <div className="h-2 w-1/2 animate-pulse rounded bg-primary/10" />
    </div>
  );
}

/** Persian empty state: a helpful sentence plus, optionally, a next step. */
export function ChartCardEmpty({
  message,
  action,
  className,
}: {
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center",
        className,
      )}
      role="status"
    >
      <p className="max-w-xs text-xs leading-relaxed text-primary/70">
        {message}
      </p>
      {action}
    </div>
  );
}

export type KpiTone = "positive" | "warning" | "negative" | "neutral";

/**
 * Tone is expressed as a small dot + track fill only. The status *word* always
 * sits beside it in `text-primary`, so contrast is guaranteed in both themes
 * and the meaning never depends on hue. (`dark:` variants are unusable here:
 * this app switches themes with `data-theme`, not `prefers-color-scheme`.)
 */
const KPI_TONE_DOT: Record<KpiTone, string> = {
  positive: "bg-accent",
  warning: "bg-amber-500",
  negative: "bg-rose-500",
  neutral: "bg-primary/40",
};

/**
 * A KPI/numeric-metric tile.
 *
 * The gauge guidance applies here: the number and its target are *text*
 * (`value` / `targetLabel`), and the status word is always rendered next to the
 * colour so the meaning never depends on hue alone.
 */
export function KpiStat({
  label,
  value,
  unit,
  targetLabel,
  statusText,
  tone = "neutral",
  progress,
  className,
}: {
  label: string;
  /** Pre-formatted (Persian digits) value. */
  value: string;
  /** Small unit/percent sign rendered after the value. */
  unit?: string;
  /** Target/benchmark as text, e.g. "هدف: ۱۰۰٪". */
  targetLabel?: string;
  /** Status word, e.g. "خوب" — paired with `tone`. */
  statusText?: string;
  tone?: KpiTone;
  /** 0..100 fill for the track. `null` hides the track. */
  progress?: number | null;
  className?: string;
}) {
  const pct =
    progress == null || !Number.isFinite(progress)
      ? null
      : Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-xl border border-border-color/10 bg-third/60 p-2.5",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate text-xs text-primary/70">
          {label}
        </span>
        {statusText ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary/80">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", KPI_TONE_DOT[tone])}
            />
            {statusText}
          </span>
        ) : null}
      </div>

      <p className="flex items-baseline gap-1">
        <span className="text-lg font-semibold leading-none tabular-nums text-primary">
          {value}
        </span>
        {unit ? (
          <span className="text-[11px] tabular-nums text-primary/70">
            {unit}
          </span>
        ) : null}
      </p>

      {pct != null ? (
        <div className="relative mt-0.5 h-1.5 overflow-hidden rounded-full bg-primary/10">
          <div
            className={cn(
              "absolute inset-y-0 start-0 rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none",
              KPI_TONE_DOT[tone],
            )}
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
      ) : null}

      {targetLabel ? (
        <span className="text-[11px] tabular-nums text-primary/70">
          {targetLabel}
        </span>
      ) : null}
    </div>
  );
}
