"use client";

import { useMemo, useState } from "react";
import {
  DonutChart,
  DonutChartCenter,
  DonutChartPlot,
  type DonutSegment,
} from "~/components/beui/donut-chart";
import { AnimatedNumber } from "~/components/beui";
import { performanceLevels } from "~/constants/personnel-performance";
import { getPerformanceMetric } from "~/utils/personnel-performance";
import { cn } from "~/lib/utils";

/** Full ring = hitting ok-max (100%). Values above 100% stay full and change color. */
const TARGET_PERCENT = 100;
const TRACK_ID = "track";

type PerformanceGaugeProps = {
  value?: number | null;
  className?: string;
  label?: string;
};

/**
 * Partial progress ring for personnel % performance.
 * Background muted track only — no labeled باقیمانده segment.
 * Center always shows the performance % in its goodness color.
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

  const segments = useMemo<DonutSegment[]>(() => {
    if (numeric == null || !metric) return [];

    // Arc length caps at 100%; >100% keeps a full ring in excellent/review color.
    const fill = Math.min(numeric, TARGET_PERCENT);
    const track = Math.max(0, TARGET_PERCENT - fill);
    const next: DonutSegment[] = [];

    if (fill > 0) {
      next.push({
        id: "performance",
        name: metric.tooltip?.text ?? "عملکرد",
        value: fill,
        color: metric.color,
      });
    }

    // Unlabeled muted remainder so buildDonut can draw a partial arc.
    // Never expose as باقیمانده in UI / hover / legend.
    if (track > 0) {
      next.push({
        id: TRACK_ID,
        name: "",
        value: track,
        color: "transparent",
      });
    }

    return next;
  }, [metric, numeric]);

  // Ignore hover on the transparent track so center never flips to remainder.
  const [activeId, setActiveId] = useState<string | null>(null);

  if (numeric == null || !metric || segments.length === 0) {
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
      <DonutChart
        segments={segments}
        thickness={14}
        gap={0}
        activeId={activeId}
        onActiveChange={(id) => {
          setActiveId(id === TRACK_ID ? null : id);
        }}
        label={label ?? "عملکرد"}
        labels={{ total: label ?? "عملکرد", label: label ?? "عملکرد" }}
        formatValue={(v) => `${Math.round(v)}%`}
        className="mx-auto w-full min-w-0 max-w-[9rem]"
      >
        <DonutChartPlot className="max-w-[9rem]">
          <DonutChartCenter totalLabel={label}>
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
          </DonutChartCenter>
        </DonutChartPlot>
      </DonutChart>
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
