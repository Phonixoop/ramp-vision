"use client";

import { useMemo } from "react";
import { PieCenter } from "~/components/charts/pie-center";
import { PieChart } from "~/components/charts/pie-chart";
import { PieSlice } from "~/components/charts/pie-slice";
import { performanceLevels } from "~/constants/personnel-performance";
import { getPerformanceMetric } from "~/utils/personnel-performance";
import { cn } from "~/lib/utils";

const MAX_VALUE = 500;
const SIZE = 160;
const INNER_RADIUS = 52;

type PerformanceGaugeProps = {
  value?: number | null;
  className?: string;
  label?: string;
};

/**
 * Bklit donut gauge for personnel performance (replaces react-gauge-component on v2).
 * Value arc is colored by performance band; remainder uses muted track.
 */
export function PerformanceGauge({
  value,
  className,
  label,
}: PerformanceGaugeProps) {
  const numericRaw = value == null ? null : Number(value);
  const numeric =
    numericRaw == null || Number.isNaN(numericRaw)
      ? null
      : Math.max(0, Math.min(MAX_VALUE, numericRaw));

  const metric = useMemo(
    () => (numeric == null ? null : getPerformanceMetric(numeric)),
    [numeric],
  );

  const data = useMemo(() => {
    if (numeric == null || !metric) return [];
    const remaining = Math.max(0, MAX_VALUE - numeric);
    return [
      {
        label: metric.tooltip?.text ?? "عملکرد",
        value: numeric > 0 ? numeric : 0.0001,
        color: metric.color,
      },
      {
        label: "باقیمانده",
        value: remaining > 0 ? remaining : 0.0001,
        color: "rgba(var(--primary), 0.12)",
      },
    ];
  }, [metric, numeric]);

  if (numeric == null || !metric) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <PieChart
        className="text-primary"
        cornerRadius={6}
        data={data}
        hoverOffset={0}
        innerRadius={INNER_RADIUS}
        padAngle={0.02}
        size={SIZE}
      >
        {data.map((item, index) => (
          <PieSlice
            key={item.label}
            animate
            hoverEffect="none"
            index={index}
            showGlow={false}
          />
        ))}
        <PieCenter>
          {() => (
            <div className="flex flex-col items-center leading-tight">
              <span
                className="text-lg font-semibold tabular-nums"
                style={{ color: metric.color }}
              >
                {Math.round(numeric)}%
              </span>
              {label ? (
                <span className="text-[10px] text-primary/50">{label}</span>
              ) : null}
            </div>
          )}
        </PieCenter>
      </PieChart>
      <span className="text-sm tabular-nums text-primary">
        {numeric.toFixed(2)}
      </span>
      <span className="text-[11px] text-primary/45">
        {metric.tooltip?.text ??
          performanceLevels.find((level) => level.color === metric.color)
            ?.text}
      </span>
    </div>
  );
}
