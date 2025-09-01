"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import { defaultProjectTypes } from "~/constants/personnel-performance";

export const ProjectTypeFilter = memo(function ProjectTypeFilter({
  column,
  initialFilters,
  filters,
  setDataFilters,
}: {
  column: Column<any, unknown>;
  initialFilters: any;
  filters: any;
  setDataFilters: (f: any) => void;
}) {
  // Check if project types are loading
  const isProjectTypesLoading = !initialFilters?.ProjectTypes;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع پروژه</span>

      {isProjectTypesLoading ? (
        <TableFilterSkeleton />
      ) : (
        <SelectColumnFilterOptimized<
          Pick<PersonnelPerformanceData, "ProjectType">
        >
          initialFilters={filters?.filter?.ProjectType ?? defaultProjectTypes}
          column={column}
          values={(initialFilters?.ProjectTypes ?? []).map((a: string) => ({
            ProjectType: a,
          }))}
          onChange={(filter) => {
            setDataFilters((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                [filter.id]: filter.values,
              },
            }));
          }}
        />
      )}
    </div>
  );
});
