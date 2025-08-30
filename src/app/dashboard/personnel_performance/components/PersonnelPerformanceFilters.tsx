"use client";
import moment from "jalali-moment";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { en } from "~/utils/util";
import { PeriodType } from "../types";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { useState, useEffect } from "react";
import { usePersonnelPerformance } from "../context";
import LoaderAnim from "~/components/main/loader-anim";

interface PersonnelPerformanceFiltersProps {
  getLastDate: any;
}

export function PersonnelPerformanceFilters({
  getLastDate,
}: PersonnelPerformanceFiltersProps) {
  const { filters, setDataFilters, reportPeriod, setReportPeriod } =
    usePersonnelPerformance();

  // Convert moment dates to string format for the new API
  const selectedDates = filters.filter.Start_Date.map((dateStr) => {
    let date = moment(dateStr, "YYYY/MM/DD");
    if (!date.isValid()) {
      date = moment(dateStr, "jYYYY/jMM/jDD");
    }
    // Convert to YYYY-MM-DD format for the new API
    return date.format("YYYY/MM/DD");
  });

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

  // Convert string dates back to moment for display
  const getDisplayDates = () => {
    return selectedDates.map((dateStr) => moment(dateStr, "YYYY-MM-DD"));
  };

  return (
    <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">بازه گزارش</span>

      <CalendarButton
        disabled={getLastDate.isLoading}
        onSelect={handleCalendarSubmit}
        selectedDates={selectedDates}
        periodType={getCalendarPeriodType(reportPeriod)}
        placeholder="انتخاب بازه زمانی"
        className="w-full"
        isLoading={getLastDate.isLoading}
      />
      {getLastDate.isLoading ? (
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
