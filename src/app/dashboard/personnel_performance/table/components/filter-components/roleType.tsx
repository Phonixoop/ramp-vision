"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import {
  defualtContractTypes,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";

export const RoleTypeFilter = memo(function RoleTypeFilter({
  column,
  personnelPerformance,
  filtersWithNoNetworkRequest,
}: {
  column: Column<any, unknown>;
  personnelPerformance: any;
  filtersWithNoNetworkRequest: any;
}) {
  // Check if personnel data is loading (needed for role type values)
  const isPersonnelDataLoading = !personnelPerformance?.result;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع سمت</span>
      {isPersonnelDataLoading ? (
        <TableFilterSkeleton />
      ) : (
        <SelectColumnFilterOptimized<PersonnelPerformanceData>
          initialFilters={
            filtersWithNoNetworkRequest?.filter?.RoleType ??
            getDefaultRoleTypesBaseOnContractType(
              filtersWithNoNetworkRequest?.filter?.ContractType ??
                (defualtContractTypes as string[]),
            )
          }
          column={column}
          values={personnelPerformance?.result ?? []}
        />
      )}
    </div>
  );
});
