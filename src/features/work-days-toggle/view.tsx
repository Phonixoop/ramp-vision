"use client";

import React, { useMemo } from "react";
import moment from "jalali-moment";
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";
import { usePersonnelFilter } from "~/context/personnel-filter.context";
import { api } from "~/trpc/react";
import WorkDaysToggle from "./index";

interface WorkDaysToggleViewProps {
  className?: string;
  filters: any;
}

function WorkDaysToggleView({ className, filters }: WorkDaysToggleViewProps) {
  const { useWorkDays, setUseWorkDays } = useWorkDaysToggle();

  // Prepare months array for work days calculation
  const monthsArray = useMemo(() => {
    if (
      !filters?.periodType ||
      filters.periodType !== "ماهانه" ||
      !filters?.filter?.Start_Date ||
      !Array.isArray(filters.filter.Start_Date)
    ) {
      return [];
    }

    const months: { year: number; month: number }[] = [];

    filters.filter.Start_Date.forEach((dateStr) => {
      if (typeof dateStr === "string") {
        try {
          const momentDate = moment(dateStr, "jYYYY/jMM/jDD");
          const year = momentDate.jYear();
          const month = momentDate.jMonth() + 1; // jMonth() returns 0-11, we need 1-12
          months.push({ year, month });
        } catch (error) {
          console.warn("Error parsing date:", dateStr, error);
        }
      }
    });

    return months;
  }, [filters?.periodType, filters?.filter?.Start_Date]);

  // Fetch total work days from tRPC
  const { data: workDaysData } = api.monthWorkDays.getTotalWorkDays.useQuery(
    { months: monthsArray },
    {
      enabled: monthsArray.length > 0,
      staleTime: 5 * 60 * 1000,
    },
  );

  const totalWorkDays = workDaysData?.totalWorkDays || null;

  return (
    <WorkDaysToggle
      isEnabled={useWorkDays}
      onToggle={setUseWorkDays}
      totalWorkDays={totalWorkDays}
      className={className}
    />
  );
}

export default WorkDaysToggleView;
