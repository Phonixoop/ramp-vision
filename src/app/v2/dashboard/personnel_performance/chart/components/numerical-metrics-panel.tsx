"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, TrendingUpIcon } from "lucide-react";
import { AnimatedNumber } from "~/components/beui";
import { Badge } from "~/components/arc/badge/badge";
import { RingChart } from "~/components/charts/ring-chart";
import { RingCenter } from "~/components/charts/ring-center";
import type { RingData } from "~/components/charts/ring-context";
import { Ring } from "~/components/charts/ring";
import {
  Indicators,
  PersonnelPerformanceTranslate,
} from "~/constants/personnel-performance";
import { cn } from "~/lib/utils";
import { getPerformanceMetric } from "~/utils/personnel-performance";
import { commify } from "~/utils/util";

/** Full ring = hitting Indicator ok-max (100%). Values above stay full, color shifts. */
const TARGET_PERCENT = 100;
/** Design radii — chart scales into leftover space beside the list; keep hole large enough for % + caption. */
const RING_BASE_INNER_RADIUS = 72;
const AT_RISK_RATIO = 0.85;

type MetricStatus = "over" | "at_risk" | null;

export type NumericalMetricItem = {
  key: string;
  value: number;
};

type RowModel = {
  id: string;
  name: string;
  color: string;
  spent: number;
  budget: number | null;
  /** (spent / Indicator×days) × 100 — replaces former باقی semantics. */
  performance: number | null;
  status: MetricStatus;
};

function formatMetricValue(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Number.isInteger(value) ? value : Number(value.toFixed(2));
}

function resolveStatus(spent: number, budget: number | null): MetricStatus {
  if (budget == null || budget <= 0) return null;
  if (spent > budget) return "over";
  if (spent >= budget * AT_RISK_RATIO) return "at_risk";
  return null;
}

function buildRows(
  items: NumericalMetricItem[],
  dateLength: number,
): RowModel[] {
  const safeDays = dateLength > 0 ? dateLength : 1;

  const rows: RowModel[] = [];
  for (const item of items) {
    const spent = formatMetricValue(item.value);
    if (spent <= 0) continue;

    const indicator =
      item.key in Indicators
        ? Indicators[item.key as keyof typeof Indicators]
        : null;
    const budget =
      indicator != null && indicator > 0 ? indicator * safeDays : null;
    const performance =
      budget != null && budget > 0 ? (spent / budget) * 100 : null;
    const metricColor =
      performance != null
        ? getPerformanceMetric(performance).color
        : "rgb(var(--primary) / 0.35)";

    rows.push({
      id: item.key,
      name: PersonnelPerformanceTranslate[item.key] ?? item.key,
      color: metricColor,
      spent,
      budget,
      performance,
      status: resolveStatus(spent, budget),
    });
  }
  return rows;
}

export type NumericalMetricsPanelProps = {
  items: NumericalMetricItem[];
  /** Period day count used with Indicators for capacity (budget). */
  dateLength?: number;
  /** Overall performance % for the summary + ring center idle state. */
  totalPerformance?: number | null;
  className?: string;
  onSelectMetric?: (key: string) => void;
};

/**
 * Numerical metrics panel: bklit RingChart + category list.
 * Each ring / row shows performance % vs Indicator ok-max (not باقیمانده).
 */
