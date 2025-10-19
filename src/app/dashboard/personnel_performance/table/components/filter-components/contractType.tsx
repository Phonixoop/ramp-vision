"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import { defualtContractTypes } from "~/constants/personnel-performance";

export const ContractTypeFilter = memo(function ContractTypeFilter({
  column,
  personnelPerformance,
  filtersWithNoNetworkRequest,
  setFiltersWithNoNetworkRequest,
}: {
  column: Column<any, unknown>;
  personnelPerformance: any;
  filtersWithNoNetworkRequest: any;
  setFiltersWithNoNetworkRequest: (f: any) => void;
}) {
  // Check if personnel data is loading (needed for contract type values)
  const isPersonnelDataLoading = !personnelPerformance?.result;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع قرارداد</span>
      {isPersonnelDataLoading ? (
        <TableFilterSkeleton />
      ) : (
        // <SelectColumnFilterOptimized<
        //   Pick<PersonnelPerformanceData, "ContractType">
        // >
        //   initialFilters={
        //     filtersWithNoNetworkRequest?.filter?.ContractType ??
        //     defualtContractTypes
        //   }
        //   column={column}
        //   values={personnelPerformance?.result ?? []}
        //   onChange={(filter) => {
        //     setFiltersWithNoNetworkRequest((prev: any) => ({
        //       ...prev,
        //       filter: {
        //         ...prev.filter,
        //         [filter.id]: filter.values,
        //       },
        //     }));
        //   }}
        // />
        <SelectColumnFilterOptimized<
          Pick<PersonnelPerformanceData, "ContractType">
        >
          initialFilters={defualtContractTypes}
          column={column}
          values={personnelPerformance?.result}
        />
      )}
    </div>
  );
});
