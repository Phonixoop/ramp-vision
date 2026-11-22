import React from "react";
import { SparkAreaChart } from "@tremor/react";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";
import { TrendDecider } from "~/features/trend-decider";
import {
  sparkChartForPersonnel,
  getPersonnelDisplayName,
} from "~/utils/personnel-performance";

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  PersonnelCode?: string;
  NameFamily?: string;
  Role?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

interface PersonnelRowOptimizedProps {
  user: PersonRecord;
  activeKey: {
    nc?: string;
    name?: string;
    role?: string;
    city?: string;
    id?: string | number;
  };
  getAllData: any[];
  onSelect: (sparkData: any[]) => void;
  isActive: boolean;
  /** Name-only narrow rail (v2 chart compact mode). */
  compact?: boolean;
}

export const PersonnelRowOptimized = React.memo<PersonnelRowOptimizedProps>(
  ({ user, activeKey, getAllData, onSelect, isActive, compact = false }) => {
    const userPerformances = React.useMemo(() => {
      return (getAllData || [])
        .filter((x: any) => x.NameFamily === user.NameFamily)
        .map((m: any) => m.TotalPerformance);
    }, [getAllData, user.NameFamily]);

    const sparkData = React.useMemo(() => {
      return sparkChartForPersonnel(
        getAllData,
        "NameFamily",
        user.NameFamily,
        ["BranchName", "Role"],
        {
          NationalCode: user.NationalCode,
          CityName: user.CityName || user.key?.CityName,
        },
      );
    }, [
      getAllData,
      user.NameFamily,
      user.NationalCode,
      user.CityName,
      user.key?.CityName,
    ]);

    const handleClick = React.useCallback(() => {
      onSelect(sparkData);
    }, [onSelect, sparkData]);

    const displayName = getPersonnelDisplayName(
      user.NameFamily ?? "",
      user.CityName || user.key?.CityName,
      user.RealCityName,
    );

    if (!user?.NationalCode && !user?.key?.NationalCode && !user?.NameFamily) {
      return (
        <div
          className={cn(
            "flex w-full animate-pulse items-center rounded-xl bg-secondary/60 text-primary",
            compact
              ? "justify-center px-1 py-2"
              : "flex-row-reverse justify-between gap-2 p-3 text-right",
          )}
        >
          {compact ? (
            <span className="h-8 w-full rounded-lg bg-secbuttn" />
          ) : (
            <>
              <span className="h-5 w-10 rounded-lg bg-secbuttn" />
              <div className="flex w-full items-center justify-start px-2">
                <span className="w-40 rounded-lg bg-secbuttn py-5" />
              </div>
              <span className="h-5 w-10 rounded-lg bg-secbuttn" />
              <span className="h-4 w-4 rounded-lg bg-secbuttn" />
            </>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "w-full rounded-xl",
          isActive
            ? "sticky top-36 z-20"
            : "bg-secondary hover:scale-[0.98] active:scale-[0.96]",
        )}
      >
        <Button
          className={cn(
            "h-auto w-full cursor-pointer rounded-xl py-2 transition-all duration-200 ease-out",
            isActive
              ? "bg-primary/90 text-secondary"
              : "bg-secondary hover:scale-[0.98] active:scale-[0.96]",
          )}
          onClick={handleClick}
          title={displayName}
        >
          {compact ? (
            <div className="flex w-full flex-col items-center justify-center gap-0.5 px-1 py-0.5 text-inherit">
              <span className="w-full break-words text-center text-xs leading-tight">
                {displayName}
              </span>
            </div>
          ) : (
            <div className="flex w-full flex-row-reverse items-center gap-2 px-2 text-right text-inherit">
              {user.Start_Date && (
                <div className="w-8 shrink-0">
                  {isActive ? (
                    <BarChart3Loading />
                  ) : (
                    <ChevronLeftIcon className="h-4 w-4 stroke-primary" />
                  )}
                </div>
              )}

              <div className="flex w-12 shrink-0 flex-col items-center justify-center">
                <TrendDecider values={userPerformances} />
                <span className="text-xs tabular-nums">
                  {Math.round(user.TotalPerformance || 0)}%
                </span>
              </div>

              <div className="flex w-28 shrink-0 items-center justify-center sm:w-36">
                <SparkAreaChart
                  data={sparkData}
                  categories={[
                    "TotalPerformance",
                    "Benchmark",
                    "Benchmark2",
                    "Benchmark3",
                  ]}
                  noDataText="بدون داده"
                  index="Start_Date"
                  colors={["purple", "rose", "cyan"]}
                  className={cn(
                    "dash-a pointer-events-none h-10 w-full",
                    isActive
                      ? "animate-path animate-[move_100s_linear_infinite]"
                      : "",
                  )}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-stretch gap-0.5 text-right">
                <span className="truncate text-sm font-medium leading-5">
                  {displayName}
                </span>
              </div>
            </div>
          )}
          {isActive && (
            <div
              className="absolute inset-0 -z-20"
              data-framer-name="Mask Pattern"
              style={{
                backgroundColor: "transparent",
                backgroundImage:
                  "radial-gradient(transparent, rgba(var(--primary),0.9) 1px)",
                backgroundSize: "3px 3px",
                maskImage:
                  "linear-gradient(rgb(0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%)",
                WebkitMaskImage:
                  "linear-gradient(rgb(0, 0, 0) 100%, rgba(0, 0, 0, 0) 100%)",
                opacity: 1,
              }}
            />
          )}
        </Button>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.user.NationalCode === next.user.NationalCode &&
      prev.user.PersonnelCode === next.user.PersonnelCode &&
      prev.user.TotalPerformance === next.user.TotalPerformance &&
      prev.user.NameFamily === next.user.NameFamily &&
      prev.user.Role === next.user.Role &&
      (prev.user.CityName || prev.user.key?.CityName) ===
        (next.user.CityName || next.user.key?.CityName) &&
      prev.activeKey.nc === next.activeKey.nc &&
      prev.activeKey.name === next.activeKey.name &&
      prev.activeKey.role === next.activeKey.role &&
      prev.activeKey.city === next.activeKey.city &&
      prev.activeKey.id === next.activeKey.id &&
      prev.getAllData === next.getAllData &&
      prev.isActive === next.isActive &&
      prev.compact === next.compact
    );
  },
);

PersonnelRowOptimized.displayName = "PersonnelRowOptimized";
