import React from "react";
import { SparkAreaChart } from "@tremor/react";
import { ChevronLeftIcon } from "lucide-react";

import Button from "~/ui/buttons";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";
import { TrendDecider } from "~/features/trend-decider";
import { sparkChartForPersonnel } from "~/utils/personnel-performance";
import { cn } from "~/lib/utils";

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

interface PersonnelRowProps {
  user: PersonRecord;
  activeKey: { nc?: string; id?: string | number };
  getAllData: any[];
  onSelect: (sparkData: any[]) => void;
}

export const PersonnelRow = React.memo<PersonnelRowProps>(
  function PersonnelRow({ user, activeKey, getAllData, onSelect }) {
    const userPerformances = React.useMemo(() => {
      return (getAllData || [])
        .filter((x: any) => x.NameFamily === user.NameFamily)
        .map((m: any) => m.TotalPerformance);
    }, [getAllData, user.NameFamily]);

    const sparkData = React.useMemo(() => {
      return sparkChartForPersonnel(getAllData, "NameFamily", user.NameFamily, [
        "BranchName",
        "Role",
      ]);
    }, [getAllData, user.NameFamily]);

    const isActive = React.useMemo(() => {
      return (
        user.NationalCode === activeKey?.nc &&
        (user as any)?.Id === activeKey?.id
      );
    }, [user.NationalCode, user.Id, activeKey?.nc, activeKey?.id]);

    const handleClick = React.useCallback(() => {
      onSelect(sparkData);
    }, [onSelect, sparkData]);

    if (!user?.NationalCode) {
      return (
        <div className="flex w-full animate-pulse flex-row-reverse items-center justify-between gap-2 rounded-xl bg-secondary/60 p-3 text-right text-primary">
          <span className="h-5 w-10 rounded-lg bg-secbuttn" />
          <div className="flex w-full items-center justify-start px-2">
            <span className="w-40 rounded-lg bg-secbuttn py-5" />
          </div>
          <span className="h-5 w-10 rounded-lg bg-secbuttn" />
          <span className="h-4 w-4 rounded-lg bg-secbuttn" />
        </div>
      );
    }

    return (
      <Button
        className={cn(
          "w-full cursor-pointer rounded-xl py-2 transition-all duration-200 ease-out",
          isActive
            ? "sticky top-24 z-10 bg-primary/30 text-secondary backdrop-blur-md"
            : "bg-secondary hover:scale-[0.98] active:scale-[0.96]",
        )}
        onClick={handleClick}
      >
        <div className="flex w-full flex-row-reverse items-center justify-between gap-2 px-2 text-right text-inherit duration-1000">
          {user.Start_Date && (
            <div className="w-10">
              {isActive ? (
                <BarChart3Loading />
              ) : (
                <ChevronLeftIcon className="h-4 w-4 fill-none stroke-primary" />
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            <TrendDecider values={userPerformances} />
            {Math.round(user.TotalPerformance || 0)}%
          </div>

          <div className="flex w-full items-center justify-center">
            <SparkAreaChart
              data={sparkData}
              categories={[
                "TotalPerformance",
                "Benchmark",
                "Benchmark2",
                "Benchmark3",
              ]}
              noDataText="بدون داده"
              index={"Start_Date"}
              colors={["purple", "rose", "cyan"]}
              className={cn(
                "dash-a pointer-events-none h-10 w-36",
                isActive
                  ? "animate-path animate-[move_100s_linear_infinite]"
                  : "",
              )}
            />
          </div>

          <span className="w-full text-sm">{user.NameFamily}</span>
        </div>
      </Button>
    );
  },
  (prev, next) => {
    return (
      prev.user.NationalCode === next.user.NationalCode &&
      prev.user.TotalPerformance === next.user.TotalPerformance &&
      prev.user.NameFamily === next.user.NameFamily &&
      prev.activeKey.nc === next.activeKey.nc &&
      prev.activeKey.id === next.activeKey.id &&
      prev.getAllData === next.getAllData
    );
  },
);

PersonnelRow.displayName = "PersonnelRow";
