/**
 * Part-to-whole presentation for the v2 personnel-performance chart page.
 *
 * Two shapes, one dataset, chosen by the data rather than by taste:
 *
 * - `CompositionDonut` — ≤6 slices. Largest slice starts at 12 o'clock
 *   (`startAngle = -π/2`, sorted descending), every slice carries a direct `٪`
 *   label drawn on the arc, and the value table beside it is the non-colour
 *   fallback. Each slice is focusable and announces itself.
 * - `CompositionStackedBar` — used when there are more than 6 categories, or
 *   when slice weights are within 5% of one another. A pie at that point is
 *   unreadable: 8+ hairline slices, or slices nobody can tell apart.
 *
 * Geometry is drawn with `d3-shape` (already a dependency and the same library
 * the shared pie chart uses) instead of a bespoke path builder, so arcs, pad
 * angles and corner radii behave like the rest of the app's charts.
 *
 * Colours come from `--accent` / `--primary` only — see `SLICE_STYLES`. Beyond
 * the first two slices the fills also carry a diagonal hatch, because tint
 * steps alone are not enough to tell neighbours apart.
 */
"use client";

import { useId, useMemo, useState } from "react";
import { arc as d3Arc, pie as d3Pie } from "d3-shape";

import { cn } from "~/lib/utils";
import {
  formatFaNumber,
  formatFaPercent,
  formatFaPercentDecimal,
} from "./chart-format";

export type CompositionSlice = {
  label: string;
  value: number;
  /** Optional override; otherwise the palette below is used by index. */
  color?: string;
};

/**
 * Six steps derived from the two brand tokens, solid → tint, hatch after #2.
 *
 * Alpha tints must use the legacy comma form. The theme tokens are stored as
 * comma-separated channel triplets (`--primary: 244, 246, 245`), so the modern
 * `rgb(var(--primary) / 0.78)` expanded to `rgb(244, 246, 245 / 0.78)`, which CSS
 * rejects outright — every non-saturated slice then painted `rgb(0, 0, 0)` and
 * the donut read as an all-black disc. `rgba(var(--primary), 0.78)` is valid.
 */
const SLICE_STYLES = [
  { fill: "rgb(var(--accent))", hatched: false },
  { fill: "rgba(var(--primary), 0.78)", hatched: false },
  { fill: "rgba(var(--accent), 0.62)", hatched: true },
  { fill: "rgba(var(--primary), 0.48)", hatched: true },
  { fill: "rgba(var(--accent), 0.40)", hatched: true },
  { fill: "rgba(var(--primary), 0.30)", hatched: true },
] as const;

/** Beyond this many categories a pie stops being readable. */
export const MAX_PIE_SLICES = 6;

const OTHER_LABEL = "سایر";

type PreparedSlice = {
  label: string;
  value: number;
  percent: number;
  fill: string;
  hatched: boolean;
};

/**
 * Sorts descending and computes the shares.
 *
 * With `cap` (the donut) the first `MAX_PIE_SLICES - 1` are kept and the tail
 * is aggregated into «سایر», so no category silently disappears. Without `cap`
 * (the stacked bar — the >6-category fallback) every category is kept:
 * collapsing them there would defeat the reason for changing shape.
 */
function prepareSlices(
  slices: CompositionSlice[],
  { cap = true }: { cap?: boolean } = {},
): PreparedSlice[] {
  const positive = slices.filter(
    (slice) => Number.isFinite(slice.value) && slice.value > 0,
  );
  const total = positive.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return [];

  const sorted = [...positive].sort((a, b) => b.value - a.value);
  const kept =
    !cap || sorted.length <= MAX_PIE_SLICES
      ? sorted
      : sorted.slice(0, MAX_PIE_SLICES - 1);
  const tail = sorted.slice(kept.length);

  const rows = kept.map((slice) => ({
    label: slice.label,
    value: slice.value,
    color: slice.color,
  }));

  if (tail.length > 0) {
    rows.push({
      label: OTHER_LABEL,
      value: tail.reduce((sum, slice) => sum + slice.value, 0),
      color: undefined,
    });
  }

  return rows.map((row, index) => {
    const style = SLICE_STYLES[index % SLICE_STYLES.length];
    return {
      label: row.label,
      value: row.value,
      percent: (row.value / total) * 100,
      fill: row.color ?? style.fill,
      hatched: !row.color && style.hatched,
    };
  });
}

