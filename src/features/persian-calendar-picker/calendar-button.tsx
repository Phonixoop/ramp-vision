"use client";

import React, { useState } from "react";
import moment from "jalali-moment";
import { Calendar, XIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import Modal from "~/ui/modals";
// import SimplifiedPersianCalendarPicker from "./simplified";
import { CalendarTab } from "./types";
import SelectedItemsPanel from "./selected-items-panel";
import { SimplifiedPersianCalendarPicker } from "~/features/persian-calendar-picker/simplified";
import { PersianCalendarPicker } from "~/features/persian-calendar-picker";
import LoaderAnim from "~/components/main/loader-anim";

interface CalendarButtonProps {
  onSelect?: (data: {
    reportPeriod: "daily" | "weekly" | "monthly";
    selectedDates: string[];
  }) => void;

  selectedDates?: string[]; // Array of date strings in YYYY-MM-DD format
  periodType?: "daily" | "weekly" | "monthly";

  className?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "sm" | "md" | "lg";
  showIcon?: boolean;
  placeholder?: string;
  allowMultiSelection?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function CalendarButton({
  onSelect,
  selectedDates = [],
  periodType = "daily",
  className,
  buttonText,
  buttonVariant = "default",
  buttonSize = "md",
  showIcon = true,
  placeholder = "انتخاب تاریخ",
  allowMultiSelection = true,
  disabled,
  isLoading,
}: CalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [pendingPeriodType, setPendingPeriodType] = useState<
    "daily" | "weekly" | "monthly"
  >(periodType);

  // Separate states for each tab's dates
  const [dailyDates, setDailyDates] = useState<string[]>(() => {
    if (periodType === "daily") {
      return selectedDates;
    }
    return [];
  });
  const [weeklyDates, setWeeklyDates] = useState<string[]>(() => {
    if (periodType === "weekly") {
      return selectedDates;
    }
    return [];
  });
  const [monthlyDates, setMonthlyDates] = useState<string[]>(() => {
    if (periodType === "monthly") {
      return selectedDates;
    }
    return [];
  });

  // Initialize pending state when modal opens or props change
  React.useEffect(() => {
    if (isOpen) {
      if (periodType === "daily") {
        setDailyDates(selectedDates ?? []);
      } else if (periodType === "weekly") {
        setWeeklyDates(selectedDates ?? []);
      } else if (periodType === "monthly") {
        setMonthlyDates(selectedDates ?? []);
      }
      setPendingPeriodType(periodType);
    }
  }, [isOpen, selectedDates, periodType]); // Added proper dependencies

  // Handle selection changes from the simplified calendar
  const handleSelectionChange = (selection: {
    dates: string[];
    periodType: "daily" | "weekly" | "monthly";
  }) => {
    // Update the appropriate tab's dates based on the current period type
    switch (selection.periodType) {
      case "daily":
        setDailyDates(selection.dates);
        break;
      case "weekly":
        setWeeklyDates(selection.dates);
        break;
      case "monthly":
        setMonthlyDates(selection.dates);
        break;
    }
  };

  // Get display text based on selection
  const getDisplayText = () => {
    if (selectedDates && selectedDates.length > 0) {
      if (periodType === "daily") {
        if (selectedDates.length === 1) {
          // Convert YYYY-MM-DD to Persian format for display
          return selectedDates[0];
        } else {
          return `${selectedDates.length} تاریخ انتخاب شده`;
        }
      } else if (periodType === "weekly") {
        return `${selectedDates.length / 2} هفته انتخاب شده`;
      } else if (periodType === "monthly") {
        return `${selectedDates.length} ماه انتخاب شده`;
      }
    }
    return placeholder;
  };

  const handleModalClose = () => {
    // Just close the modal without saving changes
    setIsOpen(false);
  };

  const handleSave = () => {
    // Apply pending changes when save button is clicked
    if (onSelect) {
      // Get the dates from the currently selected tab
      let selectedDatesForTab: string[] = [];

      switch (pendingPeriodType) {
        case "daily":
          selectedDatesForTab = dailyDates;
          break;
        case "weekly":
          selectedDatesForTab = weeklyDates;
          break;
        case "monthly":
          selectedDatesForTab = monthlyDates;
          break;
      }

      onSelect({
        reportPeriod: pendingPeriodType,
        selectedDates: selectedDatesForTab,
      });
    }
    setIsOpen(false);
  };

  // Convert string dates to moment objects for the selected items panel
  const convertStringToMoment = React.useCallback(
    (dateString: string): moment.Moment => {
      return moment(dateString, "jYYYY/jMM/jDD").locale("fa");
    },
    [],
  );

  const handleRemoveDate = (periodType: CalendarTab, index: number) => {
    switch (periodType) {
      case "daily":
        setDailyDates(dailyDates.filter((_, i) => i !== index));
        break;
      case "weekly":
        // For weekly, remove both start and end dates (index*2 and index*2+1)
        setWeeklyDates(
          weeklyDates.filter((_, i) => i !== index * 2 && i !== index * 2 + 1),
        );
        break;
      case "monthly":
        setMonthlyDates(monthlyDates.filter((_, i) => i !== index));
        break;
    }
  };

  // Check if the selected tab has any dates
  const hasSelectedDates = () => {
    // Check dates for the currently active tab
    switch (pendingPeriodType) {
      case "daily":
        return dailyDates.length > 0;
      case "weekly":
        return weeklyDates.length > 0;
      case "monthly":
        return monthlyDates.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="relative">
      <Button
        loadType="circle"
        loaderWrapper="replace"
        isLoading={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-secbuttn hover:bg-primary/10",
          className,
        )}
      >
        {showIcon && <Calendar className="h-4 w-4" />}
        {(!isLoading && buttonText) || getDisplayText()}
      </Button>

      {/* Modal Overlay */}

      <Modal
        center
        isOpen={isOpen}
        onClose={handleModalClose}
        title="انتخاب تاریخ"
        className=" border-none bg-secbuttn"
        size="sm"
      >
        <div className="flex gap-4">
          {/* Calendar Section */}
          <div className="w-full flex-1">
            <SimplifiedPersianCalendarPicker
              onActiveTabChange={(tab) => {
                setPendingPeriodType(tab);
              }}
              onSelectionChange={(selection) => {
                console.log("CalendarButton received selection:", selection);
                // Update the appropriate state based on the selection
                switch (selection.periodType) {
                  case "daily":
                    console.log("Setting daily dates:", selection.dates);
                    setDailyDates(selection.dates);
                    break;
                  case "weekly":
                    console.log("Setting weekly dates:", selection.dates);
                    setWeeklyDates(selection.dates);
                    break;
                  case "monthly":
                    console.log("Setting monthly dates:", selection.dates);
                    setMonthlyDates(selection.dates);
                    break;
                }
              }}
              dailyDates={dailyDates}
              weeklyDates={weeklyDates}
              monthlyDates={monthlyDates}
              periodType={pendingPeriodType}
              allowMultiSelection={allowMultiSelection}
              className="bg-transparent shadow-none"
            />
          </div>

          <div className="relative max-h-[430px] w-3/12 overflow-y-auto">
            {/* Selected Items Panel */}
            <SelectedItemsPanel
              periodType={pendingPeriodType}
              pendingDates={dailyDates}
              pendingWeeks={weeklyDates}
              pendingMonths={monthlyDates}
              onRemoveDate={handleRemoveDate}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center p-4">
          <Button
            onClick={handleSave}
            disabled={!hasSelectedDates() || disabled}
            className={cn(
              "w-full",
              hasSelectedDates()
                ? "bg-accent text-primary hover:bg-accent/90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            ثبت
          </Button>
        </div>
      </Modal>
    </div>
  );
}
