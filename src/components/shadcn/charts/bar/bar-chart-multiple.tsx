"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar } from "~/components/charts/bar";
import { BarChart } from "~/components/charts/bar-chart";
import { BarXAxis } from "~/components/charts/bar-x-axis";
import { Grid } from "~/components/charts/grid";
import { ChartTooltip } from "~/components/charts/tooltip";
import { YAxis } from "~/components/charts/y-axis";
import { DEPO_CHART_COLORS } from "~/constants/depo-chart-colors";
import { cn } from "~/lib/utils";
import { commify } from "~/utils/util";

export const description = "Bklit bar chart — multiple series";

export type DepoBarDatum = {
  name: string;
  depoCount: number;
  entryCount: number;
  capacityCount: number;
};

const SERIES = [
  {
    dataKey: "depoCount",
    label: "تعداد دپو",
    color: DEPO_CHART_COLORS.depo,
  },
  {
    dataKey: "entryCount",
    label: "تعداد ورودی",
    color: DEPO_CHART_COLORS.entry,
  },
  {
    dataKey: "capacityCount",
    label: "تعداد رسیدگی",
    color: DEPO_CHART_COLORS.capacity,
  },
] as const;

const SERIES_BY_KEY = Object.fromEntries(
  SERIES.map((series) => [series.dataKey, series]),
) as Record<(typeof SERIES)[number]["dataKey"], (typeof SERIES)[number]>;

export function ChartBarMultiple({
  data,
  className,
  isLoading = false,
}: {
  data: DepoBarDatum[];
  className?: string;
  isLoading?: boolean;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const chartData = useMemo(
    () =>
      (data ?? []).map((row) => ({
        name: row.name,
        depoCount: Math.max(0, Number(row.depoCount) || 0),
        entryCount: Math.max(0, Number(row.entryCount) || 0),
        capacityCount: Math.max(0, Number(row.capacityCount) || 0),
      })),
    [data],
  );

  const empty = !isLoading && chartData.length === 0;

  if (empty) {
    return (
      <div
        className={cn(
          "flex h-72 w-full items-center justify-center rounded-xl border border-primary/10 bg-secondary/40 text-sm text-primary/60",
          className,
        )}
        role="status"
      >
        داده‌ای برای نمودار وجود ندارد
      </div>
    );
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      <div
        aria-label="نمودار میله‌ای به تفکیک فعالیت"
        className="w-full min-w-0"
        dir="ltr"
        role="img"
      >
        <BarChart
          aspectRatio="32 / 9"
          barGap={0.28}
          className="w-full"
          data={chartData}
          margin={{ top: 20, right: 16, bottom: 36, left: 48 }}
          status={isLoading ? "loading" : "ready"}
          xDataKey="name"
        >
          <Grid fadeHorizontal horizontal />
          {SERIES.map((series) => (
            <Bar
              key={series.dataKey}
              animate={!reduceMotion}
              dataKey={series.dataKey}
              fill={series.color}
              groupGap={3}
              lineCap={4}
              stroke={series.color}
            />
          ))}
          <YAxis formatValue={(value) => commify(value)} numTicks={5} />
          <BarXAxis showAllLabels />
          <ChartTooltip
            rows={(point) =>
              SERIES.map((series) => ({
                color: series.color,
                label: series.label,
                value: commify(Number(point[series.dataKey]) || 0),
              }))
            }
            showCrosshair={false}
            showDots={false}
          />
        </BarChart>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {SERIES.map((series) => (
          <li
            className="flex items-center gap-2 text-sm text-primary"
            key={series.dataKey}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: SERIES_BY_KEY[series.dataKey].color }}
            />
            <span>{series.label}</span>
          </li>
        ))}
      </ul>

      <table className="sr-only">
        <caption>نمودار میله‌ای به تفکیک فعالیت</caption>
        <thead>
          <tr>
            <th scope="col">فعالیت</th>
            {SERIES.map((series) => (
              <th key={series.dataKey} scope="col">
                {series.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td>{commify(row.depoCount)}</td>
              <td>{commify(row.entryCount)}</td>
              <td>{commify(row.capacityCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
