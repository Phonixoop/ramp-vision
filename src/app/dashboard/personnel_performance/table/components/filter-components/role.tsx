"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import { defualtRoles } from "~/constants/personnel-performance";

export const RoleFilter = memo(function RoleFilter({
  column,
  personnelPerformance,
}: {
  column: Column<any, unknown>;
  personnelPerformance: any;
}) {
  // Check if personnel data is loading (needed for role values)
  const isPersonnelDataLoading = !personnelPerformance?.result;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">سمت</span>

      {isPersonnelDataLoading ? (
        <TableFilterSkeleton />
      ) : (
        <SelectColumnFilterOptimized<Pick<PersonnelPerformanceData, "Role">>
          initialFilters={defualtRoles}
          column={column}
          values={personnelPerformance?.result}
        />
      )}
    </div>
  );
});
