"use client";

import React, { useState } from "react";
import moment from "jalali-moment";
import { Calendar, XIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import PersianCalendarPicker from "./index";

interface CalendarButtonProps {
  onDateSelect?: (date: moment.Moment) => void;
  onDatesSelect?: (dates: moment.Moment[]) => void; // New callback for multiple dates
  onWeekSelect?: (startDate: moment.Moment, endDate: moment.Moment) => void;
  onMonthSelect?: (startDate: moment.Moment, endDate: moment.Moment) => void;
  selectedDate?: moment.Moment;
  selectedDates?: moment.Moment[]; // New prop for multiple selection
  selectedWeek?: { start: moment.Moment; end: moment.Moment };
  selectedMonth?: { start: moment.Moment; end: moment.Moment };
  className?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "sm" | "md" | "lg";
  showIcon?: boolean;
  placeholder?: string;
}

export default function CalendarButton({
  onDateSelect,
  onDatesSelect,
  onWeekSelect,
  onMonthSelect,
  selectedDate,
  selectedDates,
  selectedWeek,
  selectedMonth,
  className,
  buttonText,
  buttonVariant = "default",
  buttonSize = "md",
  showIcon = true,
  placeholder = "انتخاب تاریخ",
}: CalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get display text based on selection
  const getDisplayText = () => {
    if (selectedDates && selectedDates.length > 0) {
      if (selectedDates.length === 1) {
        return selectedDates[0].format("jYYYY/jMM/jDD");
      } else {
        return `${selectedDates.length} تاریخ انتخاب شده`;
      }
    }
    if (selectedDate) {
      return selectedDate.format("jYYYY/jMM/jDD");
    }
    if (selectedWeek) {
      return `${selectedWeek.start.format(
        "jYYYY/jMM/jDD",
      )} - ${selectedWeek.end.format("jYYYY/jMM/jDD")}`;
    }
    if (selectedMonth) {
      return `${selectedMonth.start.format(
        "jYYYY/jMM",
      )} - ${selectedMonth.end.format("jYYYY/jMM")}`;
    }
    return placeholder;
  };

  const handleDateSelect = (date: moment.Moment) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
    setIsOpen(false);
  };

  const handleDatesSelect = (dates: moment.Moment[]) => {
    if (onDatesSelect) {
      onDatesSelect(dates);
    }
    setIsOpen(false);
  };

  const handleWeekSelect = (start: moment.Moment, end: moment.Moment) => {
    if (onWeekSelect) {
      onWeekSelect(start, end);
    }
    setIsOpen(false);
  };

  const handleMonthSelect = (start: moment.Moment, end: moment.Moment) => {
    if (onMonthSelect) {
      onMonthSelect(start, end);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("flex items-center gap-2", className)}
      >
        {showIcon && <Calendar className="h-4 w-4" />}
        {buttonText || getDisplayText()}
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-secondary/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 mx-4 w-full max-w-[400px]">
            <div className="rounded-2xl bg-secbuttn p-6 ">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">
                  انتخاب تاریخ
                </h3>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full text-primary hover:bg-accent hover:text-secondary"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>

              <PersianCalendarPicker
                onDateSelect={handleDateSelect}
                onDatesSelect={handleDatesSelect}
                onWeekSelect={handleWeekSelect}
                onMonthSelect={handleMonthSelect}
                selectedDate={selectedDate}
                selectedDates={selectedDates}
                selectedWeek={selectedWeek}
                selectedMonth={selectedMonth}
                className="bg-transparent shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
