"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { DigitSwap } from "~/components/beui/digit-swap";
import { EASE_OUT } from "~/components/beui/ease";
import { cn } from "~/lib/utils";
import { useDonutChart } from "./context";
import type { PlacedSegment } from "./model";

export type DonutChartCenterProps = {
  children?: (segment: PlacedSegment | null, total: number) => ReactNode;
  totalLabel?: ReactNode;
  className?: string;
};

export function DonutChartCenter({
  children,
  totalLabel,
  className,
}: DonutChartCenterProps) {
  const { placed, active, total, formatValue, reduce, t, centerFitPercent } =
    useDonutChart();
  const segment = placed.find((item) => item.id === active) ?? null;
  const value = segment?.value ?? total;
  const [previous, setPrevious] = useState(value);
  const [direction, setDirection] = useState<"up" | "down">("up");
  if (value !== previous) {
    setPrevious(value);
    setDirection(value > previous ? "up" : "down");
  }

  // Geometry-based box (inline style wins over Tailwind max-w overrides) so
  // center copy stays inside the hole's inscribed square and never hits the ring.
  const fitStyle = {
    maxWidth: `${centerFitPercent}%`,
    maxHeight: `${centerFitPercent}%`,
  } as const;

  if (children) {
    return (
      <div
        aria-live="polite"
        className={cn(
          "relative flex max-h-full items-center justify-center overflow-hidden",
          className,
        )}
        style={fitStyle}
      >
        {children(segment, total)}
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "relative flex max-h-full flex-col items-center justify-center overflow-hidden",
        className,
      )}
      style={fitStyle}
    >
      <p className="text-2xl font-medium tracking-tight tabular-nums">
        <DigitSwap value={formatValue(value)} direction={direction} />
      </p>
      <div className="relative mt-1 h-4 w-full overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            key={segment?.id ?? "total"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%" }}
            transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap text-xs leading-4 text-primary/55"
          >
            {segment ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="truncate">
                  {segment.name} · {(segment.share * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              (totalLabel === undefined ? t("total") : totalLabel)
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
