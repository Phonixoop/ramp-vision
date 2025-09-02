"use client";

import { useMemo } from "react";
import { ColumnDef, Column } from "@tanstack/react-table";
import {
  SelectColumnFilter,
  SelectColumnFilterOptimized,
} from "~/features/checkbox-list";
import { getPersianToEnglishCity } from "~/utils/util";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import { sortDates } from "~/lib/utils";

import { PersonnelsData } from "../types";
import { CityNameFilterPersonnel } from "~/app/dashboard/personnels/components/filter-components/cityName";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";

// Extend ColumnDef to include custom properties used by the table component
export type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  Filter?: (props: {
    column: Column<TData, string | number | null>;
  }) => JSX.Element | null;
  hSticky?: boolean;
  accessorKey?: string;
  width?: number;
};

export function PersonnelsColumns({
  getPersonnls,

  filters,
  setFilters,
  filtersWithNoNetworkRequest,
  setFiltersWithNoNetworkRequest,
  cityNames,
}: {
  getPersonnls: any;
  filters: any;
  setFilters: any;
  filtersWithNoNetworkRequest: any;
  setFiltersWithNoNetworkRequest: any;
  cityNames: string[];
}): CustomColumnDef<PersonnelsData, string | number | null>[] {
  const columns = useMemo<
    CustomColumnDef<PersonnelsData, string | number | null>[]
  >(() => {
    return [
      {
        header: "ردیف",
        accessorFn: (row, index) => index + 1,
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
          <CityNameFilterPersonnel
            cityNames={cityNames}
            column={column}
            setFilters={setFilters}
          />
        ),
      },
      {
        header: "نام",
        accessorKey: "NameFamily",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">پرسنل</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
              />
            </div>
          );
        },
      },
      {
        header: "کد ملی",
        accessorKey: "NationalCode",
        filterFn: "arrIncludesSome",
      },
      {
        header: "نوع پروژه",
        accessorKey: "ProjectType",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع پروژه</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
                initialFilters={defaultProjectTypes}
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
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">سمت</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
                initialFilters={defualtRoles}
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
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع قرارداد</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
                initialFilters={defualtContractTypes}
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
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع سمت</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
                initialFilters={filtersWithNoNetworkRequest?.filter?.RoleType}
              />
            </div>
          );
        },
      },
      {
        header: "تاریخ گزارش پرسنل",
        accessorKey: "DateInfo",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          const _DateInfos = [
            ...new Set(getPersonnls?.data?.map((a: any) => a.DateInfo)),
          ];

          const DateInfos = sortDates({ dates: _DateInfos });

          if (DateInfos.length <= 0) return null;
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">تاریخ گزارش پرسنل</span>
              <SelectColumnFilterOptimized
                column={column}
                values={getPersonnls.data || []}
                initialFilters={[DateInfos[DateInfos.length - 1] ?? ""]}
                singleSelect
              />
            </div>
          );
        },
      },
    ];
  }, [getPersonnls.data, setFilters, cityNames]);

  return columns;
}
