"use client";
import { useMemo, useState } from "react";
import Gauge from "~/features/gauge";
import Button from "~/ui/buttons";
import H2 from "~/ui/heading/h2";
import { countColumnValues, getPerformanceText } from "~/utils/util";
import { filterRowsForCityPerformanceAggregate } from "~/utils/personnel-performance";
import { defualtRoles } from "~/constants/personnel-performance";

const INITIAL_VISIBLE_ROLES = 5;

interface PersonnelPerformanceSummaryProps {
  flatRows: any[];
  toggleDistinctData: "Distincted" | "Pure";
  onToggleDataView: () => void;
}

export function PersonnelPerformanceSummary({
  flatRows,
  toggleDistinctData,
  onToggleDataView,
}: PersonnelPerformanceSummaryProps) {
  const [showAllRoles, setShowAllRoles] = useState(false);

  const roleData = useMemo(
    () =>
      countColumnValues(flatRows, "Role", defualtRoles, {
        countAll: true,
        countNone: false,
      }).sort((a, b) => b.count - a.count),
    [flatRows],
  );

  const totalPersonnel = useMemo(
    () => roleData.reduce((sum, row) => sum + row.count, 0),
    [roleData],
  );

  const visibleRoles = showAllRoles
    ? roleData
    : roleData.slice(0, INITIAL_VISIBLE_ROLES);
  const hiddenRoleCount = Math.max(0, roleData.length - INITIAL_VISIBLE_ROLES);

  // Calculate average performance (exclude personnel whose real city differs)
  const rowsForCityPerformance = filterRowsForCityPerformanceAggregate(flatRows);
  const sumOfPerformances = rowsForCityPerformance.reduce((acc, row) => {
    return acc + row.TotalPerformance;
  }, 0);
  const totalPerformance =
    rowsForCityPerformance.length > 0
      ? sumOfPerformances / rowsForCityPerformance.length
      : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <div className="flex w-full flex-col items-center justify-center gap-5 xl:flex-row">
          <div className="flex w-full flex-col items-stretch justify-center gap-5 rounded-2xl bg-secbuttn/50 py-4 sm:py-0 xl:flex-row">
            {/* Role Distribution */}
            <div className="flex h-full min-w-0 flex-col justify-center gap-3 rounded-2xl py-4 sm:bg-secbuttn xl:w-1/2 xl:p-5">
              <div className="flex w-full items-baseline justify-between gap-3 px-2 xl:px-0">
                <H2 className="text-base font-bold sm:text-lg">تفکیک سمت</H2>
                <span className="shrink-0 text-sm font-medium text-accent">
                  {totalPersonnel} نفر
                </span>
              </div>

              <ul
                className={`flex w-full min-w-0 flex-col gap-0.5 px-1 xl:px-0 ${
                  showAllRoles && roleData.length > 8
                    ? "max-h-64 overflow-y-auto"
                    : ""
                }`}
              >
                {visibleRoles.map((row) => (
                  <li
                    key={row.name}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-primary"
                  >
                    <span className="min-w-0 truncate text-sm" title={row.name}>
                      {row.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-sm font-bold">
                      {row.count}
                    </span>
                  </li>
                ))}

                {roleData.length > 0 && (
                  <li className="mt-1 flex items-center justify-between gap-3 border-t border-primary/10 px-2 pt-2 text-accent">
                    <span className="text-sm font-bold">مجموع</span>
                    <span className="tabular-nums text-sm font-bold">
                      {totalPersonnel}
                    </span>
                  </li>
                )}
              </ul>

              {hiddenRoleCount > 0 && (
                <Button
                  className="mx-1 self-start bg-transparent px-2 text-sm text-accent hover:bg-primary/5 xl:mx-0"
                  onClick={() => setShowAllRoles((prev) => !prev)}
                >
                  {showAllRoles
                    ? "نمایش کمتر"
                    : `+${hiddenRoleCount} سمت دیگر`}
                </Button>
              )}
            </div>

            {/* Performance Gauge */}
            <div className="flex w-full flex-col items-center justify-between gap-5 rounded-2xl xl:w-1/2">
              <div className="flex w-full flex-col items-center justify-between gap-5 rounded-2xl py-5 xl:w-auto xl:p-5">
                <H2>عملکرد</H2>
                <Gauge value={totalPerformance} />
                <p className="text-accent">
                  {getPerformanceText(totalPerformance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data View Toggle */}
      <div className="w-full">
        <Button
          className="min-w-[150px] bg-secbuttn text-primary"
          onClick={onToggleDataView}
        >
          {toggleDistinctData === "Distincted" ? "Distincted" : "Pure"}
        </Button>
      </div>
    </div>
  );
}