/** True when a pie cannot carry the comparison: too many slices, or near-ties. */
export function shouldUseStackedBar(slices: CompositionSlice[]): boolean {
  const positive = slices.filter(
    (slice) => Number.isFinite(slice.value) && slice.value > 0,
  );
  if (positive.length > MAX_PIE_SLICES) return true;
  if (positive.length < 2) return false;

  const total = positive.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return false;

  const percents = positive.map((slice) => (slice.value / total) * 100);
  const spread = Math.max(...percents) - Math.min(...percents);
  return spread < 5;
}

export type CompositionDonutProps = {
  slices: CompositionSlice[];
  /** Center caption under the total. */
  totalLabel?: string;
  /** Formats the total (e.g. Persian percent). */
  formatTotal?: (total: number) => string;
  /** Formats a slice's raw value in the table. */
  formatValue?: (value: number) => string;
  /** Fixed diameter in px. Omit to fill the card width. */
  size?: number;
  className?: string;
};

export function CompositionDonut({
  slices,
  totalLabel = "مجموع",
  formatTotal = formatFaNumber,
  formatValue = formatFaNumber,
  size = 208,
  className,
}: CompositionDonutProps) {
  const hatchId = useId().replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const rows = useMemo(() => prepareSlices(slices), [slices]);
  const total = useMemo(
    () => rows.reduce((sum, row) => sum + row.value, 0),
    [rows],
  );

  // startAngle -π/2 == 12 o'clock; sorted input keeps the largest there.
  const arcs = useMemo(() => {
    const generator = d3Pie<PreparedSlice>()
      .value((row) => row.value)
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle((3 * Math.PI) / 2)
      .padAngle(0.012);

    return generator(rows);
  }, [rows]);

  const outerRadius = size / 2 - 4;
  const innerRadius = outerRadius * 0.62;

  const arcPath = useMemo(() => {
    const generator = d3Arc<unknown>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(3);

    return (d: (typeof arcs)[number]) =>
      generator({
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        padAngle: d.padAngle,
      }) ?? "";
  }, [arcs, innerRadius, outerRadius]);

  const active = activeIndex == null ? null : rows[activeIndex] ?? null;

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-3", className)}>
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            aria-hidden="true"
            className="block"
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
          >
            <defs>
              <pattern
                height="6"
                id={`hatch-${hatchId}`}
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
                width="6"
              >
                <rect fill="transparent" height="6" width="6" />
                <line
                  stroke="rgba(var(--fourth), 0.55)"
                  strokeWidth="1.5"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="6"
                />
              </pattern>
            </defs>

            <g transform={`translate(${size / 2} ${size / 2})`}>
              {arcs.map((arcDatum, index) => {
                const row = rows[index]!;
                const isActive = activeIndex === index;
                const isDimmed = activeIndex !== null && !isActive;

                return (
                  <g key={`${row.label}-${index}`}>
                    <path
                      d={arcPath(arcDatum)}
                      fill={row.fill}
                      opacity={isDimmed ? 0.4 : 1}
                      stroke="rgb(var(--fourth))"
                      strokeWidth={1.5}
                      style={{
                        transition:
                          "opacity 200ms ease-out, transform 200ms ease-out",
                        transform: isActive ? "scale(1.015)" : "scale(1)",
                        transformOrigin: "center",
                      }}
                      className="motion-reduce:transition-none"
                    />
                    {row.hatched ? (
                      <path
                        d={arcPath(arcDatum)}
                        fill={`url(#hatch-${hatchId})`}
                        opacity={isDimmed ? 0.4 : 0.9}
                        pointerEvents="none"
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Center: total, or the focused slice's value. Pure HTML, no foreignObject. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="text-[11px] text-primary/70">
              {active ? active.label : totalLabel}
            </span>
            <span className="text-lg font-semibold leading-none tabular-nums text-primary">
              {active ? formatValue(active.value) : formatTotal(total)}
            </span>
            {active ? (
              <span className="text-[11px] tabular-nums text-primary/70">
                {formatFaPercentDecimal(active.percent)}
              </span>
            ) : null}
          </div>

          {/* Direct % labels on the arc, with a surface-coloured halo so the text
              stays readable on both solid and tinted fills. Only slices wide
              enough for the text get one; the rest are in the table below. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
          >
            <g transform={`translate(${size / 2} ${size / 2})`}>
              {arcs.map((arcDatum, index) => {
                const row = rows[index]!;
                if (row.percent < 7) return null;
                const mid = (arcDatum.startAngle + arcDatum.endAngle) / 2;
                const radius = (innerRadius + outerRadius) / 2;
                const x = Math.sin(mid) * radius;
                const y = -Math.cos(mid) * radius;

                return (
                  <text
                    dominantBaseline="central"
                    fill="rgb(var(--primary))"
                    fontFamily="var(--font-iransans)"
                    fontSize={12}
                    fontWeight={600}
                    key={`label-${row.label}-${index}`}
                    paintOrder="stroke"
                    stroke="rgb(var(--fourth))"
                    strokeWidth={3}
                    textAnchor="middle"
                    x={x}
                    y={y}
                  >
                    {formatFaPercent(row.percent)}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Keyboard path: the slices themselves are rendered below as buttons;
            this line is the shared readout for hover *and* focus. */}
        <p
          aria-live="polite"
          className="mt-1 min-h-[1rem] text-[11px] tabular-nums text-primary/70"
        >
          {active
            ? `${active.label}: ${formatValue(active.value)} — ${formatFaPercentDecimal(active.percent)}`
            : ""}
        </p>
      </div>

      {/* Value table — the accessibility fallback for colour plus the
          keyboard target. Each row is a real <button> so focus reveals it. */}
      <ul className="w-full min-w-0 space-y-1">
        {rows.map((row, index) => (
          <li key={`${row.label}-${index}`}>
            <button
              aria-label={`${row.label}: ${formatValue(row.value)} — ${formatFaPercentDecimal(row.percent)}`}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-start transition-colors duration-200 ease-out motion-reduce:transition-none",
                "hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                activeIndex === index && "bg-primary/5",
              )}
              onBlur={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              type="button"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-[11px] text-primary/70">
                {row.label}
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-primary/70">
                {formatValue(row.value)}
              </span>
              <span className="w-10 shrink-0 text-end text-[11px] font-medium tabular-nums text-primary/80">
                {formatFaPercent(row.percent)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type CompositionStackedBarProps = {
  slices: CompositionSlice[];
  /** Formats a slice's raw value. */
  formatValue?: (value: number) => string;
  className?: string;
};

/**
 * 100% stacked bar — the pie's substitute for 7+ categories or near-equal
 * slices. Every segment is labelled with its percentage directly on the bar and
 * again in the list, so the comparison never depends on colour.
 */
export function CompositionStackedBar({
  slices,
  formatValue = formatFaNumber,
  className,
}: CompositionStackedBarProps) {
  const rows = useMemo(() => prepareSlices(slices, { cap: false }), [slices]);
  if (rows.length === 0) return null;

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-primary/10"
        role="img"
        aria-label={rows
          .map((row) => `${row.label} ${formatFaPercent(row.percent)}`)
          .join("، ")}
      >
        {rows.map((row, index) => (
          <span
            className="h-full first:rounded-s-full last:rounded-e-full"
            key={`${row.label}-${index}`}
            style={{
              backgroundColor: row.fill,
              width: `${row.percent}%`,
              backgroundImage: row.hatched
                ? "repeating-linear-gradient(45deg, rgba(var(--fourth), 0.55) 0 1px, transparent 1px 5px)"
                : undefined,
            }}
          />
        ))}
      </div>

      <ul className="grid min-w-0 grid-cols-1 gap-1 sm:grid-cols-2">
        {rows.map((row, index) => (
          <li
            className="flex min-w-0 items-center gap-1.5 text-[11px]"
            key={`${row.label}-${index}`}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: row.fill }}
            />
            <span className="min-w-0 flex-1 truncate text-primary/70">
              {row.label}
            </span>
            <span className="shrink-0 tabular-nums text-primary/70">
              {formatValue(row.value)}
            </span>
            <span className="w-9 shrink-0 text-end font-medium tabular-nums text-primary/80">
              {formatFaPercent(row.percent)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
