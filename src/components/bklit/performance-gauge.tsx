"use client";

import { useMemo } from "react";
import { AnimatedNumber } from "~/components/beui";
import { RingChart } from "~/components/charts/ring-chart";
import { RingCenter } from "~/components/charts/ring-center";
import type { RingData } from "~/components/charts/ring-context";
import { Ring } from "~/components/charts/ring";
import { performanceLevels } from "~/constants/personnel-performance";
import { getPerformanceMetric } from "~/utils/personnel-performance";
import { cn } from "~/lib/utils";

/** Full ring = hitting ok-max (100%). Values above 100% stay full and change color. */
const TARGET_PERCENT = 100;
const GAUGE_SIZE = 144;

type PerformanceGaugeProps = {
  value?: number | null;
  className?: string;
  label?: string;
};

/**
 * Single progress ring for personnel % performance (bklit RingChart).
 * Arc fill = min(performance, 100) / maxValue 100; color from goodness band.
 * Center always shows the real performance % — no باقیمانده series.
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
      : Math.max(0, numericRaw);

  const metric = useMemo(
    () => (numeric == null ? null : getPerformanceMetric(numeric)),
    [numeric],
  );

  const ringData = useMemo<RingData[]>(() => {
    if (numeric == null || !metric) return [];

    return [
      {
        label: label ?? metric.tooltip?.text ?? "عملکرد",
        // Cap arc at ok-max; >100% keeps a full ring in excellent/review color.
        value: Math.min(numeric, TARGET_PERCENT),
        maxValue: TARGET_PERCENT,
        color: metric.color,
      },
    ];
  }, [label, metric, numeric]);

  if (numeric == null || !metric || ringData.length === 0) {
    return null;
  }

  const display = Math.round(numeric);
  const statusLabel =
    metric.tooltip?.text ??
    performanceLevels.find((level) => level.color === metric.color)?.text;

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-col items-center gap-1 text-center",
        className,
      )}
    >
      <RingChart
        data={ringData}
        size={GAUGE_SIZE}
        strokeWidth={14}
        ringGap={0}
        baseInnerRadius={48}
        padding={8}
        className="mx-auto"
      >
        <Ring index={0} showGlow={false} />
        <RingCenter defaultLabel={label ?? "عملکرد"}>
          {() => (
            <div className="flex items-center justify-center leading-none">
              <span
                className="text-base font-semibold tabular-nums sm:text-lg"
                style={{ color: metric.color }}
              >
                <AnimatedNumber
                  value={display}
                  format={(n) => `${Math.round(n)}%`}
                  duration={0.6}
                />
              </span>
            </div>
          )}
        </RingCenter>
      </RingChart>
      {label ? (
        <span className="text-[11px] text-primary/55">{label}</span>
      ) : null}
      <span className="text-sm tabular-nums text-primary">
        {numeric.toFixed(2)}
      </span>
      <span className="text-[11px] text-primary/45">{statusLabel}</span>
    </div>
  );
}
