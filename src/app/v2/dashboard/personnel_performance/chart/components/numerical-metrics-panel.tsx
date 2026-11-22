"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, TrendingUpIcon } from "lucide-react";
import {
  AnimatedNumber,
  DonutChart,
  DonutChartCenter,
  DonutChartPlot,
  type DonutSegment,
} from "~/components/beui";
import { Badge } from "~/components/arc/badge/badge";
import {
  Indicators,
  PersonnelPerformanceTranslate,
} from "~/constants/personnel-performance";
import { cn } from "~/lib/utils";
import { commify } from "~/utils/util";

const SEGMENT_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#22d3ee",
  "#14b8a6",
  "#f97316",
  "#ec4899",
  "#a78bfa",
  "#38bdf8",
  "#2dd4bf",
  "#fb923c",
  "#f472b6",
  "#818cf8",
] as const;

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
  left: number | null;
  contribution: number;
  status: MetricStatus;
  segmentValue: number;
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
  let colorIndex = 0;

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
    const left = budget != null ? budget - spent : null;
    const contribution =
      budget != null && budget > 0 ? (spent / budget) * 100 : 0;
    // Prefer contribution weight so different activity types share the ring fairly;
    // fall back to raw count when no indicator exists.
    const segmentValue =
      budget != null && budget > 0 ? Math.max(contribution, 0.01) : spent;

    rows.push({
      id: item.key,
      name: PersonnelPerformanceTranslate[item.key] ?? item.key,
      color: SEGMENT_COLORS[colorIndex++ % SEGMENT_COLORS.length]!,
      spent,
      budget,
      left,
      contribution,
      status: resolveStatus(spent, budget),
      segmentValue,
    });
  }
  return rows;
}

export type NumericalMetricsPanelProps = {
  items: NumericalMetricItem[];
  /** Period day count used with Indicators for capacity (budget). */
  dateLength?: number;
  /** Overall performance % for the summary progress bar. */
  totalPerformance?: number | null;
  className?: string;
  onSelectMetric?: (key: string) => void;
};

