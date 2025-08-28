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
import { CalendarTab } from "./types";

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

// Persian weekday names - reversed for right-to-left display
const PERSIAN_WEEKDAYS = ["جم", "پنج", "چهار", "سه", "دو", "یک", "شن"];

interface PersianCalendarPickerProps {
  onDateSelect?: (date: moment.Moment) => void;
  onDatesSelect?: (dates: moment.Moment[]) => void; // New callback for multiple dates
  onWeekSelect?: (startDate: moment.Moment, endDate: moment.Moment) => void;
  onWeeksSelect?: (
    weeks: { start: moment.Moment; end: moment.Moment }[],
  ) => void; // New callback for multiple weeks
  onMonthSelect?: (startDate: moment.Moment, endDate: moment.Moment) => void;
  onMonthsSelect?: (
    months: { start: moment.Moment; end: moment.Moment }[],
  ) => void; // New callback for multiple months
  selectedDate?: moment.Moment; // For backward compatibility
  selectedDates?: moment.Moment[]; // New prop for multiple selection
  selectedWeek?: { start: moment.Moment; end: moment.Moment };
  selectedWeeks?: { start: moment.Moment; end: moment.Moment }[]; // New prop for multiple weeks
  selectedMonth?: { start: moment.Moment; end: moment.Moment };
  selectedMonths?: { start: moment.Moment; end: moment.Moment }[]; // New prop for multiple months
  allowMultiDaySelection?: boolean; // Default: true
  allowMultiWeekSelection?: boolean; // Default: false
  allowMultiMonthSelection?: boolean; // Default: true
  className?: string;
  activeTab?: CalendarTab; // New prop for external tab control
  onActiveTabChange?: (tab: CalendarTab) => void; // New prop for external tab control
}

