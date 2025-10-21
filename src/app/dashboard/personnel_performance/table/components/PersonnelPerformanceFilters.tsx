"use client";
import moment from "jalali-moment";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { en } from "~/utils/util";
import { PeriodType } from "../types";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { useState, useEffect } from "react";
import { usePersonnelPerformance } from "../context";
import LoaderAnim from "~/components/main/loader-anim";
import { TableFilterSkeleton } from "./TableFilterSkeleton";
import { toast } from "sonner";

interface PersonnelPerformanceFiltersProps {
  getLastDate: any;
}

export function PersonnelPerformanceFilters({
  getLastDate,
}: PersonnelPerformanceFiltersProps) {
  const { filters, setDataFilters, reportPeriod, setReportPeriod } =
    usePersonnelPerformance();

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
    // Convert to YYYY-MM-DD format for the new API
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
    console.log(reportPeriod + " " + filters.filter.CityName.length);
    if (
      (reportPeriod === "monthly" && filters.filter.CityName.length <= 0) ||
      filters.filter.CityName.length > 1
    ) {
      toast(
        "لطفا یک شهر انتخاب کنید و سپس مجدد تاریخ گزارش را به ماهانه تغییر دهید",
      );
      return;
    }

    // Convert reportPeriod to PeriodType
    const newPeriodType = getPeriodType(reportPeriod);
    setReportPeriod(newPeriodType);

    // Update filters with the selected dates array and period type
    if (selectedDates.length > 0) {
      setDataFilters({
        periodType: newPeriodType,
        filter: {
          ...filters.filter,
          Start_Date: selectedDates, // Send the entire selectedDates array
        },
      });
    }
  };

  // Convert string dates back to moment for display
  const getDisplayDates = () => {
    return selectedDates.map((dateStr) => moment(dateStr, "YYYY-MM-DD"));
  };

  return (
    <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
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
        <>
          <div className="flex w-full flex-col items-center justify-center gap-3">
            <span className="font-bold text-primary">
              {getPeriodType(getCalendarPeriodType(reportPeriod))}
            </span>
            {/* <p className="text-primary">
              {getDisplayDates()
                .map((date) => date.format("YYYY/MM/DD"))
                .join(" - ")} 
            </p> */}
          </div>
        </>
      )}
    </div>
  );
}
