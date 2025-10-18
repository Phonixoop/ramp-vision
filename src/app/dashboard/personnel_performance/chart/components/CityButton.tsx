import React from "react";
import { SparkAreaChart } from "@tremor/react";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";
import { TrendDecider } from "~/features/trend-decider";
import { CityWithPerformanceData } from "~/types";

interface CityButtonProps {
  item: CityWithPerformanceData;
  index: number;
  isActive: boolean;
  isNavigating: boolean;
  sparkChartData: any[];
  cityPerformances: number[];
  onNavigate: (cityName: string) => void;
}

export const CityButton = React.memo<CityButtonProps>(
  ({
    item,
    index,
    isActive,
    isNavigating,
    sparkChartData,
    cityPerformances,
    onNavigate,
  }) => {
    return (
      <div
        className={cn(
          " w-full  rounded-xl",
          isActive
            ? "sticky  top-24 z-20 "
            : "bg-secondary hover:scale-[0.98] active:scale-[0.96]",
        )}
      >
        <Button
          key={item.CityName_En ?? index}
          className={cn(
            "relative w-full cursor-pointer overflow-hidden rounded-xl py-2 transition-all duration-200 ease-out",
            isActive
              ? "bg-secondary/10 text-primary"
              : "bg-secondary hover:scale-[0.98] active:scale-[0.96]",
            isNavigating && "pointer-events-none animate-pulse bg-primary/20",
          )}
          onClick={() => onNavigate(item.CityName_En)}
        >
          <div className="relative flex w-full items-center justify-between gap-2 px-2 text-right text-inherit duration-1000">
            <span className="w-full text-sm">{item.CityName_Fa}</span>
            <div className="flex w-full items-center justify-center">
              <SparkAreaChart
                data={sparkChartData}
                noDataText="بدون داده"
                categories={[
                  "TotalPerformance",
                  "Benchmark",
                  "Benchmark2",
                  "Benchmark3",
                ]}
                index="Start_Date"
                colors={["purple", "rose", "cyan"]}
                className={cn(
                  "dash-a pointer-events-none h-10 w-36",
                  isActive
                    ? "animate-path animate-[move_100s_linear_infinite]"
                    : "",
                )}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <TrendDecider values={cityPerformances} />
              {Math.round(item.TotalPerformance)}%
            </div>

            <div className="w-10">
              {isActive ? (
                <BarChart3Loading />
              ) : (
                <ChevronLeftIcon className="h-4 w-4 stroke-primary" />
              )}
            </div>
          </div>
          {isActive && (
            <div
              className="absolute inset-0 -z-20"
              data-framer-name="Mask Pattern"
              style={{
                backgroundColor: "transparent",
                backgroundImage:
                  "radial-gradient(rgba(var(--primbuttn),0.9) 1px, rgba(var(--accent),0.9) 1px)",
                backgroundSize: "3px 3px",
                // backdropFilter: "blur(3px)",
                maskImage:
                  "linear-gradient(rgb(0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%)",
                WebkitMaskImage:
                  "linear-gradient(rgb(0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%)", // For Safari compatibility
                opacity: 1,
              }}
            />
          )}
        </Button>
      </div>
    );
  },
);

CityButton.displayName = "CityButton";
