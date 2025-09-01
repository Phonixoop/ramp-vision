"use client";

import moment from "jalali-moment";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { useDepo } from "../context";
import { PeriodType } from "../types";
import { DepoFiltersSkeleton } from "~/components/skeletons/FilterSkeleton";

interface DepoFiltersProps {
  initialFilters: any;
  depo: any;
  columns: any[];
}

export function DepoFilters({
  initialFilters,
  depo,
  columns,
}: DepoFiltersProps) {
  const { filters, setDataFilters, reportPeriod, setReportPeriod } = useDepo();

  // Safety check for filters and Start_Date
  if (
    !filters?.filter?.Start_Date ||
    !Array.isArray(filters.filter.Start_Date)
  ) {
    return <DepoFiltersSkeleton />;
  }

  // Convert period type to calendar period type
  const getCalendarPeriodType = (
    period: string,
  ): "daily" | "weekly" | "monthly" => {
    switch (period) {
      case "روزانه":
        return "daily";
      case "هفتگی":
        return "weekly";
      case "ماهانه":
        return "monthly";
      default:
        return "daily";
    }
  };

  // Convert calendar period type to PeriodType
  const getPeriodType = (
    periodType: "daily" | "weekly" | "monthly",
  ): PeriodType => {
    switch (periodType) {
      case "daily":
        return "روزانه";
      case "weekly":
        return "هفتگی";
      case "monthly":
        return "ماهانه";
      default:
        return "روزانه";
    }
  };

  // Handle calendar submit
  const handleCalendarSubmit = ({
    reportPeriod,
    selectedDates,
  }: {
    reportPeriod: "daily" | "weekly" | "monthly";
    selectedDates: string[];
  }) => {
    // Convert reportPeriod to PeriodType
    const newPeriodType = getPeriodType(reportPeriod);
    setReportPeriod(newPeriodType);

    // Update filters with the selected dates array and period type
    if (selectedDates.length > 0) {
      setDataFilters({
        ...filters,
        periodType: newPeriodType,
        filter: {
          ...filters.filter,
          Start_Date: selectedDates, // Send the entire selectedDates array
        },
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl p-2">
      <span className="font-bold text-primary">فیلتر ها</span>
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
        <span className="font-bold text-primary">بازه گزارش</span>

        <CalendarButton
          onSelect={handleCalendarSubmit}
          selectedDates={filters.filter.Start_Date}
          periodType={getCalendarPeriodType(reportPeriod)}
          placeholder="انتخاب بازه زمانی"
          className="w-full"
        />

        <div className="flex w-full flex-col items-center justify-center gap-3">
          <span className="font-bold text-primary">
            {getPeriodType(getCalendarPeriodType(reportPeriod))}
          </span>
        </div>
      </div>
    </div>
  );
}
