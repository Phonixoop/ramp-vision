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

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-primary">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