// Reusable Calendar Header Component
const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onYearSelect,
  onMonthSelect,
  showYearPicker,
  showMonthPicker,
  onToggleYearPicker,
  onToggleMonthPicker,
  showMonthListView,
  setShowMonthListView,
  activeTab,
}: {
  currentDate: moment.Moment;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onYearSelect: (year: number) => void;
  onMonthSelect: (month: number) => void;
  showYearPicker: boolean;
  showMonthPicker: boolean;
  onToggleYearPicker: () => void;
  onToggleMonthPicker: () => void;
  showMonthListView?: boolean;
  setShowMonthListView?: (show: boolean) => void;
  activeTab?: CalendarTab;
}) => {
  // Generate years (current year ± 50 years)
  const currentYear = currentDate.jYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  // Generate months
  const months = PERSIAN_MONTHS.map((month, index) => ({
    name: month,
    value: index,
  }));

  // Refs for scrolling
  const yearContainerRef = React.useRef<HTMLDivElement>(null);
  const currentYearRef = React.useRef<HTMLButtonElement>(null);

  // Auto-scroll to current year when year picker opens
  React.useEffect(() => {
    if (showYearPicker && yearContainerRef.current && currentYearRef.current) {
      // Use setTimeout to ensure the DOM is rendered
      setTimeout(() => {
        const yearContainer = yearContainerRef.current;
        const currentYearElement = currentYearRef.current;

        if (yearContainer && currentYearElement) {
          // Calculate the scroll position to center the current year
          const scrollTop =
            currentYearElement.offsetTop -
            yearContainer.offsetTop -
            yearContainer.clientHeight / 2 +
            currentYearElement.clientHeight / 2;

          yearContainer.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [showYearPicker, currentYear]);

  return (
    <div className="flex flex-col gap-2">
      <div className="calendar-header flex items-center justify-between">
        <Button
          onClick={onPreviousMonth}
          className="text-primary hover:bg-accent hover:text-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2">
            {/* Month Selector */}
            <div className="relative">
              <button
                onClick={onToggleMonthPicker}
                className="cursor-pointer text-lg font-semibold text-primary transition-colors hover:text-accent"
              >
                {PERSIAN_MONTHS[currentDate.jMonth()]}
              </button>
              {showMonthPicker && (
                <>
                  {/* Blur Background */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={onToggleMonthPicker}
                  />

                  {/* Month Panel */}
                  <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 transform rounded-lg  bg-secbuttn p-4 shadow-2xl">
                    <div className="mb-3 text-center text-sm font-medium text-primary">
                      انتخاب ماه
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {months.map((month) => (
                        <button
                          key={month.value}
                          onClick={() => {
                            onMonthSelect(month.value);
                            onToggleMonthPicker();
                          }}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent hover:text-secondary",
                            currentDate.jMonth() === month.value &&
                              "bg-accent text-secondary",
                          )}
                        >
                          {month.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Year Selector */}
            <div className="relative">
              <button
                onClick={onToggleYearPicker}
                className="cursor-pointer text-lg font-semibold text-primary transition-colors hover:text-accent"
              >
                {currentDate.jYear()}
              </button>
              {showYearPicker && (
                <>
                  {/* Blur Background */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    onClick={onToggleYearPicker}
                  />

                  {/* Year Panel */}
                  <div className="absolute left-1/2 top-full z-50 mt-2 h-64 w-80 -translate-x-1/2 transform rounded-lg  bg-secbuttn p-4 shadow-2xl">
                    <div className="mb-3 text-center text-sm font-medium text-primary">
                      انتخاب سال
                    </div>
                    <div
                      className="year-panel-scroll h-48 overflow-y-auto "
                      ref={yearContainerRef}
                    >
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {years.map((year) => (
                          <button
                            key={year}
                            id={`year-${year}`}
                            onClick={() => {
                              onYearSelect(year);
                              onToggleYearPicker();
                            }}
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent hover:text-secondary",
                              currentDate.jYear() === year &&
                                "bg-accent text-secondary",
                            )}
                            ref={year === currentYear ? currentYearRef : null}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={onNextMonth}
          className="text-primary hover:bg-accent hover:text-secondary"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <Button
          onClick={onGoToToday}
          className="text-xs text-accent hover:bg-accent hover:text-secondary"
        >
          برو به امروز
        </Button>
        {/* Toggle Button for Multi-Month Selection */}
        {activeTab === "monthly" && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowMonthListView(!showMonthListView)}
              className="text-xs text-accent hover:bg-accent hover:text-secondary"
            >
              {showMonthListView ? "نمایش تقویم" : "نمایش لیست ماه ‌ها"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

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
        style={{ gridTemplateRows: "repeat(6, 1fr)", direction: "rtl" }}
      >
        {paddedDays.map((date, index) => (
          <Button
            key={`${date.format("YYYY-MM-DD")}-${activeTab}`}
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

// Month List View Component for Multi-Month Selection
const MonthListView = ({
  currentDate,
  selectedMonths,
  onMonthsSelect,
  allowMultiMonthSelection,
}: {
  currentDate: moment.Moment;
  selectedMonths: { start: moment.Moment; end: moment.Moment }[];
  onMonthsSelect: (
    months: { start: moment.Moment; end: moment.Moment }[],
  ) => void;
  allowMultiMonthSelection: boolean;
}) => {
  const currentYear = currentDate.jYear();

  // Generate all months for the current year
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthStart = moment()
      .locale("fa")
      .jYear(currentYear)
      .jMonth(i)
      .startOf("jMonth");
    const monthEnd = moment()
      .locale("fa")
      .jYear(currentYear)
      .jMonth(i)
      .endOf("jMonth");
    return {
      name: PERSIAN_MONTHS[i],
      value: i,
      start: monthStart,
      end: monthEnd,
    };
  });

  const handleMonthClick = (month: {
    name: string;
    value: number;
    start: moment.Moment;
    end: moment.Moment;
  }) => {
    if (allowMultiMonthSelection) {
      // Check if this month is already selected
      const isAlreadySelected = selectedMonths.some(
        (selectedMonth) =>
          selectedMonth.start.isSame(month.start, "day") &&
          selectedMonth.end.isSame(month.end, "day"),
      );

      let newSelectedMonths: { start: moment.Moment; end: moment.Moment }[];

      if (isAlreadySelected) {
        // Remove the month from selection
        newSelectedMonths = selectedMonths.filter(
          (selectedMonth) =>
            !(
              selectedMonth.start.isSame(month.start, "day") &&
              selectedMonth.end.isSame(month.end, "day")
            ),
        );
      } else {
        // Add the month to selection
        newSelectedMonths = [
          ...selectedMonths,
          { start: month.start, end: month.end },
        ];
      }

      onMonthsSelect(newSelectedMonths);
    }
  };

  const isMonthSelected = (month: {
    start: moment.Moment;
    end: moment.Moment;
  }) => {
    return selectedMonths.some(
      (selectedMonth) =>
        selectedMonth.start.isSame(month.start, "day") &&
        selectedMonth.end.isSame(month.end, "day"),
    );
  };

  return (
    <div className="space-y-4">
      {/* <div className="text-center">
        <h3 className="text-lg font-semibold text-primary">{currentYear}</h3>
        <p className="text-sm text-primary/70">
          {selectedMonths.length} ماه انتخاب شده
        </p>
      </div> */}

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        style={{ direction: "rtl" }}
      >
        {months.map((month) => (
          <button
            key={month.value}
            onClick={() => handleMonthClick(month)}
            className={cn(
              "rounded-lg border-2 p-4 text-center transition-all hover:scale-105",
              isMonthSelected(month)
                ? "border-accent bg-accent text-secondary shadow-lg"
                : "border-primary/20 bg-secbuttn text-primary hover:border-accent/50 hover:bg-accent/10",
            )}
          >
            <div className="text-sm font-medium">{month.name}</div>
            <div className="mt-1 text-xs text-primary/70">
              {month.start.format("jDD")} - {month.end.format("jDD")}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export function PersianCalendarPicker({
  onDateSelect,
  onDatesSelect,
  onWeekSelect,
  onWeeksSelect,
  onMonthSelect,
  onMonthsSelect,
  selectedDate,
  selectedDates,
  selectedWeek,
  selectedWeeks,
  selectedMonth,
  selectedMonths,
  allowMultiDaySelection = true,
  allowMultiWeekSelection = false,
  allowMultiMonthSelection = true,
  className,
  activeTab,
  onActiveTabChange,
}: PersianCalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState(
    selectedDate || moment().locale("fa"),
  );
  const [activeTabState, setActiveTabState] = useState<CalendarTab>(
    activeTab || "daily",
  );
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showMonthListView, setShowMonthListView] = useState(true);

  // Update internal state when external activeTab prop changes
  React.useEffect(() => {
    if (activeTab && activeTab !== activeTabState) {
      setActiveTabState(activeTab);
    }
  }, [activeTab, activeTabState]);

  // Handle tab change with callback
  const handleTabChange = (tab: CalendarTab) => {
    setActiveTabState(tab);
    if (onActiveTabChange) {
      onActiveTabChange(tab);
    }
  };

  // Get the effective selected dates (use selectedDates if provided, otherwise convert selectedDate to array)
  const effectiveSelectedDates =
    selectedDates || (selectedDate ? [selectedDate] : []);

  // Get the effective selected weeks
  const effectiveSelectedWeeks =
    selectedWeeks || (selectedWeek ? [selectedWeek] : []);

  // Get the effective selected months
  const effectiveSelectedMonths =
    selectedMonths || (selectedMonth ? [selectedMonth] : []);

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

  // Year and month selection handlers
  const handleYearSelect = (year: number) => {
    setCurrentDate(currentDate.clone().jYear(year));
  };

  const handleMonthSelect = (month: number) => {
    setCurrentDate(currentDate.clone().jMonth(month));
  };

  const handleMonthsSelect = (
    months: { start: moment.Moment; end: moment.Moment }[],
  ) => {
    if (onMonthsSelect) {
      onMonthsSelect(months);
    }
  };

  const toggleYearPicker = () => {
    setShowYearPicker(!showYearPicker);
    setShowMonthPicker(false); // Close month picker if open
  };

  const toggleMonthPicker = () => {
    setShowMonthPicker(!showMonthPicker);
    setShowYearPicker(false); // Close year picker if open
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
      if (allowMultiDaySelection) {
        newSelectedDates = [...effectiveSelectedDates, date.clone()];
      } else {
        // Single selection mode - replace with new date
        newSelectedDates = [date.clone()];
      }
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

    if (onWeekSelect || onWeeksSelect) {
      // Check if this week is already selected
      const isAlreadySelected = effectiveSelectedWeeks.some(
        (week) =>
          week.start.isSame(startOfWeek, "day") &&
          week.end.isSame(endOfWeek, "day"),
      );

      let newSelectedWeeks: { start: moment.Moment; end: moment.Moment }[];

      if (isAlreadySelected) {
        // Remove the week from selection
        newSelectedWeeks = effectiveSelectedWeeks.filter(
          (week) =>
            !(
              week.start.isSame(startOfWeek, "day") &&
              week.end.isSame(endOfWeek, "day")
            ),
        );
      } else {
        // Add the week to selection
        if (allowMultiWeekSelection) {
          newSelectedWeeks = [
            ...effectiveSelectedWeeks,
            { start: startOfWeek, end: endOfWeek },
          ];
        } else {
          // Single selection mode - replace with new week
          newSelectedWeeks = [{ start: startOfWeek, end: endOfWeek }];
        }
      }

      // Call the appropriate callback
      if (onWeeksSelect) {
        onWeeksSelect(newSelectedWeeks);
      } else if (onWeekSelect) {
        // For backward compatibility, call with the first week or null
        onWeekSelect(
          newSelectedWeeks[0]?.start || (null as any),
          newSelectedWeeks[0]?.end || (null as any),
        );
      }
    }
  };

  const handleMonthClick = (date: moment.Moment) => {
    const startOfMonth = date.clone().startOf("jMonth");
    const endOfMonth = date.clone().endOf("jMonth");

    if (onMonthSelect || onMonthsSelect) {
      // Check if this month is already selected
      const isAlreadySelected = effectiveSelectedMonths.some(
        (month) =>
          month.start.isSame(startOfMonth, "day") &&
          month.end.isSame(endOfMonth, "day"),
      );

      let newSelectedMonths: { start: moment.Moment; end: moment.Moment }[];

      if (isAlreadySelected) {
        // Remove the month from selection
        newSelectedMonths = effectiveSelectedMonths.filter(
          (month) =>
            !(
              month.start.isSame(startOfMonth, "day") &&
              month.end.isSame(endOfMonth, "day")
            ),
        );
      } else {
        // Add the month to selection
        if (allowMultiMonthSelection) {
          newSelectedMonths = [
            ...effectiveSelectedMonths,
            { start: startOfMonth, end: endOfMonth },
          ];
        } else {
          // Single selection mode - replace with new month
          newSelectedMonths = [{ start: startOfMonth, end: endOfMonth }];
        }
      }

      // Call the appropriate callback
      if (onMonthsSelect) {
        onMonthsSelect(newSelectedMonths);
      } else if (onMonthSelect) {
        // For backward compatibility, call with the first month or null
        onMonthSelect(
          newSelectedMonths[0]?.start || (null as any),
          newSelectedMonths[0]?.end || (null as any),
        );
      }
    }
  };

  // Helper functions for styling
  const isToday = (date: moment.Moment) => {
    return date.isSame(moment().locale("fa"), "day");
  };

  const isSelected = (date: moment.Moment) => {
    if (activeTabState === "daily") {
      return effectiveSelectedDates.some((selectedDate) =>
        selectedDate.isSame(date, "day"),
      );
    }
    if (activeTabState === "weekly") {
      return effectiveSelectedWeeks.some(
        (week) =>
          date.isSameOrAfter(week.start, "day") &&
          date.isSameOrBefore(week.end, "day"),
      );
    }
    if (activeTabState === "monthly") {
      return effectiveSelectedMonths.some(
        (month) =>
          date.isSameOrAfter(month.start, "day") &&
          date.isSameOrBefore(month.end, "day"),
      );
    }
    return false;
  };

  const isCurrentMonth = (date: moment.Moment) => {
    return date.jMonth() === currentDate.jMonth();
  };

  const isWeekend = (date: moment.Moment) => {
    return date.day() === 5 || date.day() === 6; // Friday (جم) and Saturday (شن) in Persian calendar
  };

  // Get the appropriate click handler based on active tab
  const getDateClickHandler = () => {
    switch (activeTabState) {
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
      className={cn(
        "w-full  rounded-2xl bg-secbuttn px-4 shadow-lg",
        className,
      )}
    >
      <Tabs
        value={activeTabState}
        onValueChange={handleTabChange}
        className="w-full"
      >
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
              onYearSelect={handleYearSelect}
              onMonthSelect={handleMonthSelect}
              showYearPicker={showYearPicker}
              showMonthPicker={showMonthPicker}
              onToggleYearPicker={toggleYearPicker}
              onToggleMonthPicker={toggleMonthPicker}
            />
            <CalendarGrid
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateClick={getDateClickHandler()}
              isSelected={isSelected}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isWeekend={isWeekend}
              activeTab={activeTabState}
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
              onYearSelect={handleYearSelect}
              onMonthSelect={handleMonthSelect}
              showYearPicker={showYearPicker}
              showMonthPicker={showMonthPicker}
              onToggleYearPicker={toggleYearPicker}
              onToggleMonthPicker={toggleMonthPicker}
              showMonthListView={false}
            />
            <CalendarGrid
              calendarDays={calendarDays}
              currentDate={currentDate}
              onDateClick={getDateClickHandler()}
              isSelected={isSelected}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isWeekend={isWeekend}
              activeTab={activeTabState}
            />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="min-h-[372px] max-w-[374px] space-y-4">
            <CalendarHeader
              currentDate={currentDate}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
              onYearSelect={handleYearSelect}
              onMonthSelect={handleMonthSelect}
              showYearPicker={showYearPicker}
              showMonthPicker={showMonthPicker}
              onToggleYearPicker={toggleYearPicker}
              onToggleMonthPicker={toggleMonthPicker}
              showMonthListView={showMonthListView}
              setShowMonthListView={setShowMonthListView}
              activeTab={activeTabState}
            />

            {showMonthListView ? (
              <MonthListView
                currentDate={currentDate}
                selectedMonths={effectiveSelectedMonths}
                onMonthsSelect={handleMonthsSelect}
                allowMultiMonthSelection={allowMultiMonthSelection}
              />
            ) : (
              <CalendarGrid
                calendarDays={calendarDays}
                currentDate={currentDate}
                onDateClick={getDateClickHandler()}
                isSelected={isSelected}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                isWeekend={isWeekend}
                activeTab={activeTabState}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export the original component as default for backward compatibility
export default PersianCalendarPicker;
