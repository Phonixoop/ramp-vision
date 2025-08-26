"use client";
import MyBarList from "~/features/bar-list";
import Gauge from "~/features/gauge";
import Button from "~/ui/buttons";
import H2 from "~/ui/heading/h2";
import { countColumnValues } from "~/utils/util";
import {
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import { getPerformanceText } from "~/utils/util";

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
  // Calculate role distribution
  const roleData = countColumnValues(flatRows, "Role", defualtRoles, {
    countAll: true,
    countNone: false,
  });

  // Calculate average performance
  const sumOfPerformances = flatRows.reduce((acc, row) => {
    return acc + row.TotalPerformance;
  }, 0);
  const totalPerformance =
    flatRows.length > 0 ? sumOfPerformances / flatRows.length : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <div className="flex w-full flex-col items-center justify-center gap-5 xl:flex-row">
          <div className="flex w-full flex-col items-stretch justify-center gap-5 rounded-2xl bg-secbuttn/50 py-4 sm:py-0 xl:flex-row">
            {/* Role Distribution Chart */}
            <div className="flex h-full flex-col justify-center gap-10 rounded-2xl py-4 sm:bg-secbuttn xl:w-1/2 xl:p-5">
              <H2 className="text-xl font-bold">تعداد پرسنل به تفکیک سمت</H2>
              <MyBarList
                data={(roleData ?? []).map((row) => ({
                  name: row.name,
                  value: row.count,
                }))}
              />
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