export function NumericalMetricsPanel({
  items,
  dateLength = 1,
  totalPerformance = null,
  className,
  onSelectMetric,
}: NumericalMetricsPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () => buildRows(items, dateLength),
    [items, dateLength],
  );

  const ringRows = useMemo(
    () => rows.filter((row) => row.performance != null),
    [rows],
  );

  const ringData = useMemo<RingData[]>(
    () =>
      ringRows.map((row) => ({
        label: row.name,
        value: Math.min(Math.max(row.performance ?? 0, 0), TARGET_PERCENT),
        maxValue: TARGET_PERCENT,
        color: row.color,
      })),
    [ringRows],
  );

  const hoveredIndex = useMemo(() => {
    if (!activeId) return null;
    const idx = ringRows.findIndex((row) => row.id === activeId);
    return idx >= 0 ? idx : null;
  }, [activeId, ringRows]);

  const totals = useMemo(() => {
    const spent = rows.reduce((sum, row) => sum + row.spent, 0);
    const budget = rows.reduce((sum, row) => sum + (row.budget ?? 0), 0);
    const hasBudget = rows.some((row) => row.budget != null);
    const withPerf = rows.filter((row) => row.performance != null);
    const avgPerformance =
      withPerf.length > 0
        ? withPerf.reduce((sum, row) => sum + (row.performance ?? 0), 0) /
          withPerf.length
        : null;
    const usedRatio =
      hasBudget && budget > 0
        ? Math.min(1, spent / budget)
        : totalPerformance != null
          ? Math.min(1, Math.max(0, totalPerformance / 100))
          : 0;
    return { spent, budget, hasBudget, usedRatio, avgPerformance };
  }, [rows, totalPerformance]);

  const performanceLabel =
    totalPerformance != null && Number.isFinite(totalPerformance)
      ? formatMetricValue(totalPerformance)
      : totals.avgPerformance != null
        ? formatMetricValue(totals.avgPerformance)
        : null;

  const overallMetric =
    performanceLabel != null
      ? getPerformanceMetric(Number(performanceLabel))
      : null;

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border-color/10 bg-fourth/60 px-4 py-8 text-center text-xs text-primary/45",
          className,
        )}
      >
        شاخص عددی فعالی برای نمایش نیست.
      </div>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border-color/10 bg-fourth/60",
        className,
      )}
      aria-label="شاخص‌های عددی"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border-color/10 px-4 py-3">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold tracking-tight text-primary">
            شاخص‌های عددی
          </h3>
          <p className="text-[11px] text-primary/45">
            حلقه بر اساس عملکرد نسبت به شاخص استاندارد (ok-max) دوره
          </p>
        </div>
        {performanceLabel != null ? (
          <div
            className="flex items-center gap-1.5 rounded-lg border border-border-color/10 bg-third px-2.5 py-1 text-[11px] tabular-nums"
            style={{ color: overallMetric?.color }}
          >
            <TrendingUpIcon className="size-3.5 opacity-70" />
            عملکرد کلی {performanceLabel}%
          </div>
        ) : null}
      </header>

      {/* Ring takes leftover width; شاخص list is content-sized so names never truncate. */}
      <div className="grid items-center gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_max-content]">
        {ringData.length > 0 ? (
          <div className="mx-auto flex w-full min-w-0 flex-col items-center justify-center self-center">
            <RingChart
              data={ringData}
              strokeWidth={ringData.length > 6 ? 6 : 10}
              ringGap={ringData.length > 6 ? 2 : 4}
              baseInnerRadius={RING_BASE_INNER_RADIUS}
              padding={8}
              hoveredIndex={hoveredIndex}
              onHoverChange={(index) => {
                setActiveId(
                  index == null ? null : (ringRows[index]?.id ?? null),
                );
              }}
              className="mx-auto w-full"
            >
              {ringData.map((item, index) => (
                <Ring
                  key={item.label}
                  index={index}
                  showGlow={false}
                />
              ))}
              <RingCenter defaultLabel="عملکرد">
                {({ isHovered, data }) => {
                  const row = isHovered
                    ? ringRows.find((r) => r.name === data.label)
                    : null;
                  const rawPct = row
                    ? (row.performance ?? 0)
                    : performanceLabel != null
                      ? Number(performanceLabel)
                      : 0;
                  const display = Math.round(rawPct);
                  const metric = getPerformanceMetric(rawPct);
                  const caption = row ? row.name : "عملکرد کلی";

                  return (
                    <div className="flex max-w-full flex-col items-center gap-0.5 px-1">
                      <span className="text-[clamp(0.5625rem,8cqw,0.625rem)] text-primary/45">
                        عملکرد
                      </span>
                      <span
                        className="text-[clamp(1.25rem,28cqw,1.75rem)] font-semibold leading-none tracking-tight tabular-nums"
                        style={{ color: metric.color }}
                      >
                        <AnimatedNumber
                          value={display}
                          startOnView={false}
                          format={(n) => `${Math.round(n)}%`}
                          className="text-[clamp(1.25rem,28cqw,1.75rem)] font-semibold leading-none"
                        />
                      </span>
                      <span className="line-clamp-2 max-w-full text-[clamp(0.5625rem,8cqw,0.625rem)] leading-snug text-primary/50">
                        {caption}
                      </span>
                    </div>
                  );
                }}
              </RingCenter>
            </RingChart>
          </div>
        ) : (
          <div className="flex min-h-[12rem] items-center justify-center text-xs text-primary/45">
            شاخص استاندارد برای حلقه موجود نیست
          </div>
        )}

        <div className="w-full min-w-0 space-y-3 lg:w-auto lg:min-w-max lg:max-w-none">
          <div className="space-y-2 rounded-xl border border-border-color/10 bg-third/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-primary/55">
                مجموع فعالیت
              </span>
              {performanceLabel != null ? (
                <span
                  className="inline-flex items-center gap-1 text-[11px] tabular-nums"
                  style={{ color: overallMetric?.color }}
                >
                  <TrendingUpIcon className="size-3" />
                  {performanceLabel}%
                </span>
              ) : null}
            </div>
            <p className="text-sm text-primary">
              <span className="text-lg font-semibold tabular-nums">
                <AnimatedNumber
                  value={totals.spent}
                  startOnView={false}
                  format={(n) => commify(Math.round(n))}
                />
              </span>
              {totals.hasBudget ? (
                <span className="text-primary/45">
                  {" "}
                  از {commify(Math.round(totals.budget))} ظرفیت
                </span>
              ) : null}
            </p>
            <div className="space-y-1.5">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="absolute inset-y-0 start-0 rounded-full"
                  style={{
                    width: `${Math.max(2, Math.min(100, Number(performanceLabel) || totals.usedRatio * 100))}%`,
                    backgroundColor:
                      overallMetric?.color ?? "rgb(var(--primary) / 0.45)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] tabular-nums text-primary/45">
                <span>
                  {Math.round(
                    Number(performanceLabel) || totals.usedRatio * 100,
                  )}
                  % عملکرد
                </span>
                {performanceLabel != null ? (
                  <span style={{ color: overallMetric?.color }}>
                    {formatMetricValue(Number(performanceLabel))}%
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border-color/10">
            <div className="grid w-full grid-cols-[minmax(max-content,1fr)_4.5rem_4.5rem_1.25rem] items-center gap-2 border-b border-border-color/10 bg-third/40 px-3 py-2 text-[10px] font-medium tracking-wide text-primary/40">
              <span>شاخص</span>
              <span className="text-end">تعداد</span>
              <span className="text-end">عملکرد</span>
              <span />
            </div>
            <ul className="divide-y divide-border-color/10">
              {rows.map((row) => {
                const focused = activeId === row.id;
                const selected = selectedId === row.id;
                const perfDisplay =
                  row.performance != null
                    ? formatMetricValue(row.performance)
                    : null;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(row.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onFocus={() => setActiveId(row.id)}
                      onBlur={() => setActiveId(null)}
                      onClick={() => {
                        setSelectedId((current) =>
                          current === row.id ? null : row.id,
                        );
                        onSelectMetric?.(row.id);
                      }}
                      className={cn(
                        "grid w-full grid-cols-[minmax(max-content,1fr)_4.5rem_4.5rem_1.25rem] items-center gap-2 px-3 py-2.5 text-start transition-colors",
                        focused || selected
                          ? "bg-primary/8"
                          : "hover:bg-primary/5",
                      )}
                    >
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="shrink-0 text-xs font-medium text-primary">
                          {row.name}
                        </span>
                        {row.status === "over" ? (
                          <Badge size="sm" tone="danger" pill>
                            بیش‌ازحد
                          </Badge>
                        ) : row.status === "at_risk" ? (
                          <Badge
                            size="sm"
                            tone="warning"
                            outline
                            pill
                          >
                            در خطر
                          </Badge>
                        ) : null}
                      </span>
                      <span className="text-end text-xs font-semibold tabular-nums text-primary">
                        {commify(row.spent)}
                      </span>
                      <span
                        className="text-end text-xs font-semibold tabular-nums"
                        style={{
                          color:
                            perfDisplay != null
                              ? row.color
                              : "rgb(var(--primary) / 0.35)",
                        }}
                      >
                        {perfDisplay == null ? "—" : `${perfDisplay}%`}
                      </span>
                      <ChevronLeftIcon className="size-3.5 justify-self-end text-primary/30" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <footer className="flex flex-wrap items-center gap-3 px-1 text-[10px] text-primary/45">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-px w-4 border-t border-dashed border-primary/40"
              />
              ظرفیت (ok-max)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-amber-400"
              />
              در خطر
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[9px] text-white"
              >
                بیش‌ازحد
              </span>
              بیش از ظرفیت
            </span>
          </footer>
        </div>
      </div>
    </section>
  );
}
