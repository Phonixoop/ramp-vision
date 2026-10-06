"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Legend,
  LegendItem,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
} from "~/components/charts/legend";
import { PieCenter } from "~/components/charts/pie-center";
import { PieChart } from "~/components/charts/pie-chart";
import type { PieData } from "~/components/charts/pie-context";
import { PieSlice } from "~/components/charts/pie-slice";
import { cn } from "~/lib/utils";
import { commify } from "~/utils/util";

export const description = "Bklit pie chart with synced legend";

type DepoPieDatum = {
  name: string;
  value: number;
  fill: string;
};

const CHART_SIZE = 200;
const INNER_RADIUS = 60;
const MIN_CHART_SIZE = 140;

function toPieData(data: DepoPieDatum[]): PieData[] {
  return data.map((item) => ({
    label: item.name,
    value: Math.max(0, Number(item.value) || 0),
    color: item.fill,
  }));
}

export function ChartPieLabel({
  data,
  className,
  centerLabel = "مجموع",
  ariaLabel = "نمودار دایره‌ای",
}: {
  data: DepoPieDatum[];
  className?: string;
  centerLabel?: string;
  ariaLabel?: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState(CHART_SIZE);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const updateSize = () => {
      const width = el.clientWidth || CHART_SIZE;
      setChartSize(
        Math.max(MIN_CHART_SIZE, Math.min(CHART_SIZE, Math.floor(width))),
      );
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const innerRadius = Math.round(
    chartSize * (INNER_RADIUS / CHART_SIZE),
  );

  const pieData = useMemo(() => toPieData(data ?? []), [data]);
  const totalValue = useMemo(
    () => pieData.reduce((sum, item) => sum + item.value, 0),
    [pieData],
  );

  const legendItems = useMemo(
    () =>
      pieData.map((item) => ({
        label: item.label,
        value: item.value,
        color: item.color ?? "var(--chart-1)",
        maxValue: totalValue > 0 ? totalValue : undefined,
      })),
    [pieData, totalValue],
  );

  if (pieData.length === 0 || totalValue <= 0) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full max-w-[200px] items-center justify-center rounded-xl border border-primary/10 bg-secondary/40 text-sm text-primary/60",
          className,
        )}
        role="status"
      >
        داده‌ای برای نمودار وجود ندارد
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-full flex-col items-stretch gap-3",
        className,
      )}
    >
      <div
        aria-label={ariaLabel}
        className="mx-auto aspect-square w-full max-w-[200px]"
        ref={chartRef}
        role="img"
      >
        <PieChart
          data={pieData}
          hoveredIndex={hoveredIndex}
          innerRadius={innerRadius}
          onHoverChange={setHoveredIndex}
          padAngle={0.02}
          size={chartSize}
        >
          {pieData.map((item, index) => (
            <PieSlice
              key={item.label}
              animate={!reduceMotion}
              hoverEffect={reduceMotion ? "none" : "grow"}
              index={index}
              showGlow={!reduceMotion}
            />
          ))}
          <PieCenter defaultLabel={centerLabel} />
        </PieChart>
      </div>

      <div className="min-w-0 w-full">
        <Legend
          className="w-full"
          hoveredIndex={hoveredIndex}
          items={legendItems}
          onHoverChange={setHoveredIndex}
        >
          <LegendItem className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-lg px-1.5 py-1.5 focus-within:ring-2 focus-within:ring-accent/40">
            <LegendMarker className="h-2.5 w-2.5 shrink-0" />
            <LegendLabel className="min-w-0 truncate text-sm font-medium" />
            <LegendValue
              className="shrink-0 text-sm tabular-nums text-legend-foreground"
              formatPercentage={(percentage) => `${percentage.toFixed(0)}٪`}
              formatValue={(value) => commify(value)}
              percentageClassName="text-xs tabular-nums text-legend-muted-foreground"
              showPercentage
            />
            <div className="col-span-3 min-w-0">
              <LegendProgress height="h-1" trackClassName="bg-primary/10" />
            </div>
          </LegendItem>
        </Legend>

        <table className="sr-only">
          <caption>{ariaLabel}</caption>
          <thead>
            <tr>
              <th scope="col">دسته</th>
              <th scope="col">مقدار</th>
              <th scope="col">درصد</th>
            </tr>
          </thead>
          <tbody>
            {legendItems.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{commify(item.value)}</td>
                <td>
                  {item.maxValue
                    ? `${((item.value / item.maxValue) * 100).toFixed(0)}٪`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
