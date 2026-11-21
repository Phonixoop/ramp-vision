"use client";
import moment from "jalali-moment";
import { BookmarkIcon, RotateCcwIcon, SaveIcon } from "lucide-react";
import { PeriodType } from "../types";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { usePersonnelPerformance } from "../context";
import { TableFilterSkeleton } from "./TableFilterSkeleton";
import { toast } from "sonner";
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";
import { countCollapsedCities } from "~/utils/personnel-performance";

const ACTION_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/20 bg-secondary px-3 text-xs text-primary transition-colors hover:bg-primary/5";

interface PersonnelPerformanceFiltersProps {
  getLastDate: any;
}

export function PersonnelPerformanceFilters({
  getLastDate,
}: PersonnelPerformanceFiltersProps) {
  const {
    filters,
    setDataFilters,
    reportPeriod,
    setReportPeriod,
    hasSavedDefaults,
    saveCurrentAsDefaults,
    resetToSystemDefaults,
    applySavedOrSystemDefaults,
  } = usePersonnelPerformance();
  const { useWorkDays, setUseWorkDays } = useWorkDaysToggle();

  // Safety check for filters and Start_Date
  if (
    !filters?.filter?.Start_Date ||
    !Array.isArray(filters.filter.Start_Date)
  ) {
    return (
      <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
        <span className="font-bold text-primary">بازه گزارش</span>
        <div className="text-sm text-primary">در حال بارگذاری...</div>
      </div>
    );
  }

  // Convert moment dates to string format for the new API
  const selectedDates = filters.filter.Start_Date.map((dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "";

    let date = moment(dateStr, "YYYY/MM/DD");
    if (!date.isValid()) {
      date = moment(dateStr, "jYYYY/jMM/jDD");
    }
    // Convert to YYYY/MM/DD format for the new API
    return date.isValid() ? date.format("YYYY/MM/DD") : "";
  }).filter((date) => date !== "");

  // Convert period type to calendar period type
  const getCalendarPeriodType = (
    period: PeriodType,
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
    const selectedCityCount = countCollapsedCities(filters.filter.CityName);
    if (
      (reportPeriod === "monthly" && selectedCityCount <= 0) ||
      selectedCityCount > 1
    ) {
      toast(
        "لطفا یک شهر انتخاب کنید و سپس مجدد تاریخ گزارش را به ماهانه تغییر دهید",
      );
      return;
    }

    const newPeriodType = getPeriodType(reportPeriod);
    setReportPeriod(newPeriodType);

    if (selectedDates.length > 0) {
      setDataFilters({
        periodType: newPeriodType,
        filter: {
          ...filters.filter,
          Start_Date: selectedDates,
        },
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className={ACTION_BTN}
          onClick={() => saveCurrentAsDefaults(useWorkDays)}
        >
          <BookmarkIcon className="size-3.5" />
          ذخیره پیش‌فرض
        </button>
        <button
          type="button"
          className={ACTION_BTN}
          onClick={() => applySavedOrSystemDefaults(setUseWorkDays)}
        >
          <SaveIcon className="size-3.5" />
          {hasSavedDefaults ? "اعمال پیش‌فرض" : "اعمال پیش‌فرض سیستم"}
        </button>
        <button
          type="button"
          className={ACTION_BTN}
          onClick={() => resetToSystemDefaults(setUseWorkDays)}
        >
          <RotateCcwIcon className="size-3.5" />
          بازنشانی
        </button>
      </div>

      <span className="font-bold text-primary">بازه گزارش</span>

      {!getLastDate || getLastDate.isLoading ? (
        <TableFilterSkeleton />
      ) : (
        <CalendarButton
          disabled={!getLastDate || getLastDate.isLoading}
          onSelect={(data) => handleCalendarSubmit(data)}
          selectedDates={selectedDates}
          periodType={getCalendarPeriodType(reportPeriod)}
          placeholder="انتخاب بازه زمانی"
          className="w-full"
          isLoading={!getLastDate || getLastDate.isLoading}
        />
      )}

      {!getLastDate || getLastDate.isLoading ? (
        <div className="mt-5 h-4 w-12 animate-pulse rounded-md bg-secbuttn"></div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-3">
          <span className="font-bold text-primary">
            {getPeriodType(getCalendarPeriodType(reportPeriod))}
          </span>
        </div>
      )}
    </div>
  );
}
