/**
 * Trend (line / area) presentation for the v2 personnel-performance chart page.
 *
 * Rules this file encodes, from the chart design guidance:
 *
 * - fewer than 4 points is not a trend → a stat card with the single value.
 * - more than 6 series is noise → the extras are folded into «سایر».
 * - series are separated by **colour and stroke pattern** (solid / dashed /
 *   dotted) and carry a direct label at the end of the line, never by hue alone.
 * - the area fill sits at ~20% opacity.
 * - a data table is always rendered, and its rows are focusable, so the value
 *   behind any point is reachable without a pointer. Hovering or focusing shows
 *   the same value in a readout above the plot.
 * - one-line Persian trend summary above the plot.
 *
 * The plot is deliberately `dir="ltr"`: time runs left → right, the way the rest
 * of this product's time series read. Only the surrounding text is RTL, and the
 * direct series labels are anchored to the series end (right edge of the plot).
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "~/lib/utils";
import {
  formatFaDecimal,
  formatFaNumber,
  formatFaPercent,
} from "./chart-format";

export type TrendPoint = {
  /** Category label (post data wiring): usually a Jalali date/month string. */
  label: string;
  value: number;
};

export type TrendSeries = {
  key: string;
  label: string;
  points: TrendPoint[];
  /** Optional colour override. */
  color?: string;
};

// Alpha tints use the legacy comma form: theme tokens are comma-separated
// channel triplets, so `rgb(var(--primary) / 0.75)` is invalid CSS and would
// paint black.
const SERIES_COLORS = [
  "rgb(var(--accent))",
  "rgba(var(--primary), 0.75)",
  "rgba(var(--accent), 0.55)",
  "rgba(var(--primary), 0.5)",
  "rgba(var(--accent), 0.35)",
  "rgba(var(--primary), 0.3)",
] as const;

/** Colour *and* pattern — hue alone is not a series key. */
const SERIES_DASH = ["none", "5 3", "1.5 2.5", "7 3 1.5 3", "2 2", "9 4"] as const;

/** Below this, a line chart cannot show a trend. */
export const MIN_TREND_POINTS = 4;
/** Above this many series the plot stops being readable. */
export const MAX_TREND_SERIES = 6;

const PLOT_HEIGHT = 176;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;
const PAD_START = 34;
const LABEL_GUTTER = 76;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof ResizeObserver === "undefined") {
      setWidth(element.getBoundingClientRect().width);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.round(next * 2) / 2);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/** Folds series beyond the cap into a mean series, so nothing is dropped. */
function capSeries(series: TrendSeries[]): TrendSeries[] {
  if (series.length <= MAX_TREND_SERIES) return series;

  const kept = series.slice(0, MAX_TREND_SERIES - 1);
  const tail = series.slice(kept.length);
  const length = Math.max(...tail.map((entry) => entry.points.length));

  const merged: TrendPoint[] = Array.from({ length }, (_, index) => {
    const values = tail
      .map((entry) => entry.points[index])
      .filter((point): point is TrendPoint => Boolean(point));
    const value =
      values.length === 0
        ? 0
        : values.reduce((sum, point) => sum + point.value, 0) / values.length;
    return {
      label: values[0]?.label ?? "",
      value,
    };
  });

  return [
    ...kept,
    { key: "__other__", label: "سایر", points: merged },
  ];
}

/** Linear scale helper — plain maths, no chart runtime. */
function makeScale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

/** One-line Persian summary: direction, first → last, and the change. */
function buildSummary(first: TrendSeries | undefined): string | null {
  if (!first) return null;
  const points = first.points.filter((point) => Number.isFinite(point.value));
  if (points.length < 2) return null;

  const start = points[0]!.value;
  const end = points[points.length - 1]!.value;
  const delta = end - start;
  const ratio = start === 0 ? null : (delta / Math.abs(start)) * 100;

  const direction =
    Math.abs(delta) < 0.5 ? "بدون تغییر" : delta > 0 ? "صعودی" : "نزولی";

  const changeText =
    ratio == null
      ? ""
      : ` (${delta > 0 ? "+" : ""}${formatFaPercent(ratio)})`;

  return `روند ${direction}: از ${formatFaDecimal(start)} به ${formatFaDecimal(end)}${changeText}`;
}

