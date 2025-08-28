"use client";

import React, { useEffect, useState } from "react";
import moment from "jalali-moment";
import { XIcon } from "lucide-react";
import { CalendarTab } from "./types";
import { cn } from "~/lib/utils";

interface SelectedItemsPanelProps {
  periodType: CalendarTab;
  pendingDates: string[];
  pendingWeeks: string[];
  pendingMonths: string[];
  onRemoveDate: (periodType: CalendarTab, index: number) => void;

  className?: string;
}

function getDateString({
  periodType,
  date,
}: {
  periodType: CalendarTab;
  date: string;
}) {
  console.log("sss", date);
  // Parse Persian date using the correct format
  const dateMoment = moment(date, "jYYYY/jMM/jDD").locale("fa");
  console.log("dateMoment", dateMoment.clone().format("jMMMM"));
  if (periodType === "daily") {
    return dateMoment.format("jYYYY/jMM/jDD");
  } else if (periodType === "weekly") {
    return dateMoment.format("jYYYY/jMM/jDD");
  } else if (periodType === "monthly") {
    const monthName =
      dateMoment.format("jMMMM") + " " + dateMoment.format("jYYYY");
    return monthName;
  }
}

function DateItem({
  periodType = "daily",
  date,
  showCloseButton = true,
  index,
  onRemoveDate,
}: {
  periodType: CalendarTab;
  date: string;
  showCloseButton?: boolean;
  index: number;
  onRemoveDate: (periodType: CalendarTab, index: number) => void;
}) {
  // if perdioType is month, show month name

  const dateString = getDateString({ periodType, date });
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center rounded-lg bg-secbuttn p-2",
        showCloseButton && "justify-between ",
      )}
    >
      <span className="text-sm text-primary">{dateString}</span>
      {showCloseButton && (
        <button
          onClick={() => onRemoveDate(periodType, index)}
          className="peer rounded-full p-1 text-primary/50 transition-colors hover:bg-rose-500 hover:text-white"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
      {/* Red background overlay only when button is hovered */}
      {showCloseButton && (
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-rose-500/10 opacity-0 transition-opacity peer-hover:opacity-100" />
      )}
    </div>
  );
}

function WeeklyItem({
  startDate,
  endDate,
  weekIndex,
  onRemoveDate,
}: {
  startDate: string;
  endDate: string;
  weekIndex: number;
  onRemoveDate: (periodType: CalendarTab, index: number) => void;
}) {
  return (
    <div className="relative flex w-full items-center justify-between rounded-lg">
      {/* two DateItem under each other with تا in the middle of them vertically centered */}
      <div className="filter-liquid flex w-full flex-col items-center justify-center gap-1">
        <DateItem
          showCloseButton={false}
          periodType="weekly"
          date={startDate}
          index={weekIndex}
          onRemoveDate={onRemoveDate}
        />

        <DateItem
          showCloseButton={false}
          periodType="weekly"
          date={endDate}
          index={weekIndex}
          onRemoveDate={onRemoveDate}
        />
      </div>
      <button
        onClick={() => {
          onRemoveDate("weekly", weekIndex);
        }}
        className="peer absolute right-2 rounded-full p-1 text-primary transition-colors hover:bg-rose-500 hover:text-white"
      >
        <XIcon className="h-3 w-3" />
      </button>
      {/* Red background overlay only when button is hovered */}
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-rose-500/10 opacity-0 transition-opacity peer-hover:opacity-100" />
    </div>
  );
}

const getSectionTitle = (activeTab: CalendarTab) => {
  switch (activeTab) {
    case "daily":
      return "تاریخ‌ ها";
    case "weekly":
      return "هفته‌ ها";
    case "monthly":
      return "ماه ‌ها";
    default:
      return "";
  }
};

const getItemsCount = (
  periodType: CalendarTab,
  pendingDates: string[],
  pendingWeeks: string[],
  pendingMonths: string[],
) => {
  switch (periodType) {
    case "daily":
      return pendingDates.length;
    case "weekly":
      return pendingWeeks.length;
    case "monthly":
      return pendingMonths.length;
    default:
      return 0;
  }
};

export default function SelectedItemsPanel({
  periodType,
  pendingDates,
  pendingWeeks,
  pendingMonths,
  onRemoveDate,

  className = "",
}: SelectedItemsPanelProps) {
  const hasItems =
    getItemsCount(periodType, pendingDates, pendingWeeks, pendingMonths) > 0;

  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    if (periodType === "weekly") {
      setDates(pendingWeeks);
    } else if (periodType === "monthly") {
      setDates(pendingMonths);
    } else {
      setDates(pendingDates);
    }
  }, [pendingWeeks, pendingMonths, pendingDates, periodType]);

  return (
    <div
      className={cn(
        ` flex h-full w-full items-center justify-center rounded-l-lg border-r border-primary/20  bg-secondary p-1`,
        className,
      )}
    >
      {/* <div className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-transparent to-secondary" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-secbuttn to-secondary/10" /> */}
      <div className="flex h-full w-full flex-col items-center justify-center gap-3">
        <h3 className="w-full pt-2 text-center text-sm font-semibold text-primary">
          موارد انتخاب شده
        </h3>

        <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto">
          {hasItems && (
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <h4
                dir="rtl"
                className="rounded-full bg-accent p-1 text-xs font-medium text-primary/70"
              >
                {getSectionTitle(periodType)}
              </h4>
              <hr className="w-full border-primary/20 " />
              <div
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1",
                  periodType === "weekly" && "liquid-filter",
                )}
              >
                {periodType === "weekly"
                  ? // For weekly, group dates in pairs (start and end of each week)
                    Array.from(
                      { length: Math.ceil(dates.length / 2) },
                      (_, weekIndex) => {
                        const startDateIndex = weekIndex * 2;
                        const endDateIndex = startDateIndex + 1;
                        const startDate = dates[startDateIndex];
                        const endDate = dates[endDateIndex];

                        if (!startDate || !endDate) return null;

                        return (
                          <WeeklyItem
                            key={`week-${weekIndex}`}
                            startDate={startDate}
                            endDate={endDate}
                            weekIndex={weekIndex}
                            onRemoveDate={onRemoveDate}
                          />
                        );
                      },
                    )
                  : // For daily and monthly, render individual items
                    dates.map((date, index) => (
                      <DateItem
                        key={`${date}-${index}`}
                        periodType={periodType}
                        date={date}
                        index={index}
                        onRemoveDate={onRemoveDate}
                      />
                    ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
