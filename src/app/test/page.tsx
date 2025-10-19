"use client";
import React, { useState } from "react";
import { SearchConfigurationMultiSelect } from "~/features/checkbox-list";
import SimplifiedPersianCalendarPicker from "~/features/persian-calendar-picker/simplified";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import moment from "jalali-moment";

import { Button } from "~/components/shadcn/button";
import { Input } from "~/components/shadcn/input";
import { Label } from "~/components/shadcn/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/shadcn/popover";
import { PersianCalendarExample } from "~/features/persian-calendar-picker/example";
import Navbar from "~/components/Navbar";
import { ShiftingDropDown } from "~/components/main/nav-tst";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";

export default function TestPage() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [allowMultiSelection, setAllowMultiSelection] = useState(true);

  // Handle selection changes from the simplified calendar
  const handleSelectionChange = (selection: {
    dates: string[];
    periodType: "daily" | "weekly" | "monthly";
  }) => {
    setSelectedDates(selection.dates);
    setPeriodType(selection.periodType);
  };

  // Handle calendar button selection
  const handleCalendarButtonSelect = (data: {
    reportPeriod: "daily" | "weekly" | "monthly";
    selectedDates: string[];
  }) => {
    setSelectedDates(data.selectedDates);
    setPeriodType(data.reportPeriod);
  };

  // Convert string dates to moment objects for display
  const convertStringToMoment = (dateString: string): moment.Moment => {
    return moment(dateString, "YYYY-MM-DD").locale("fa");
  };

  // Get display text for selected dates
  const getDisplayText = () => {
    if (selectedDates.length === 0) return "None selected";

    if (periodType === "daily") {
      if (selectedDates.length === 1) {
        const date = convertStringToMoment(selectedDates[0]);
        return date.format("jYYYY/jMM/jDD");
      } else {
        return `${selectedDates.length} date(s) selected`;
      }
    } else if (periodType === "weekly") {
      return `${selectedDates.length} week(s) selected`;
    } else if (periodType === "monthly") {
      return `${selectedDates.length} month(s) selected`;
    }

    return "None selected";
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex h-[80px] w-full items-center justify-center gap-1 rounded-lg bg-accent bg-secondary/50 group-hover:bg-primary/10">
        <div className="flex h-full w-4/12 flex-col items-center justify-center gap-2 rounded-xl bg-secbuttn px-2 ">
          {/* 10 items with */}
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="h-[100x] w-[10px]  rounded-xl bg-primary/10"
            ></span>
          ))}
        </div>
        <div className="flex h-full w-4/12 flex-col items-center justify-center gap-2 rounded-xl bg-secbuttn px-2 group-hover:bg-primary/10 ">
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
          <span className="h-[10x] w-full  rounded-xl bg-primary/10"></span>
        </div>
        <div className=" grid h-full w-8/12 grid-cols-2 grid-rows-2 items-center justify-center gap-1 rounded-xl bg-secbuttn p-2 group-hover:bg-primary/10  ">
          <span className="h-full w-full  rounded-xl bg-primary/5" />
          <span className="h-full w-full  rounded-xl bg-primary/5" />
          <div className="h-full w-full  rounded-xl bg-primary/5">
            <BarChartSkeletonLoading />
          </div>
          <span className="h-full w-full  rounded-xl bg-primary/5" />
        </div>
      </div>
      <div>
        <h1 className="mb-4 text-2xl font-bold text-primary">
          Persian Calendar Picker Demo
        </h1>
        <ShiftingDropDown />
        <Navbar />
        {/* Calendar Button Examples */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Calendar Button Examples
          </h2>

          <div className="flex flex-wrap gap-4">
            <CalendarButton
              onSelect={handleCalendarButtonSelect}
              selectedDates={selectedDates}
              periodType={periodType}
              allowMultiSelection={allowMultiSelection}
              buttonText="انتخاب تاریخ"
            />
          </div>
        </div>

        {/* Simplified Calendar Picker */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Simplified Calendar Picker
          </h2>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowMultiSelection}
                  onChange={(e) => setAllowMultiSelection(e.target.checked)}
                  className="rounded border-primary bg-secondary text-accent focus:ring-accent"
                />
                Allow Multiple Selection
              </label>
            </div>

            <PersianCalendarExample />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Selected Values
          </h2>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="mb-2 font-medium text-primary">Period Type:</h3>
            <p className="text-primary">{periodType}</p>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="mb-2 font-medium text-primary">Selected Dates:</h3>
            <p className="text-primary">
              {selectedDates.length > 0
                ? selectedDates.map((dateStr, index) => {
                    const date = convertStringToMoment(dateStr);
                    return (
                      <span key={index}>
                        {date.format("jYYYY/jMM/jDD")}
                        {index < selectedDates.length - 1 ? ", " : ""}
                      </span>
                    );
                  })
                : "None selected"}
            </p>
            <p className="mt-1 text-sm text-primary/70">
              Total: {selectedDates.length} item(s) selected
            </p>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="mb-2 font-medium text-primary">Display Text:</h3>
            <p className="text-primary">{getDisplayText()}</p>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="mb-2 font-medium text-primary">Raw Data:</h3>
            <pre className="text-xs text-primary">
              {JSON.stringify(
                {
                  periodType,
                  selectedDates,
                  count: selectedDates.length,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
