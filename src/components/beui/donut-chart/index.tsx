"use client";
// Vendored from https://beui.dev/charts/donut-chart

import { cn } from "~/lib/utils";
import { DonutChartCenter } from "./center";
import {
  type DonutChartProps,
  DonutContext,
  useDonutModel,
} from "./context";
import { DonutChartLegend } from "./legend";
import { DonutChartPlot } from "./plot";

/**
 * A ring of rounded segments with a linked center readout and legend.
 */
export function DonutChart({ className, children, ...props }: DonutChartProps) {
  const model = useDonutModel(props);
  return (
    <DonutContext.Provider value={model}>
      <div className={cn("w-full", className)}>
        {children ?? (
          <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,16rem)_1fr]">
            <DonutChartPlot>
              <DonutChartCenter />
            </DonutChartPlot>
            <DonutChartLegend />
          </div>
        )}
      </div>
    </DonutContext.Provider>
  );
}

export { DonutChartCenter, type DonutChartCenterProps } from "./center";
export {
  type DonutChartMessages,
  type DonutChartProps,
  donutChartMessages,
  useDonutChart,
} from "./context";
export { DonutChartLegend, type DonutChartLegendProps } from "./legend";
export type {
  DonutSegment,
  PlacedSegment as DonutPlacedSegment,
} from "./model";
export { DonutChartPlot, type DonutChartPlotProps } from "./plot";
