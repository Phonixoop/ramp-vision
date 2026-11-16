"use client";

/**
 * Minimal time-scale chart host for `ChartBrush` strips.
 * Provides ChartProvider + a simple area silhouette so bar charts can use
 * Bklit brush zoom without installing AreaChart/LineChart.
 */

import { ParentSize } from "@visx/responsive";
import { scaleLinear, scaleTime } from "@visx/scale";
import { area as d3Area } from "d3-shape";
import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/utils";
import {
  ChartProvider,
  type ChartContextValue,
  type Margin,
  chartCssVars,
} from "./chart-context";
import { DEFAULT_CHART_LIFECYCLE } from "./chart-phase";
import { wrapSingleYScale } from "./y-axis-scales";

const STRIP_MARGIN: Margin = { top: 6, right: 10, bottom: 6, left: 10 };

/** Stable synthetic dates for categorical brush zoom (index → day). */
export function brushIndexDate(index: number): Date {
  return new Date(Date.UTC(2020, 0, 1 + index));
}

type BrushStripChartProps = {
  data: Record<string, unknown>[];
  xDataKey?: string;
  dataKey?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  margin?: Partial<Margin>;
};

function BrushStripChartInner({
  width,
  height,
  data,
  xDataKey,
  dataKey,
  children,
  margin: marginProp,
}: {
  width: number;
  height: number;
  data: Record<string, unknown>[];
  xDataKey: string;
  dataKey: string;
  children?: ReactNode;
  margin: Margin;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setTooltipData] = useState<ChartContextValue["tooltipData"]>(null);

  const margin = marginProp;
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xAccessor = useMemo(
    () => (d: Record<string, unknown>): Date => {
      const value = d[xDataKey];
      return value instanceof Date ? value : new Date(value as string | number);
    },
    [xDataKey],
  );

  const xScale = useMemo(() => {
    if (data.length === 0 || innerWidth <= 0) {
      return scaleTime<number>({
        range: [0, Math.max(innerWidth, 1)],
        domain: [brushIndexDate(0), brushIndexDate(1)],
      });
    }
    const times = data.map((d) => xAccessor(d).getTime());
    const min = Math.min(...times);
    const max = Math.max(...times);
    return scaleTime<number>({
      range: [0, innerWidth],
      domain: [new Date(min), new Date(max === min ? max + 1 : max)],
    });
  }, [data, innerWidth, xAccessor]);

  const yScale = useMemo(() => {
    let max = 0;
    for (const row of data) {
      const value = Number(row[dataKey]);
      if (Number.isFinite(value) && value > max) {
        max = value;
      }
    }
    return scaleLinear<number>({
      range: [innerHeight, 0],
      domain: [0, max > 0 ? max * 1.05 : 1],
      nice: true,
    });
  }, [data, dataKey, innerHeight]);

  const areaPath = useMemo(() => {
    if (data.length === 0 || innerWidth <= 0 || innerHeight <= 0) {
      return "";
    }
    const generator = d3Area<Record<string, unknown>>()
      .x((d) => xScale(xAccessor(d)) ?? 0)
      .y0(innerHeight)
      .y1((d) => {
        const value = Number(d[dataKey]);
        return yScale(Number.isFinite(value) ? value : 0) ?? innerHeight;
      });
    return generator(data) ?? "";
  }, [data, dataKey, innerHeight, innerWidth, xAccessor, xScale, yScale]);

  const contextValue = useMemo<ChartContextValue>(
    () => ({
      ...DEFAULT_CHART_LIFECYCLE,
      data,
      renderData: data,
      xScale,
      yScale,
      yScales: wrapSingleYScale(yScale),
      width,
      height,
      innerWidth,
      innerHeight,
      margin,
      columnWidth: data.length > 0 ? innerWidth / data.length : 0,
      tooltipData: null,
      setTooltipData,
      containerRef,
      lines: [
        {
          dataKey,
          stroke: chartCssVars.linePrimary,
          strokeWidth: 1.5,
        },
      ],
      referenceAreas: [],
      isLoaded: width > 0 && height > 0,
      animationDuration: 0,
      xAccessor,
      dateLabels: [],
    }),
    [
      data,
      dataKey,
      height,
      innerHeight,
      innerWidth,
      margin,
      width,
      xAccessor,
      xScale,
      yScale,
    ],
  );

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <ChartProvider value={contextValue}>
      <div className="relative size-full min-h-0 min-w-0" ref={containerRef}>
        <svg
          aria-hidden="true"
          className="block overflow-visible"
          height={height}
          width={width}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {areaPath ? (
              <path
                d={areaPath}
                fill={chartCssVars.linePrimary}
                fillOpacity={0.18}
                stroke={chartCssVars.linePrimary}
                strokeOpacity={0.45}
                strokeWidth={1.25}
              />
            ) : null}
            {children}
          </g>
        </svg>
      </div>
    </ChartProvider>
  );
}

/**
 * Compact chart shell for brush strips — time x-scale + area silhouette.
 */
export function BrushStripChart({
  data,
  xDataKey = "date",
  dataKey = "value",
  children,
  className,
  style,
  margin: marginProp,
}: BrushStripChartProps) {
  const margin = useMemo(
    () => ({ ...STRIP_MARGIN, ...marginProp }),
    [marginProp],
  );

  return (
    <div
      className={cn("relative size-full min-h-0 min-w-0", className)}
      style={style}
    >
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <BrushStripChartInner
            data={data}
            dataKey={dataKey}
            height={height}
            margin={margin}
            width={width}
            xDataKey={xDataKey}
          >
            {children}
          </BrushStripChartInner>
        )}
      </ParentSize>
    </div>
  );
}
