"use client";

import React from "react";
import moment from "jalali-moment";
import { PersianCalendarPicker } from "./index";

// Simplified abstraction component
interface SimplifiedPersianCalendarPickerProps {
  onSelectionChange?: (selection: {
    dates: string[];
    periodType: "daily" | "weekly" | "monthly";
  }) => void;

  onActiveTabChange?: (
    tab: "daily" | "weekly" | "monthly",
    dates: {
      daily: string[];
      weekly: string[];
      monthly: string[];
    },
  ) => void;
  selectedDates?: string[]; // Array of date strings in YYYY/MM/DD format
  periodType?: "daily" | "weekly" | "monthly";
  allowMultiSelection?: boolean;
  className?: string;
  dailyDates?: string[];
  weeklyDates?: string[];
  monthlyDates?: string[];
  setDailyDates?: (dates: string[]) => void;
  setWeeklyDates?: (dates: string[]) => void;
  setMonthlyDates?: (dates: string[]) => void;
}

export function SimplifiedPersianCalendarPicker({
  onSelectionChange,
  dailyDates,
  weeklyDates,
  monthlyDates,
  setDailyDates,
  setWeeklyDates,
  setMonthlyDates,
  selectedDates = [],
  periodType = "daily",
  allowMultiSelection = true,
  onActiveTabChange,
  className,
}: SimplifiedPersianCalendarPickerProps) {
  // Internal state for active tab - initialize with the prop value to prevent flicker
  const [activeTab, setActiveTab] = React.useState<
    "daily" | "weekly" | "monthly"
  >(periodType);

  // Separate states for each tab

  // Update active tab when periodType prop changes
  React.useEffect(() => {
    setActiveTab(periodType);
  }, [periodType]);

  // Remove the problematic useEffect that was causing infinite loop
  // The parent component should manage the state initialization

  // Convert string dates to moment objects for internal use
  const convertStringToMoment = (dateString: string): moment.Moment => {
    return moment(dateString, "jYYYY/jMM/jDD").locale("fa");
  };

  const convertMomentToString = (date: moment.Moment): string => {
    return date.format("jYYYY/jMM/jDD");
  };

  // Convert selected dates based on period type
  const getInternalProps = () => {
    switch (activeTab) {
      case "daily":
        return {
          selectedDates: dailyDates?.map(convertStringToMoment) || [],
          allowMultiDaySelection: allowMultiSelection,
        };
      case "weekly":
        return {
          selectedWeeks:
            weeklyDates?.map((dateStr) => {
              const date = convertStringToMoment(dateStr);
              return {
                start: date.clone().startOf("week"),
                end: date.clone().endOf("week"),
              };
            }) || [],
          allowMultiWeekSelection: false,
        };
      case "monthly":
        return {
          selectedMonths:
            monthlyDates?.map((dateStr) => {
              // For monthly selection, the dateStr should represent the first day of the month
              const date = convertStringToMoment(dateStr);
              return {
                start: date.clone().startOf("jMonth"),
                end: date.clone().endOf("jMonth"),
              };
            }) || [],
          allowMultiMonthSelection: allowMultiSelection,
        };
      default:
        return {
          selectedDates: dailyDates?.map(convertStringToMoment) || [],
          allowMultiDaySelection: allowMultiSelection,
        };
    }
  };

  // Type definitions for selection objects
  type DailySelection = {
    dates: moment.Moment[];
  };

  type WeeklySelection = {
    weeks: { start: moment.Moment; end: moment.Moment }[];
  };

  type MonthlySelection = {
    months: { start: moment.Moment; end: moment.Moment }[];
  };

  type Selection = DailySelection | WeeklySelection | MonthlySelection;

  // Handle selection changes and convert back to string format
  const handleSelectionChange = (selection: Selection) => {
    if (!onSelectionChange) return;

    let dates: string[] = [];

    console.log("handleSelectionChange called with:", selection);
    console.log("activeTab:", activeTab);

    switch (activeTab) {
      case "daily":
        if ("dates" in selection && selection.dates) {
          dates = selection.dates.map(convertMomentToString);
        }
        break;
      case "weekly":
        console.log("hgere");
        if ("weeks" in selection && selection.weeks) {
          // dates = selection.weeks.map((week) =>
          //   convertMomentToString(week.start),
          // );

          if (selection.weeks.length > 0) {
            dates = [
              convertMomentToString(selection.weeks[0].start),
              convertMomentToString(selection.weeks[0].end),
            ];
          }
        }
        break;
      case "monthly":
        if ("months" in selection && selection.months) {
          // For monthly selection, store the first day of each selected month
          dates = selection.months.map((month) =>
            convertMomentToString(month.start),
          );

          console.log("Monthly selection - dates:", dates);
          console.log("Monthly selection - internalDates:");
        }
        break;
    }

    console.log("Calling onSelectionChange with:", {
      dates: dates,
      periodType: activeTab,
    });

    onSelectionChange({
      dates: dates,
      periodType: activeTab,
    });
  };

  // Create appropriate callbacks based on period type
  const getCallbacks = () => {
    switch (activeTab) {
      case "daily":
        return {
          onDatesSelect: (dates: moment.Moment[]) => {
            handleSelectionChange({ dates });
          },
        };
      case "weekly":
        return {
          onWeeksSelect: (
            weeks: { start: moment.Moment; end: moment.Moment }[],
          ) => {
            handleSelectionChange({ weeks });
          },
        };
      case "monthly":
        return {
          onMonthsSelect: (
            months: { start: moment.Moment; end: moment.Moment }[],
          ) => {
            handleSelectionChange({ months });
          },
        };
      default:
        return {
          onDatesSelect: (dates: moment.Moment[]) => {
            handleSelectionChange({ dates });
          },
        };
    }
  };

  const internalProps = getInternalProps();
  const callbacks = getCallbacks();

  return (
    <PersianCalendarPicker
      {...internalProps}
      {...callbacks}
      activeTab={activeTab}
      onActiveTabChange={(tab) => {
        setActiveTab(tab);
        onActiveTabChange?.(tab, {
          daily: dailyDates,
          weekly: weeklyDates,
          monthly: monthlyDates,
        });
      }}
      className={className}
    />
  );
}

export default SimplifiedPersianCalendarPicker;
