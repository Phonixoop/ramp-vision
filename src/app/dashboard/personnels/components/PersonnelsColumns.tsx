"use client";

import { useMemo } from "react";
import { ColumnDef, Column } from "@tanstack/react-table";
import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import { PersonnelsData } from "../types";
import { CityNameFilterPersonnel } from "~/app/dashboard/personnels/components/filter-components/cityName";
import { DateInfoFilterPersonnel } from "~/app/dashboard/personnels/components/filter-components/dateInfo";

// Extend ColumnDef to include custom properties used by the table component
export type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  Filter?: (props: {
    column: Column<TData, string | number | null>;
  }) => React.JSX.Element | null;
  hSticky?: boolean;
  accessorKey?: string;
  width?: number;
};

export function PersonnelsColumns({
  getPersonnls,
  usersInfo,
  filters,
  setFilters,
  filtersWithNoNetworkRequest,
  setFiltersWithNoNetworkRequest,
  cityNames,
  dateInfos,
}: {
  getPersonnls: any;
  usersInfo: Array<{
    Role?: string | null;
    RoleType?: string | null;
    ContractType?: string | null;
    ProjectType?: string | null;
    DateInfo?: string | null;
  }>;
  filters: any;
  setFilters: any;
  filtersWithNoNetworkRequest: any;
  setFiltersWithNoNetworkRequest: any;
  cityNames: string[];
  dateInfos: string[];
}): CustomColumnDef<PersonnelsData, string | number | null>[] {
  const columns = useMemo<
    CustomColumnDef<PersonnelsData, string | number | null>[]
  >(() => {
    const syncNetworkFilter = (id: string, values: string[]) => {
      setFilters((prev: any) => ({
        ...prev,
        filter: {
          ...prev.filter,
          [id]: values,
        },
      }));
      setFiltersWithNoNetworkRequest?.((prev: any) => ({
        ...prev,
        filter: {
          ...prev.filter,
          [id]: values,
        },
      }));
    };

    return [
      {
        header: "ردیف",
        accessorFn: (row, index) => index + 1,
        enableGlobalFilter: false,
        cell: ({ row }) => {
          return (
            <div className="w-full cursor-pointer rounded-full px-2 py-2 text-primary">
              {row.index + 1}
            </div>
          );
        },
      },
      {
        header: "استان",
        accessorKey: "CityName",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => (
          <CityNameFilterPersonnel cityNames={cityNames} column={column} />
        ),
      },
      {
        header: "نام",
        accessorKey: "NameFamily",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">پرسنل</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
                initialFilters={[]}
              />
            </div>
          );
        },
      },
      {
        header: "کد ملی",
        accessorKey: "NationalCode",
        accessorFn: (row) => String(row.NationalCode ?? ""),
        filterFn: "arrIncludesSome",
      },
      {
        header: "نوع پروژه",
        accessorKey: "ProjectType",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع پروژه</span>
              <SelectColumnFilterOptimized
                column={column}
                values={usersInfo}
                initialFilters={
                  filters?.filter?.ProjectType ?? defaultProjectTypes
                }
                onChange={(filter) =>
                  syncNetworkFilter(filter.id, filter.values)
                }
              />
            </div>
          );
        },
      },
      {
        header: "سمت",
        accessorKey: "Role",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">سمت</span>
              <SelectColumnFilterOptimized
                column={column}
                values={usersInfo}
                initialFilters={filters?.filter?.Role ?? defualtRoles}
                onChange={(filter) =>
                  syncNetworkFilter(filter.id, filter.values)
                }
              />
            </div>
          );
        },
      },
      {
        header: "نوع قرارداد",
        accessorKey: "ContractType",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع قرارداد</span>
              <SelectColumnFilterOptimized
                column={column}
                values={usersInfo}
                initialFilters={
                  filtersWithNoNetworkRequest?.filter?.ContractType ??
                  filters?.filter?.ContractType ??
                  defualtContractTypes
                }
                onChange={(filter) =>
                  syncNetworkFilter(filter.id, filter.values)
                }
              />
            </div>
          );
        },
      },
      {
        header: "نوع سمت",
        accessorKey: "RoleType",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع سمت</span>
              <SelectColumnFilterOptimized
                column={column}
                values={usersInfo}
                initialFilters={
                  filtersWithNoNetworkRequest?.filter?.RoleType ??
                  filters?.filter?.RoleType ??
                  []
                }
                onChange={(filter) =>
                  syncNetworkFilter(filter.id, filter.values)
                }
              />
            </div>
          );
        },
      },
      {
        header: "تاریخ گزارش پرسنل",
        accessorKey: "DateInfo",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => (
          <DateInfoFilterPersonnel
            column={column}
            dateInfos={dateInfos}
            filters={filters}
            setFilters={setFilters}
          />
        ),
      },
    ];
  }, [
    getPersonnls.data,
    usersInfo,
    setFilters,
    setFiltersWithNoNetworkRequest,
    cityNames,
    dateInfos,
    filters?.filter?.DateInfo,
    filters?.filter?.ProjectType?.join(","),
    filters?.filter?.Role?.join(","),
    filters?.filter?.ContractType?.join(","),
    filters?.filter?.RoleType?.join(","),
    filtersWithNoNetworkRequest?.filter?.ContractType?.join(","),
    filtersWithNoNetworkRequest?.filter?.RoleType?.join(","),
  ]);

  return columns;
}