export type TrendChartProps = {
  series: TrendSeries[];
  /** Unit appended in the readout / table, e.g. "٪". */
  unit?: string;
  /** Formats a value. Defaults to Persian number with up to 2 decimals. */
  formatValue?: (value: number) => string;
  /** Shown when there is no data at all. */
  emptyMessage?: string;
  className?: string;
};

export function TrendChart({
  series,
  unit = "٪",
  formatValue = formatFaDecimal,
  emptyMessage = "برای این بازه داده‌ای ثبت نشده است.",
  className,
}: TrendChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const capped = useMemo(() => capSeries(series ?? []), [series]);

  const pointCount = useMemo(
    () => Math.max(0, ...capped.map((entry) => entry.points.length)),
    [capped],
  );

  // Ordered labels: prefer the longest series so a merged tail still aligns.
  const labels = useMemo(() => {
    const longest = [...capped].sort(
      (a, b) => b.points.length - a.points.length,
    )[0];
    return (longest?.points ?? []).map((point) => point.label);
  }, [capped]);

  const styled = useMemo(
    () =>
      capped.map((entry, index) => ({
        ...entry,
        color: entry.color ?? SERIES_COLORS[index % SERIES_COLORS.length]!,
        dash: SERIES_DASH[index % SERIES_DASH.length]!,
      })),
    [capped],
  );

  const values = useMemo(
    () =>
      styled.flatMap((entry) =>
        entry.points
          .map((point) => point.value)
          .filter((value) => Number.isFinite(value)),
      ),
    [styled],
  );

  const hasData = pointCount > 0 && values.length > 0;
  const tooFewPoints = hasData && pointCount < MIN_TREND_POINTS;

  const plotWidth = Math.max(0, width - PAD_START - LABEL_GUTTER);
  const plotHeight = PLOT_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const domain = useMemo<[number, number]>(() => {
    if (values.length === 0) return [0, 1];
    // Never force 0 into the domain: percentage series in the 70–100 band would
    // flatten into a straight line at the top of the plot. The area fill closes
    // on the plot floor instead (see `areaFor`).
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return [Math.max(0, min - 1), max + 1];
    const pad = (max - min) * 0.1;
    return [Math.max(0, min - pad), max + pad];
  }, [values]);

  const x = useMemo(
    () =>
      makeScale(
        [0, Math.max(1, pointCount - 1)],
        [PAD_START, PAD_START + plotWidth],
      ),
    [pointCount, plotWidth],
  );
  const y = useMemo(
    () =>
      makeScale(domain, [PAD_TOP + plotHeight, PAD_TOP]),
    [domain, plotHeight],
  );

  const yTicks = useMemo(() => {
    const [min, max] = domain;
    return [0, 1, 2].map((step) => min + ((max - min) * step) / 2);
  }, [domain]);

  const xTickIndexes = useMemo(() => {
    if (pointCount === 0) return [];
    if (pointCount <= 6) return labels.map((_, index) => index);
    const stride = Math.ceil(pointCount / 6);
    const result: number[] = [];
    for (let index = 0; index < pointCount; index += stride) {
      result.push(index);
    }
    if (result[result.length - 1] !== pointCount - 1) {
      result.push(pointCount - 1);
    }
    return result;
  }, [labels, pointCount]);

  const pathFor = (points: TrendPoint[]) => {
    let started = false;
    return points
      .map((point, index) => {
        if (!Number.isFinite(point.value)) return null;
        const command = started ? "L" : "M";
        started = true;
        return `${command}${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`;
      })
      .filter(Boolean)
      .join(" ");
  };

  const areaFor = (points: TrendPoint[]) => {
    const solid = points
      .map((point, index) =>
        Number.isFinite(point.value)
          ? { x: x(index), y: y(point.value) }
          : null,
      )
      .filter((point): point is { x: number; y: number } => point !== null);
    if (solid.length < 2) return "";
    // Close the fill on the plot floor, not on y(0): the domain is zoomed to the
    // data band, so a zero baseline is usually off-canvas.
    const baseline = PAD_TOP + plotHeight;
    const line = solid
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(" ");
    return `${line} L${solid[solid.length - 1]!.x.toFixed(2)} ${baseline.toFixed(2)} L${solid[0]!.x.toFixed(2)} ${baseline.toFixed(2)} Z`;
  };

  const summary = useMemo(() => buildSummary(styled[0]), [styled]);
  const activeLabel = activeIndex == null ? null : labels[activeIndex] ?? null;

  if (!hasData) {
    return (
      <p
        className={cn(
          "flex flex-1 items-center justify-center px-4 text-center text-xs leading-relaxed text-primary/70",
          className,
        )}
        role="status"
      >
        {emptyMessage}
      </p>
    );
  }

  // Not enough points to be a trend: show the numbers as a stat row instead.
  if (tooFewPoints) {
    return (
      <div className={cn("flex min-w-0 flex-col gap-2", className)}>
        <p className="text-[11px] leading-relaxed text-primary/70">
          برای رسم نمودار روند دست‌کم {formatFaNumber(MIN_TREND_POINTS)} نقطه لازم
          است؛ مقادیر موجود به‌صورت عددی نمایش داده می‌شوند.
        </p>
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {labels.map((label, index) => (
            <li
              className="rounded-lg border border-border-color/10 bg-third/60 px-2 py-1.5"
              key={`${label}-${index}`}
            >
              <span className="block truncate text-[11px] text-primary/70">
                {label}
              </span>
              <span className="mt-0.5 block text-sm font-semibold tabular-nums text-primary">
                {formatValue(styled[0]?.points[index]?.value ?? 0)}
                <span className="ms-0.5 text-[11px] font-normal text-primary/70">
                  {unit}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {/* Trend summary + hovered readout share one line so nothing jumps. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 text-[11px] leading-relaxed text-primary/70">
          {summary}
        </p>
        <p
          aria-live="polite"
          className="min-w-0 text-[11px] tabular-nums text-primary/80"
        >
          {activeLabel
            ? `${activeLabel} — ${styled
                .map((entry) => {
                  const point = entry.points[activeIndex ?? 0];
                  const text =
                    point && Number.isFinite(point.value)
                      ? `${formatValue(point.value)}${unit}`
                      : "—";
                  return `${entry.label}: ${text}`;
                })
                .join(" · ")}`
            : ""}
        </p>
      </div>

      <div className="relative min-w-0" dir="ltr" ref={containerRef}>
        {width > 0 ? (
          <svg
            aria-label={summary ?? "نمودار روند"}
            className="block w-full"
            height={PLOT_HEIGHT}
            role="img"
            viewBox={`0 0 ${width} ${PLOT_HEIGHT}`}
            width={width}
          >
            {/* Horizontal grid + y ticks */}
            {yTicks.map((tick, index) => (
              <g key={`y-${index}`}>
                <line
                  stroke="rgba(var(--border-color), 0.10)"
                  strokeWidth={1}
                  x1={PAD_START}
                  x2={PAD_START + plotWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                />
                <text
                  dominantBaseline="central"
                  fill="rgba(var(--primary), 0.7)"
                  fontFamily="var(--font-iransans)"
                  fontSize={11}
                  textAnchor="end"
                  x={PAD_START - 6}
                  y={y(tick)}
                >
                  {formatFaNumber(tick)}
                </text>
              </g>
            ))}

            {/* x ticks */}
            {xTickIndexes.map((index) => (
              <text
                fill="rgba(var(--primary), 0.7)"
                fontFamily="var(--font-iransans)"
                fontSize={11}
                key={`x-${index}`}
                textAnchor="middle"
                x={x(index)}
                y={PAD_TOP + plotHeight + 14}
              >
                {labels[index]?.length > 10
                  ? `${labels[index]!.slice(0, 9)}…`
                  : labels[index]}
              </text>
            ))}

            {/* Active crosshair */}
            {activeIndex != null ? (
              <line
                stroke="rgba(var(--primary), 0.28)"
                strokeDasharray="2 2"
                strokeWidth={1}
                x1={x(activeIndex)}
                x2={x(activeIndex)}
                y1={PAD_TOP}
                y2={PAD_TOP + plotHeight}
              />
            ) : null}

            {/* Area fills at 20% — first series only, to keep the plot legible. */}
            {styled[0] ? (
              <path
                d={areaFor(styled[0].points)}
                fill={styled[0].color}
                fillOpacity={0.2}
                stroke="none"
              />
            ) : null}

            {styled.map((entry) => (
              <g key={entry.key}>
                <path
                  d={pathFor(entry.points)}
                  fill="none"
                  stroke={entry.color}
                  strokeDasharray={entry.dash === "none" ? undefined : entry.dash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
                {activeIndex != null && entry.points[activeIndex] ? (
                  <circle
                    cx={x(activeIndex)}
                    cy={y(entry.points[activeIndex]!.value)}
                    fill={entry.color}
                    r={3}
                    stroke="rgb(var(--fourth))"
                    strokeWidth={1.5}
                  />
                ) : null}
                {/* Direct series label at the line's end, plus its pattern key. */}
                {entry.points[entry.points.length - 1] ? (
                  <g>
                    <text
                      dominantBaseline="central"
                      fill="rgba(var(--primary), 0.7)"
                      fontFamily="var(--font-iransans)"
                      fontSize={11}
                      x={PAD_START + plotWidth + 8}
                      y={y(entry.points[entry.points.length - 1]!.value)}
                    >
                      {entry.label.length > 9
                        ? `${entry.label.slice(0, 8)}…`
                        : entry.label}
                    </text>
                  </g>
                ) : null}
              </g>
            ))}

            {/* Hit areas: one column per point, so hover picks a date. */}
            {labels.map((label, index) => {
              const left = index === 0 ? PAD_START : (x(index - 1) + x(index)) / 2;
              const right =
                index === labels.length - 1
                  ? PAD_START + plotWidth
                  : (x(index) + x(index + 1)) / 2;
              return (
                <rect
                  fill="transparent"
                  height={plotHeight}
                  key={`hit-${label}-${index}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  width={Math.max(0, right - left)}
                  x={left}
                  y={PAD_TOP}
                >
                  <title>{`${label}: ${formatValue(styled[0]?.points[index]?.value ?? 0)}${unit}`}</title>
                </rect>
              );
            })}
          </svg>
        ) : (
          <div className="animate-pulse rounded-xl bg-primary/5" style={{ height: PLOT_HEIGHT }} />
        )}
      </div>

      {/* Data table — always present; rows are focusable so the keyboard path
          shows the same values as hover, without relying on the crosshair. */}
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[16rem] border-collapse text-xs">
          <caption className="sr-only">داده‌های نمودار روند</caption>
          <thead>
            <tr className="border-b border-border-color/10 text-primary/70">
              <th className="py-1 pe-2 text-start font-medium">دوره</th>
              {styled.map((entry) => (
                <th
                  className="py-1 pe-2 text-end font-medium"
                  key={entry.key}
                  scope="col"
                >
                  <span className="inline-flex items-center gap-1">
                    <span
                      aria-hidden
                      className="inline-block h-0.5 w-3 rounded-full"
                      style={{
                        backgroundColor: entry.color,
                        backgroundImage:
                          entry.dash === "none"
                            ? undefined
                            : "repeating-linear-gradient(90deg, rgba(var(--fourth), 1) 0 2px, transparent 2px 4px)",
                      }}
                    />
                    {entry.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => {
              const isActive = activeIndex === index;
              return (
                <tr
                  className={cn(
                    "border-b border-border-color/10 transition-colors duration-200 ease-out last:border-0 motion-reduce:transition-none",
                    isActive && "bg-primary/5",
                  )}
                  key={`row-${label}-${index}`}
                  onBlur={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  tabIndex={0}
                >
                  <th
                    className="py-1 pe-2 text-start font-normal tabular-nums text-primary/70"
                    scope="row"
                  >
                    {label}
                  </th>
                  {styled.map((entry) => (
                    <td
                      className="py-1 pe-2 text-end tabular-nums text-primary/80"
                      key={entry.key}
                    >
                      {entry.points[index]
                        ? `${formatValue(entry.points[index]!.value)}${unit}`
                        : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] leading-relaxed text-primary/70">
        رنگ و الگوی خط با هم تفکیک می‌کنند؛ مقدار هر نقطه در جدول بالا آمده است.
        {unit === "٪" ? " مقادیر درصدی هستند." : null}
      </p>
    </div>
  );
}
