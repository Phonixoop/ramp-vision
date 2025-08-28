"use client";
import React, { useState } from "react";
import { SearchConfigurationMultiSelect } from "~/features/checkbox-list";
import PersianCalendarPicker from "~/features/persian-calendar-picker";
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

export default function TestPage() {
  const [selectedDate, setSelectedDate] = useState<moment.Moment | undefined>();
  const [selectedDates, setSelectedDates] = useState<moment.Moment[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<
    { start: moment.Moment; end: moment.Moment } | undefined
  >();
  const [selectedMonth, setSelectedMonth] = useState<
    { start: moment.Moment; end: moment.Moment } | undefined
  >();

  // Handle date selection with toggle functionality
  const handleDateSelect = (date: moment.Moment) => {
    // For backward compatibility - single date selection
    setSelectedDate(date);
  };

  // Handle multiple date selection
  const handleDatesSelect = (dates: moment.Moment[]) => {
    setSelectedDates(dates);
    setSelectedDate(dates[0] || undefined);
  };

  // Handle week selection with toggle functionality
  const handleWeekSelect = (start: moment.Moment, end: moment.Moment) => {
    setSelectedWeek({ start, end });
  };

  // Handle month selection with toggle functionality
  const handleMonthSelect = (start: moment.Moment, end: moment.Moment) => {
    setSelectedMonth({ start, end });
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold text-primary">
          Persian Calendar Picker Demo
        </h1>

        {/* Calendar Button Examples */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Calendar Button Examples
          </h2>

          <div className="flex flex-wrap gap-4">
            <CalendarButton
              onDateSelect={handleDateSelect}
              onDatesSelect={handleDatesSelect}
              selectedDate={selectedDate}
              selectedDates={selectedDates}
              buttonText="انتخاب تاریخ"
              buttonVariant="default"
            />

            <CalendarButton
              onWeekSelect={handleWeekSelect}
              selectedWeek={selectedWeek}
              buttonText="انتخاب هفته"
              buttonVariant="outline"
            />

            <CalendarButton
              onMonthSelect={handleMonthSelect}
              selectedMonth={selectedMonth}
              buttonText="انتخاب ماه"
              buttonVariant="ghost"
            />

            <CalendarButton
              onDateSelect={handleDateSelect}
              onDatesSelect={handleDatesSelect}
              selectedDate={selectedDate}
              selectedDates={selectedDates}
              showIcon={false}
              placeholder="تاریخ را انتخاب کنید"
            />
          </div>
        </div>

        <div className="grid max-w-4xl grid-cols-1  gap-8 lg:grid-cols-2">
          <div className="w-full">
            <h2 className="mb-4 text-lg font-semibold text-primary">
              Calendar Picker (Inline)
            </h2>
            <PersianCalendarPicker
              onDateSelect={handleDateSelect}
              onDatesSelect={handleDatesSelect}
              onWeekSelect={handleWeekSelect}
              onMonthSelect={handleMonthSelect}
              selectedDate={selectedDate}
              selectedDates={selectedDates}
              selectedWeek={selectedWeek}
              selectedMonth={selectedMonth}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">
              Selected Values
            </h2>

            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-primary">Selected Date:</h3>
              <p className="text-primary">
                {selectedDate
                  ? selectedDate.format("jYYYY/jMM/jDD")
                  : "None selected"}
              </p>
            </div>

            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-primary">
                Selected Dates (Multiple):
              </h3>
              <p className="text-primary">
                {selectedDates.length > 0
                  ? selectedDates.map((date, index) => (
                      <span key={index}>
                        {date.format("jYYYY/jMM/jDD")}
                        {index < selectedDates.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : "None selected"}
              </p>
              <p className="mt-1 text-sm text-primary/70">
                Total: {selectedDates.length} date(s) selected
              </p>
            </div>

            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-primary">Selected Week:</h3>
              <p className="text-primary">
                {selectedWeek
                  ? `${selectedWeek.start.format(
                      "jYYYY/jMM/jDD",
                    )} - ${selectedWeek.end.format("jYYYY/jMM/jDD")}`
                  : "None selected"}
              </p>
            </div>

            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-primary">Selected Month:</h3>
              <p className="text-primary">
                {selectedMonth
                  ? `${selectedMonth.start.format(
                      "jYYYY/jMM/jDD",
                    )} - ${selectedMonth.end.format("jYYYY/jMM/jDD")}`
                  : "None selected"}
              </p>
            </div>

            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-2 font-medium text-primary">Instructions:</h3>
              <ul className="space-y-1 text-sm text-primary">
                <li>• Click any date to select it</li>
                <li>• At least one selection is always maintained</li>
                <li>• Switch between tabs to change selection mode</li>
                <li>• Use navigation arrows to change months</li>
                <li>• Click "برو به امروز" to go to today</li>
                <li>• Try the calendar buttons above for modal experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-4 text-lg font-semibold text-primary">
          Other Components
        </h2>
        <SearchConfigurationMultiSelect />
        <div className="mt-4">
          <PopoverDemo />
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
