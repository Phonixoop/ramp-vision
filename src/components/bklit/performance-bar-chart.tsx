"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart } from "~/components/charts/bar-chart";
import { BarXAxis } from "~/components/charts/bar-x-axis";
import { BrushStripChart, brushIndexDate } from "~/components/charts/brush-strip-chart";
import { ChartBrush } from "~/components/charts/chart-brush";
import { ChartBrushLayout } from "~/components/charts/chart-brush-layout";
import { filterDataByXDomain } from "~/components/charts/filter-data-by-x-domain";
import { Grid } from "~/components/charts/grid";
import { ChartTooltip } from "~/components/charts/tooltip";
import { YAxis } from "~/components/charts/y-axis";
import { getPerformanceMetric } from "~/utils/personnel-performance";
import { commify } from "~/utils/util";
import { cn } from "~/lib/utils";
import { ColoredBar } from "./colored-bar";

export type PerformanceBarDatum = {
  /** Category label (name or date) */
  label: string;
  /** Performance value */
  value: number;
  /** Optional payload passed back on click */
  payload?: Record<string, unknown>;
};

type PerformanceBarChartProps = {
  data: PerformanceBarDatum[];
  isLoading?: boolean;
  className?: string;
  heightClassName?: string;
  emptyMessage?: string;
  onBarClick?: (datum: PerformanceBarDatum, index: number) => void;
  xLabelMaxChars?: number;
  /**
   * Opt-in Bklit brush strip (zoom/pan range). Used on v2 performance charts;
   * leave off for shared / v1 callers.
   */
  enableBrush?: boolean;
  /** Brush strip height in px when `enableBrush` is on. Default: 64 */
  brushHeight?: number;
};

type BrushRow = {
  label: string;
  shortLabel: string;
  value: number;
  color: string;
  payload?: Record<string, unknown>;
  date: Date;
};

function truncateLabel(label: string, max: number) {
  if (label.length <= max) return label;
  return `${label.slice(0, Math.max(0, max - 1))}…`;
}

function PerformanceBars({
  chartData,
  isLoading,
  reduceMotion,
  onBarClick,
  heightClassName,
}: {
  chartData: BrushRow[];
  isLoading: boolean;
  reduceMotion: boolean;
  onBarClick?: PerformanceBarChartProps["onBarClick"];
  heightClassName: string;
}) {
  return (
    <div
      aria-label="نمودار عملکرد"
      className={cn("w-full min-w-0", heightClassName)}
      role="img"
    >
      <BarChart
        aspectRatio="16 / 9"
        barGap={0.22}
        className="h-full w-full"
        data={chartData}
        margin={{ top: 16, right: 12, bottom: 48, left: 44 }}
        status={isLoading ? "loading" : "ready"}
        xDataKey="shortLabel"
      >
        <Grid fadeHorizontal horizontal />
        <ColoredBar
          animate={!reduceMotion}
          dataKey="value"
          fill="rgb(var(--accent))"
          lineCap={4}
          onBarClick={
            onBarClick
              ? (point, index) => {
                  onBarClick(
                    {
                      label: String(point.label ?? ""),
                      value: Number(point.value) || 0,
                      payload: point.payload as
                        | Record<string, unknown>
                        | undefined,
                    },
                    index,
                  );
                }
              : undefined
          }
          stroke="rgb(var(--accent))"
        />
        <YAxis formatValue={(value) => commify(value)} numTicks={5} />
        <BarXAxis
          maxLabels={14}
          showAllLabels={chartData.length <= 18}
        />
        <ChartTooltip
          content={({ point }) => (
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--chart-tooltip-foreground)]">
                {String(point.label ?? "")}
              </span>
              <span
                className="tabular-nums"
                style={{
                  color:
                    typeof point.color === "string"
                      ? point.color
                      : "var(--chart-tooltip-muted)",
                }}
              >
                عملکرد: {commify(Number(point.value) || 0)}%
              </span>
            </div>
          )}
          showCrosshair={false}
          showDatePill={false}
          showDots={false}
        />
      </BarChart>
    </div>
  );
}

/**
 * Bklit vertical bar chart colored by personnel performance bands.
 * Used on the v2 personnel performance chart route only.
 */
export function PerformanceBarChart({
  data,
  isLoading = false,
  className,
  heightClassName = "h-[420px]",
  emptyMessage = "داده‌ای برای نمایش وجود ندارد",
  onBarClick,
  xLabelMaxChars = 10,
  enableBrush = false,
  brushHeight = 64,
}: PerformanceBarChartProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const chartData = useMemo<BrushRow[]>(
    () =>
      (data ?? []).map((row, index) => {
        const value = Math.max(0, Math.round(Number(row.value) || 0));
        const metric = getPerformanceMetric(value);
        return {
          label: row.label,
          shortLabel: truncateLabel(String(row.label ?? ""), xLabelMaxChars),
          value,
          color: metric.color,
          payload: row.payload,
          date: brushIndexDate(index),
        };
      }),
    [data, xLabelMaxChars],
  );

  const empty = !isLoading && chartData.length === 0;
  const brushActive = enableBrush && chartData.length > 1;

  if (empty) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-xl border border-border-color/10 bg-fourth/40 text-sm text-primary/60",
          heightClassName,
          className,
        )}
        role="status"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
      dir="ltr"
    >
      {brushActive ? (
        <ChartBrushLayout
          brushStrip={(layout) => (
            <BrushStripChart
              data={chartData}
              dataKey="value"
              style={{ aspectRatio: "unset", height: "100%" }}
              xDataKey="date"
            >
              <ChartBrush
                fadeOuterEdges
                initialSelection={layout.brushSelection ?? undefined}
                onSelectionChange={layout.onBrushSelectionChange}
                selectionPattern={{
                  color:
                    "color-mix(in oklch, var(--chart-1) 22%, transparent)",
                  preset: "diagonal",
                }}
              />
            </BrushStripChart>
          )}
          data={chartData}
          enabled
          height={brushHeight}
          xDataKey="date"
        >
          {(layout) => {
            const visible =
              layout.xDomain != null
                ? (filterDataByXDomain(
                    chartData,
                    layout.xDomain,
                    (row) => {
                      const value = row.date;
                      return value instanceof Date
                        ? value
                        : new Date(value as string | number);
                    },
                  ) as BrushRow[])
                : chartData;

            return (
              <PerformanceBars
                chartData={visible.length > 0 ? visible : chartData}
                heightClassName={heightClassName}
                isLoading={isLoading}
                onBarClick={onBarClick}
                reduceMotion={reduceMotion}
              />
            );
          }}
        </ChartBrushLayout>
      ) : (
        <PerformanceBars
          chartData={chartData}
          heightClassName={heightClassName}
          isLoading={isLoading}
          onBarClick={onBarClick}
          reduceMotion={reduceMotion}
        />
      )}
    </div>
  );
}
