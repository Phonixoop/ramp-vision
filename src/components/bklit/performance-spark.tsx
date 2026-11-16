"use client";

import { AreaSparkline } from "~/components/charts/sparkline";
import { cn } from "~/lib/utils";

export type PerformanceSparkDatum = {
  TotalPerformance?: number | null;
  Start_Date?: string;
  [key: string]: unknown;
};

type PerformanceSparkProps = {
  data: PerformanceSparkDatum[];
  className?: string;
  height?: number;
  /** When false, disables hover (e.g. dense list rows). Default true for city rails. */
  interactive?: boolean;
  color?: string;
};

/**
 * Bklit area sparkline for personnel/city performance trends.
 * Replaces Tremor `SparkAreaChart` on the v2 personnel chart route.
 */
export function PerformanceSpark({
  data,
  className,
  height = 32,
  interactive = true,
  color = "rgb(var(--accent))",
}: PerformanceSparkProps) {
  const rows = (data ?? []).filter(
    (row) =>
      typeof row.TotalPerformance === "number" &&
      Number.isFinite(row.TotalPerformance),
  );

  if (rows.length === 0) {
    return <div aria-hidden className={cn("min-w-0", className)} style={{ height }} />;
  }

  return (
    <AreaSparkline
      animate
      className={cn("min-w-0", className)}
      color={color}
      crosshair={interactive ? "dashed" : false}
      curve="monotone"
      data={rows}
      dataKey="TotalPerformance"
      dot={interactive}
      fill="gradient"
      fillOpacity={0.35}
      height={height}
      interactive={interactive}
      padding={2}
      showHighlight={interactive}
      strokeWidth={1.5}
    />
  );
}