/**
 * Cloud Spend–style numerical panel: beUI donut + category list with
 * capacity (Indicators × days), remaining, and Over / At Risk badges.
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

  const segments: DonutSegment[] = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        value: row.segmentValue,
      })),
    [rows],
  );

  const totals = useMemo(() => {
    const spent = rows.reduce((sum, row) => sum + row.spent, 0);
    const budget = rows.reduce(
      (sum, row) => sum + (row.budget ?? 0),
      0,
    );
    const hasBudget = rows.some((row) => row.budget != null);
    const left = hasBudget ? budget - spent : null;
    const usedRatio =
      hasBudget && budget > 0
        ? Math.min(1, spent / budget)
        : totalPerformance != null
          ? Math.min(1, Math.max(0, totalPerformance / 100))
          : 0;
    return { spent, budget, left, hasBudget, usedRatio };
  }, [rows, totalPerformance]);

  const performanceLabel =
    totalPerformance != null && Number.isFinite(totalPerformance)
      ? formatMetricValue(totalPerformance)
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
            سهم حلقه بر اساس وزن عملکرد؛ ظرفیت از شاخص استاندارد دوره است
          </p>
        </div>
        {performanceLabel != null ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-border-color/10 bg-third px-2.5 py-1 text-[11px] tabular-nums text-primary/70">
            <TrendingUpIcon className="size-3.5 text-primary/45" />
            عملکرد کلی {performanceLabel}%
          </div>
        ) : null}
      </header>

      <div className="grid items-start gap-4 p-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <DonutChart
          segments={segments}
          activeId={activeId}
          onActiveChange={setActiveId}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId((current) => (current === id ? null : id));
            onSelectMetric?.(id);
          }}
          formatValue={(value) =>
            `${formatMetricValue(value).toLocaleString("fa-IR")}`
          }
          label="توزیع شاخص‌های عددی"
          labels={{ total: "مجموع", label: "شاخص‌های عددی" }}
          className="min-w-0"
        >
          <DonutChartPlot className="max-w-[14rem]">
            <DonutChartCenter totalLabel="سهم کل">
              {(segment, total) => {
                const row = segment
                  ? rows.find((r) => r.id === segment.id)
                  : null;
                const centerValue = row
                  ? Math.round(row.contribution || segment.share * 100)
                  : performanceLabel != null
                    ? Math.round(Number(performanceLabel))
                    : Math.round(
                        totals.usedRatio * 100 ||
                          (total > 0 ? 100 : 0),
                      );
                const caption = row
                  ? row.name
                  : totals.hasBudget && totals.left != null
                    ? `${commify(Math.round(Math.max(0, totals.left)))} باقی‌مانده`
                    : "استفاده از ظرفیت";

                return (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-primary/45">
                      {row ? "مصرف ظرفیت" : "عملکرد"}
                    </span>
                    <span className="text-2xl font-semibold tracking-tight tabular-nums text-primary">
                      <AnimatedNumber
                        value={centerValue}
                        startOnView={false}
                        format={(n) => `${Math.round(n)}%`}
                        className="text-2xl font-semibold text-primary"
                      />
                    </span>
                    <span className="line-clamp-2 max-w-[9rem] text-[10px] leading-snug text-primary/50">
                      {caption}
                    </span>
                  </div>
                );
              }}
            </DonutChartCenter>
          </DonutChartPlot>
        </DonutChart>

        <div className="min-w-0 space-y-3">
          <div className="space-y-2 rounded-xl border border-border-color/10 bg-third/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-primary/55">
                مجموع فعالیت
              </span>
              {performanceLabel != null ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] tabular-nums",
                    Number(performanceLabel) >= 100
                      ? "text-rose-400"
                      : Number(performanceLabel) >= 85
                        ? "text-amber-400"
                        : "text-emerald-400",
                  )}
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
                  className="absolute inset-y-0 start-0 rounded-full bg-primary/45"
                  style={{
                    width: `${Math.max(2, totals.usedRatio * 100)}%`,
                  }}
                />
                <div
                  className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary shadow"
                  style={{
                    insetInlineStart: `calc(${Math.min(100, totals.usedRatio * 100)}% - 4px)`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] tabular-nums text-primary/45">
                <span>
                  {Math.round(totals.usedRatio * 100)}% مصرف
                </span>
                {totals.left != null ? (
                  <span
                    className={cn(
                      totals.left < 0 && "text-rose-400",
                    )}
                  >
                    {totals.left < 0 ? "−" : ""}
                    {commify(Math.round(Math.abs(totals.left)))} باقی
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border-color/10">
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_1.25rem] gap-2 border-b border-border-color/10 bg-third/40 px-3 py-2 text-[10px] font-medium tracking-wide text-primary/40">
              <span>شاخص</span>
              <span className="text-end">مصرف</span>
              <span className="text-end">باقی</span>
              <span />
            </div>
            <ul className="divide-y divide-border-color/10">
              {rows.map((row) => {
                const focused = activeId === row.id;
                const selected = selectedId === row.id;
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
                        "grid w-full grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_1.25rem] items-center gap-2 px-3 py-2.5 text-start transition-colors",
                        focused || selected
                          ? "bg-primary/8"
                          : "hover:bg-primary/5",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="min-w-0 truncate text-xs font-medium text-primary">
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
                        className={cn(
                          "text-end text-xs tabular-nums",
                          row.left != null && row.left < 0
                            ? "text-rose-400"
                            : "text-primary/45",
                        )}
                      >
                        {row.left == null
                          ? "—"
                          : row.left < 0
                            ? `−${commify(Math.round(Math.abs(row.left)))}`
                            : commify(Math.round(row.left))}
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
              ظرفیت
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
