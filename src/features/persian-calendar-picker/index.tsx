"use client";

import React, { useState } from "react";
import moment from "jalali-moment";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/shadcn/tabs";
import Button from "~/ui/buttons";

// Persian month names
const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// Persian weekday names
const PERSIAN_WEEKDAYS = ["شن", "یک", "دو", "سه", "چهار", "پنج", "جم"];

interface PersianCalendarPickerProps {
  onDateSelect?: (date: moment.Moment) => void;
  onDatesSelect?: (dates: moment.Moment[]) => void; // New callback for multiple dates
  onWeekSelect?: (startDate: moment.Moment, endDate: moment.Moment) => void;
  onMonthSelect?: (startDate: moment.Moment, endDate: moment.Moment) => void;
  selectedDate?: moment.Moment; // For backward compatibility
  selectedDates?: moment.Moment[]; // New prop for multiple selection
  selectedWeek?: { start: moment.Moment; end: moment.Moment };
  selectedMonth?: { start: moment.Moment; end: moment.Moment };
  className?: string;
}

// Reusable Calendar Header Component
const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
}: {
  currentDate: moment.Moment;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}) => (
  <div className="flex items-center justify-between">
    <Button
      onClick={onPreviousMonth}
      className="text-primary hover:bg-accent hover:text-secondary"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>

    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="text-lg font-semibold text-primary">
        {PERSIAN_MONTHS[currentDate.jMonth()]} {currentDate.jYear()}
      </div>
      <Button
        onClick={onGoToToday}
        className="text-xs text-accent hover:bg-accent hover:text-secondary"
      >
        برو به امروز
      </Button>
    </div>

    <Button
      onClick={onNextMonth}
      className="text-primary hover:bg-accent hover:text-secondary"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

// Reusable Calendar Grid Component
const CalendarGrid = ({
  calendarDays,
  currentDate,
  onDateClick,
  isSelected,
  isToday,
  isCurrentMonth,
  isWeekend,
  activeTab,
}: {
  calendarDays: moment.Moment[];
  currentDate: moment.Moment;
  onDateClick: (date: moment.Moment) => void;
  isSelected: (date: moment.Moment) => boolean;
  isToday: (date: moment.Moment) => boolean;
  isCurrentMonth: (date: moment.Moment) => boolean;
  isWeekend: (date: moment.Moment) => boolean;
  activeTab: string;
}) => {
  // Ensure we always have 6 weeks (42 days) to prevent layout shifting
  const totalDays = 42;
  const paddedDays = [...calendarDays];

  // If we have less than 42 days, add empty days to fill the grid
  while (paddedDays.length < totalDays) {
    const lastDay = paddedDays[paddedDays.length - 1];
    paddedDays.push(lastDay.clone().add(1, "day"));
  }

  // Helper function to check if a date should be highlighted on hover
  const shouldHighlightOnHover = (
    hoveredDate: moment.Moment,
    currentDate: moment.Moment,
  ) => {
    if (activeTab === "weekly") {
      const hoveredWeekStart = hoveredDate.clone().startOf("week");
      const hoveredWeekEnd = hoveredDate.clone().endOf("week");
      return (
        currentDate.isSameOrAfter(hoveredWeekStart, "day") &&
        currentDate.isSameOrBefore(hoveredWeekEnd, "day")
      );
    }
    if (activeTab === "monthly") {
      const hoveredMonthStart = hoveredDate.clone().startOf("jMonth");
      const hoveredMonthEnd = hoveredDate.clone().endOf("jMonth");
      return (
        currentDate.isSameOrAfter(hoveredMonthStart, "day") &&
        currentDate.isSameOrBefore(hoveredMonthEnd, "day")
      );
    }
    return false;
  };

  return (
    <>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {PERSIAN_WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-xs font-medium text-primary">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - always 6 rows */}
      <div
        className="liquid-filter grid grid-cols-7 gap-1"
        style={{ gridTemplateRows: "repeat(6, 1fr)" }}
      >
        {paddedDays.map((date, index) => (
          <Button
            key={index}
            onClick={() => onDateClick(date)}
            className={cn(
              "size-full rounded-full text-sm font-medium transition-colors",
              !isCurrentMonth(date) && "text-primary/20",
              isToday(date) &&
                "bg-primbuttn text-secondary ring-2 ring-primary/80",
              !isSelected(date) && "hover:bg-accent/20 hover:text-accent",
              isSelected(date) && "bg-accent text-secondary",
              // isWeekend(date) && "bg-secondary text-accent",
              isCurrentMonth(date) &&
                !isToday(date) &&
                !isSelected(date) &&
                "text-primary",
            )}
            onMouseEnter={(e) => {
              // Add hover effect to related dates
              const hoveredDate = date;
              const buttons = e.currentTarget.parentElement?.children;
              if (buttons) {
                Array.from(buttons).forEach((button, buttonIndex) => {
                  const buttonDate = paddedDays[buttonIndex];
                  if (shouldHighlightOnHover(hoveredDate, buttonDate)) {
                    button.classList.add("bg-accent/20", "text-accent");
                  }
                });
              }
            }}
            onMouseLeave={(e) => {
              // Remove hover effect from related dates
              const buttons = e.currentTarget.parentElement?.children;
              if (buttons) {
                Array.from(buttons).forEach((button) => {
                  button.classList.remove("bg-accent/20", "text-accent");
                });
              }
            }}
          >
            {date.jDate()}
          </Button>
        ))}
      </div>

      <svg className="hidden">
        <defs>
          <filter id="liquid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            <feColorMatrix
              in="name"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 30 -15"
            />
            <feBlend in="SourceGraphic" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default function PersianCalendarPicker({
  onDateSelect,
  onDatesSelect,
  onWeekSelect,
  onMonthSelect,
  selectedDate,
  selectedDates,
  selectedWeek,
  selectedMonth,
  className,
}: PersianCalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState(
    selectedDate || moment().locale("fa"),
  );
  const [activeTab, setActiveTab] = useState("daily");

  // Get the effective selected dates (use selectedDates if provided, otherwise convert selectedDate to array)
  const effectiveSelectedDates =
    selectedDates || (selectedDate ? [selectedDate] : []);

  // Get calendar days for current month
  const getCalendarDays = (date: moment.Moment) => {
    const startOfMonth = date.clone().startOf("jMonth");
    const endOfMonth = date.clone().endOf("jMonth");
    const startOfCalendar = startOfMonth.clone().startOf("week");
    const endOfCalendar = endOfMonth.clone().endOf("week");

    const days = [];
    let current = startOfCalendar.clone();

    while (current.isSameOrBefore(endOfCalendar)) {
      days.push(current.clone());
      current.add(1, "day");
    }

    return days;
  };

  const calendarDays = getCalendarDays(currentDate);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "jMonth"));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "jMonth"));
  };

  const goToToday = () => {
    setCurrentDate(moment().locale("fa"));
  };

  // Date selection handlers with toggle functionality
  const handleDateClick = (date: moment.Moment) => {
    // For multiple selection, toggle the date
    const isAlreadySelected = effectiveSelectedDates.some((selectedDate) =>
      selectedDate.isSame(date, "day"),
    );

    let newSelectedDates: moment.Moment[];

    if (isAlreadySelected) {
      // Remove the date from selection
      newSelectedDates = effectiveSelectedDates.filter(
        (selectedDate) => !selectedDate.isSame(date, "day"),
      );
    } else {
      // Add the date to selection
      newSelectedDates = [...effectiveSelectedDates, date.clone()];
    }

    // Call the appropriate callback
    if (onDatesSelect) {
      onDatesSelect(newSelectedDates);
    } else if (onDateSelect) {
      // For backward compatibility, call with the first date or null
      onDateSelect(newSelectedDates[0] || (null as any));
    }
  };

  const handleWeekClick = (date: moment.Moment) => {
    const startOfWeek = date.clone().startOf("week");
    const endOfWeek = date.clone().endOf("week");

    if (onWeekSelect) {
      // Only allow toggle if there's another week to select
      // If this is the only selected week, don't allow deselection
      if (
        selectedWeek &&
        startOfWeek.isSame(selectedWeek.start, "day") &&
        endOfWeek.isSame(selectedWeek.end, "day")
      ) {
        // Don't deselect if it's the only selection
        return;
      } else {
        onWeekSelect(startOfWeek, endOfWeek);
      }
    }
  };

  const handleMonthClick = (date: moment.Moment) => {
    const startOfMonth = date.clone().startOf("jMonth");
    const endOfMonth = date.clone().endOf("jMonth");

    if (onMonthSelect) {
      // Only allow toggle if there's another month to select
      // If this is the only selected month, don't allow deselection
      if (
        selectedMonth &&
        startOfMonth.isSame(selectedMonth.start, "day") &&
        endOfMonth.isSame(selectedMonth.end, "day")
      ) {
        // Don't deselect if it's the only selection
        return;
      } else {
        onMonthSelect(startOfMonth, endOfMonth);
      }
    }
  };

  // Helper functions for styling
  const isToday = (date: moment.Moment) => {
    return date.isSame(moment().locale("fa"), "day");
  };

  const isSelected = (date: moment.Moment) => {
    if (activeTab === "daily") {
      return effectiveSelectedDates.some((selectedDate) =>
        selectedDate.isSame(date, "day"),
      );
    }
    if (activeTab === "weekly" && selectedWeek) {
      return (
        date.isSameOrAfter(selectedWeek.start, "day") &&
        date.isSameOrBefore(selectedWeek.end, "day")
      );
    }
    if (activeTab === "monthly" && selectedMonth) {
      return (
        date.isSameOrAfter(selectedMonth.start, "day") &&
        date.isSameOrBefore(selectedMonth.end, "day")
      );
    }
    return false;
  };

  const isCurrentMonth = (date: moment.Moment) => {
    return date.jMonth() === currentDate.jMonth();
  };

  const isWeekend = (date: moment.Moment) => {
    return date.day() === 5 || date.day() === 6; // Friday and Saturday in Persian calendar
  };

  // Get the appropriate click handler based on active tab
  const getDateClickHandler = () => {
    switch (activeTab) {
      case "daily":
        return handleDateClick;
      case "weekly":
        return handleWeekClick;
      case "monthly":
        return handleMonthClick;
      default:
        return handleDateClick;
    }
  };

  return (
    <div
      className={cn("w-full  rounded-2xl bg-secbuttn p-4 shadow-lg", className)}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger
            value="daily"
            className="text-primary data-[state=active]:bg-accent data-[state=active]:text-secondary"
          >
            روزانه
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="text-primary data-[state=active]:bg-accent data-[state=active]:text-secondary"
          >
            هفتگی
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="text-primary data-[state=active]:bg-accent data-[state=active]:text-secondary"
          >
            ماهانه
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <div className="space-y-4">
            <CalendarHeader
              currentDate={currentDate}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
            />
            <CalendarGrid
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateClick={getDateClickHandler()}
              isSelected={isSelected}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isWeekend={isWeekend}
              activeTab={activeTab}
            />
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <div className="space-y-4">
            <CalendarHeader
              currentDate={currentDate}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
            />
            <CalendarGrid
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateClick={getDateClickHandler()}
              isSelected={isSelected}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isWeekend={isWeekend}
              activeTab={activeTab}
            />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="space-y-4">
            <CalendarHeader
              currentDate={currentDate}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
            />
            <CalendarGrid
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateClick={getDateClickHandler()}
              isSelected={isSelected}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isWeekend={isWeekend}
              activeTab={activeTab}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
