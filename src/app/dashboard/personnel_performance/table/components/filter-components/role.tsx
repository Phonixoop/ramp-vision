"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import { defualtRoles } from "~/constants/personnel-performance";

export const RoleFilter = memo(function RoleFilter({
  column,
  initialFilters,
  filtersWithNoNetworkRequest,
  setFiltersWithNoNetworkRequest,
  setDataFilters,
}: {
  column: Column<any, unknown>;
  initialFilters: any;
  filtersWithNoNetworkRequest?: any;
  setFiltersWithNoNetworkRequest?: (f: any) => void;
  setDataFilters?: (f: any) => void;
}) {
  // Same source as chart: full Role list from users_info, not the filtered result.
  const isUsersInfoLoading = !initialFilters?.usersInfo;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">سمت</span>

      {isUsersInfoLoading ? (
        <TableFilterSkeleton />
      ) : (
        <SelectColumnFilterOptimized<Pick<PersonnelPerformanceData, "Role">>
          initialFilters={
            filtersWithNoNetworkRequest?.filter?.Role ?? defualtRoles
          }
          column={column}
          values={initialFilters?.usersInfo ?? []}
          onChange={(filter) => {
            setFiltersWithNoNetworkRequest?.((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                Role: filter.values,
              },
            }));
            setDataFilters?.((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                Role: filter.values,
              },
            }));
          }}
        />
      )}
    </div>
  );
});
