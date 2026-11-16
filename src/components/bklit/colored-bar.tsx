"use client";

/**
 * Bar series that paints each datum with `datum.color` (fallback: `fill` prop).
 * Forked from Bklit `Bar` for performance-level coloring without changing the shared Bar.
 */

import type { scaleBand } from "@visx/scale";
import { motion } from "motion/react";
import { memo, useId, useMemo } from "react";
import {
  useChart,
  useChartStable,
  useYScale,
} from "~/components/charts/chart-context";
import { useChartLegendHover } from "~/components/charts/chart-legend-hover";
import { transitionWithDelay } from "~/components/charts/motion-utils";
import type { BarProps } from "~/components/charts/bar";

type ScaleBand<Domain extends { toString(): string }> = ReturnType<
  typeof scaleBand<Domain>
>;

type ColoredBarProps = BarProps & {
  onBarClick?: (datum: Record<string, unknown>, index: number) => void;
};

interface ColoredBarInnerProps extends ColoredBarProps {
  barScale: ScaleBand<string>;
  bandWidth: number;
  barXAccessor: (d: Record<string, unknown>) => string;
}

const ColoredBarInner = memo(function ColoredBarInner({
  dataKey,
  yAxisId,
  fill = "var(--chart-line-primary)",
  lineCap = "round",
  animate = true,
  fadedOpacity = 0.3,
  staggerDelay,
  groupGap = 4,
  stackGap = 0,
  minBarHeight = 0,
  onBarClick,
  barScale,
  bandWidth,
  barXAccessor,
}: ColoredBarInnerProps) {
  const {
    data,
    innerHeight,
    isLoaded,
    hoveredBarIndex,
    lines,
    orientation,
    stacked,
    stackOffsets,
    animationDuration,
    enterTransition,
    revealEpoch = 0,
  } = useChart();

  const totalAnimDuration = animationDuration || 1100;
  const staggerSpread = totalAnimDuration * 0.4;
  const calculatedStaggerDelay =
    staggerDelay ?? (data.length > 1 ? staggerSpread / 1000 / data.length : 0);
  const uniqueId = useId();
  const isHorizontal = orientation === "horizontal";
  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();

  const seriesIndex = useMemo(() => {
    const idx = lines.findIndex((l) => l.dataKey === dataKey);
    return idx >= 0 ? idx : 0;
  }, [lines, dataKey]);

  const seriesConfig = lines[seriesIndex];
  const valueScale = useYScale(yAxisId ?? seriesConfig?.yAxisId);
  const isLegendDimmed =
    legendHoveredIndex !== null && legendHoveredIndex !== seriesIndex;
  const seriesCount = lines.length;
  const isLastSeries = seriesIndex === seriesCount - 1;

  const barWidth = useMemo(() => {
    if (!bandWidth || seriesCount === 0) return 0;
    if (stacked) return bandWidth;
    const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
    return (bandWidth - effectiveGroupGap * (seriesCount - 1)) / seriesCount;
  }, [bandWidth, seriesCount, stacked, groupGap]);

  const cornerRadius = useMemo(() => {
    if (typeof lineCap === "number") return lineCap;
    if (lineCap === "round" && barWidth) return Math.min(barWidth / 2, 8);
    return 0;
  }, [lineCap, barWidth]);

  return (
    <g className={`colored-bar-series-${uniqueId}`}>
      {data.map((d, i) => {
        const value = d[dataKey];
        if (typeof value !== "number") return null;

        const categoryValue = barXAccessor(d);
        const bandPos = barScale(categoryValue) ?? 0;
        const scale = isHorizontal ? undefined : valueScale;
        if (!scale && !isHorizontal) return null;

        let x = 0;
        let y = 0;
        let barHeight = 0;
        let barW = barWidth;

        if (isHorizontal) {
          return null;
        }

        const valuePos = scale!(value) ?? 0;
        barHeight = innerHeight - valuePos;
        const effectiveGroupGap = seriesCount > 1 ? groupGap : 0;
        x = stacked
          ? bandPos
          : bandPos + seriesIndex * (barWidth + effectiveGroupGap);
        y = valuePos;

        if (!stacked && minBarHeight > 0 && value >= 0 && barHeight < minBarHeight) {
          const baselineY = scale!(0) ?? innerHeight;
          barHeight = minBarHeight;
          y = baselineY - minBarHeight;
        }

        if (stacked && stackOffsets) {
          const offset = stackOffsets.get(i)?.get(dataKey) ?? 0;
          const offsetY = scale!(offset) ?? innerHeight;
          const gapOffset = seriesIndex * stackGap;
          y = offsetY - barHeight - gapOffset;
          if (!isLastSeries && stackGap > 0) {
            barHeight = Math.max(0, barHeight - stackGap);
          }
        }

        const isFaded =
          (hoveredBarIndex !== null && hoveredBarIndex !== i) || isLegendDimmed;
        const barKey = `colored-bar-${dataKey}-${categoryValue}`;
        const applyRounding = !stacked || stackGap > 0 || isLastSeries;
        const rx = applyRounding ? cornerRadius : 0;
        const barFill =
          typeof d.color === "string" && d.color.length > 0 ? d.color : fill;
        const clickable = Boolean(onBarClick);

        if (animate && !isLoaded) {
          return (
            <motion.rect
              animate={{
                height: barHeight,
                y,
                opacity: isFaded ? fadedOpacity : 1,
              }}
              fill={barFill}
              height={0}
              initial={{ height: 0, y: innerHeight, opacity: 0 }}
              key={`${barKey}-${revealEpoch}`}
              onClick={
                clickable
                  ? (event) => {
                      event.stopPropagation();
                      onBarClick?.(d, i);
                    }
                  : undefined
              }
              rx={rx}
              ry={rx}
              style={{ cursor: clickable ? "pointer" : "default" }}
              transition={transitionWithDelay(
                enterTransition,
                calculatedStaggerDelay * i,
              )}
              width={barW}
              x={x}
            />
          );
        }

        return (
          <rect
            fill={barFill}
            height={barHeight}
            key={barKey}
            onClick={
              clickable
                ? (event) => {
                    event.stopPropagation();
                    onBarClick?.(d, i);
                  }
                : undefined
            }
            opacity={isFaded ? fadedOpacity : 1}
            rx={rx}
            ry={rx}
            style={{
              cursor: clickable ? "pointer" : "default",
              transition: "opacity 0.15s ease-in-out",
            }}
            width={barW}
            x={x}
            y={y}
          />
        );
      })}
    </g>
  );
});

export function ColoredBar(props: ColoredBarProps) {
  const { barScale, bandWidth, barXAccessor } = useChartStable();

  if (!(barScale && bandWidth && barXAccessor)) {
    return null;
  }

  return (
    <ColoredBarInner
      {...props}
      bandWidth={bandWidth}
      barScale={barScale}
      barXAccessor={barXAccessor}
    />
  );
}

ColoredBar.displayName = "Bar";
