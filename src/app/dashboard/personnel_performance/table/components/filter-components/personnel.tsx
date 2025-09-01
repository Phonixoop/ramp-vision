"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";

export const PersonnelFilter = memo(function PersonnelFilter({
  column,
  personnelPerformance,
}: {
  column: Column<any, unknown>;
  personnelPerformance: any;
}) {
  // Check if personnel data is loading
  const isPersonnelDataLoading = !personnelPerformance?.result;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">پرسنل</span>
      {isPersonnelDataLoading ? (
        <TableFilterSkeleton />
      ) : (
        <SelectColumnFilterOptimized<
          Pick<PersonnelPerformanceData, "NameFamily">
        >
          column={column}
          values={personnelPerformance?.result ?? []}
        />
      )}
    </div>
  );
});
