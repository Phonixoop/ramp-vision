"use client";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { en } from "~/utils/util";
import { FilterType, PeriodType } from "~/context/personnel-filter.context";

interface PersonnelPerformanceFiltersProps {
  filters: FilterType;
  reportPeriod: PeriodType;
  setReportPeriod: (period: PeriodType) => void;
  setDataFilters: (filters: FilterType) => void;
  getLastDate: any;
}

export function PersonnelPerformanceFilters({
  filters,
  reportPeriod,
  setReportPeriod,
  setDataFilters,
  getLastDate,
}: PersonnelPerformanceFiltersProps) {
  const handleDateChange = (date: any) => {
    if (!date) return;

    if (Array.isArray(date) && date.length <= 0) return;

    let dates = [""];

    if (Array.isArray(date)) {
      dates = date
        .filter((a: any) => a.format() !== "")
        .map((a: any) => en(a.format("YYYY/MM/DD")));
    } else {
      if (date.format() !== "") {
        dates = [en(date.format("YYYY/MM/DD"))];
      }
    }

    if (dates.length <= 0) return;

    setDataFilters({
      ...filters,
      periodType: reportPeriod,
      filter: {
        ...filters.filter,
        Start_Date: dates,
      },
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">بازه گزارش</span>

      {getLastDate.isLoading ? (
        <div className="text-primary">
          <ThreeDotsWave />
        </div>
      ) : (
        <DatePickerPeriodic
          filter={filters}
          reportPeriod={reportPeriod}
          onChange={handleDateChange}
          setReportPeriod={setReportPeriod}
        />
      )}
    </div>
  );
}
