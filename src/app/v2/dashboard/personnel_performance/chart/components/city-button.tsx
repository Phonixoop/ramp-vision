"use client";

import React, { useMemo } from "react";
import { PerformanceSpark } from "~/components/bklit";
import { performanceLevels } from "~/constants/personnel-performance";
import { TrendDecider } from "~/features/trend-decider";
import { cn } from "~/lib/utils";
import type { CityWithPerformanceData } from "~/types";
import { getPerformanceTextEn } from "~/utils/util";

interface CityRailRowProps {
  item: CityWithPerformanceData;
  isActive: boolean;
  isNavigating: boolean;
  sparkChartData: any[];
  cityPerformances: number[];
  onNavigate: (cityName: string) => void;
  compact?: boolean;
}

/** v2 city rail row — matches PersonnelRailRow chrome. */
export const CityRailRow = React.memo<CityRailRowProps>(
  ({
    item,
    isActive,
    isNavigating,
    sparkChartData,
    cityPerformances,
    onNavigate,
    compact = false,
  }) => {
    const levelColor = useMemo(
      () =>
        performanceLevels.find(
          (level) =>
            level.enText === getPerformanceTextEn(item.TotalPerformance),
        )?.color,
      [item.TotalPerformance],
    );

    return (
      <button
        type="button"
        title={item.CityName_Fa}
        disabled={isNavigating}
        onClick={() => onNavigate(item.CityName_En)}
        className={cn(
          "group flex w-full items-center rounded-xl border text-right transition-colors",
          compact ? "justify-center px-1 py-2" : "gap-2 px-2.5 py-2",
          isActive
            ? "border-accent/35 bg-accent/10 text-primary"
            : "border-transparent bg-third/70 text-primary hover:border-border-color/15 hover:bg-third",
          isNavigating && "pointer-events-none animate-pulse",
        )}
      >
        {compact ? (
          <span className="w-full break-words text-center text-[11px] leading-tight">
            {item.CityName_Fa}
          </span>
        ) : (
          <>
            <span
              className="mt-0.5 size-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  levelColor ?? "rgb(var(--primary) / 0.25)",
              }}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium leading-5">
                {item.CityName_Fa}
              </span>
              <span className="block truncate text-[10px] text-primary/45">
                {Math.round(item.DirectPerFormance || 0)}% مستقیم ·{" "}
                {Math.round(item.InDirectPerFormance || 0)}% غیرمستقیم
              </span>
            </span>
            <span className="hidden w-16 shrink-0 sm:block xl:block">
              <PerformanceSpark
                className="h-7 w-16 opacity-80"
                data={sparkChartData}
                height={28}
                interactive={false}
              />
            </span>
            <span className="flex shrink-0 flex-col items-center gap-0.5 text-[11px] tabular-nums text-primary/70">
              <TrendDecider values={cityPerformances} />
              {Math.round(item.TotalPerformance || 0)}%
            </span>
          </>
        )}
      </button>
    );
  },
);

CityRailRow.displayName = "CityRailRow";

/** @deprecated Prefer CityRailRow — kept as alias for any residual imports. */
export const CityButton = CityRailRow;
