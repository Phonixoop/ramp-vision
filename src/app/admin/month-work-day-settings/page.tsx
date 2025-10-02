"use client";

import React, { useState, useEffect } from "react";
import moment from "jalali-moment";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { api } from "~/trpc/react";
import MonthWorkDayModal from "~/app/admin/month-work-day-settings/components";
import Button from "~/ui/buttons";
import { cn } from "~/lib/utils";

function MonthWorkDaySettingsPage() {
  const [selectedYear, setSelectedYear] = useState(moment().jYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [currentWorkDays, setCurrentWorkDays] = useState(0);

  // Fetch all month work days
  const { data: monthWorkDays, refetch } = api.monthWorkDays.getAll.useQuery();

  // Upsert mutation
  const upsertMutation = api.monthWorkDays.upsert.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
    },
  });

  // Get work days for a specific month/year
  const { data: specificMonthWorkDays } =
    api.monthWorkDays.getByMonthYear.useQuery(
      {
        year: selectedYear,
        month: selectedMonth,
      },
      {
        enabled: isModalOpen,
      },
    );

  // Update currentWorkDays when specificMonthWorkDays changes
  useEffect(() => {
    if (specificMonthWorkDays) {
      setCurrentWorkDays(specificMonthWorkDays.work_days);
    } else {
      setCurrentWorkDays(0);
    }
  }, [specificMonthWorkDays]);

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    setIsModalOpen(true);
  };

  const handleSave = (year: number, month: number, workDays: number) => {
    upsertMutation.mutate({
      year,
      month,
      work_days: workDays,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedYear(selectedYear + 1);
    }
  };

  // Get work days for a specific month
  const getWorkDaysForMonth = (month: number) => {
    const monthData = monthWorkDays?.find(
      (item) => item.year === selectedYear && item.month === month,
    );
    return monthData?.work_days || 0;
  };

  // Persian month names
  const monthNames = [
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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">
          تنظیم روزهای کاری ماه‌ها
        </h1>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-center gap-4 rounded-lg bg-primary/10 p-4">
        <Button
          onClick={() => handleYearChange("next")}
          className="border border-primary/20 px-3 py-2 text-primary hover:bg-primary/10"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>

        <span className="text-xl font-semibold text-primary">
          سال {selectedYear}
        </span>

        <Button
          onClick={() => handleYearChange("prev")}
          className="border border-primary/20 px-3 py-2 text-primary hover:bg-primary/10"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {monthNames.map((monthName, index) => {
          const month = index + 1;
          const workDays = getWorkDaysForMonth(month);
          const hasWorkDaysSet = workDays > 0;

          return (
            <div
              key={month}
              onClick={() => handleMonthClick(month)}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all duration-200",
                hasWorkDaysSet
                  ? "border-accent bg-accent/10 hover:bg-accent/20"
                  : "border-primary/20 bg-transparent hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <span className="text-lg font-medium text-primary">
                {monthName}
              </span>

              <div
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  hasWorkDaysSet
                    ? "bg-accent text-primary"
                    : "bg-primary/20 text-primary/70",
                )}
              >
                {workDays > 0 ? `${workDays} روز` : "تنظیم نشده"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 rounded-lg bg-primary/5 p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-accent bg-accent/10"></div>
          <span className="text-sm text-primary">تنظیم شده</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary/20 bg-primary/20"></div>
          <span className="text-sm text-primary">تنظیم نشده</span>
        </div>
      </div>

      {/* Modal */}
      <MonthWorkDayModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        currentWorkDays={currentWorkDays}
        isLoading={upsertMutation.isPending}
      />
    </div>
  );
}

export default MonthWorkDaySettingsPage;
