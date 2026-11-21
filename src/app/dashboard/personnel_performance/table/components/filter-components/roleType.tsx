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
  initialFilters,
  filtersWithNoNetworkRequest,
  setFiltersWithNoNetworkRequest,
  setDataFilters,
}: {
  column: Column<any, unknown>;
  initialFilters: any;
  filtersWithNoNetworkRequest: any;
  setFiltersWithNoNetworkRequest?: (f: any) => void;
  setDataFilters?: (f: any) => void;
}) {
  // Same source as chart: full RoleType list from users_info.
  const isUsersInfoLoading = !initialFilters?.usersInfo;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع سمت</span>
      {isUsersInfoLoading ? (
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
          values={initialFilters?.usersInfo ?? []}
          onChange={(filter) => {
            setFiltersWithNoNetworkRequest?.((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                RoleType: filter.values,
              },
            }));
            setDataFilters?.((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                RoleType: filter.values,
              },
            }));
          }}
        />
      )}
    </div>
  );
});
