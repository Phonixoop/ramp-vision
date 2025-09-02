"use client";
import { Column, ColumnDef, Header } from "@tanstack/react-table";
import {
  SelectColumnFilter,
  SelectColumnFilterOptimized,
  SelectControlled,
} from "~/features/checkbox-list";
import { City_Levels } from "~/constants";
import {
  commify,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
} from "~/utils/util";
import { getMonthNamesFromJOINED_date_strings } from "~/utils/personnel-performance";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import { sortDates } from "~/lib/utils";
import { PersonnelPerformanceData } from "../types";
import { memo, useEffect, useState } from "react";
import { usePersonnelPerformance } from "../context";
import { CityLevelTabs } from "../../../../../features/city-level-tab";
import { TableFilterSkeleton } from "./TableFilterSkeleton";
import { CityNameFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/cityName";
import { PersonnelFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/personnel";
import { ProjectTypeFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/projectType";
import { ContractTypeFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/contractType";
import { RoleFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/role";
import { RoleTypeFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/roleType";
import { DateInfoFilter } from "~/app/dashboard/personnel_performance/table/components/filter-components/dateInfo";
import { CustomColumnDef } from "~/types/table";

interface PersonnelPerformanceColumnsProps {
  personnelPerformance: any;
  initialFilters: any;
  filters: any;
  filtersWithNoNetworkRequest: any;
  setDataFilters: (filters: any) => void;
  setFiltersWithNoNetworkRequest: (filters: any) => void;
  reportPeriod: string;
  getLastDate: any;
}

export function PersonnelPerformanceColumns({
  personnelPerformance,
  initialFilters,
  filters,
  filtersWithNoNetworkRequest,
  setDataFilters,
  setFiltersWithNoNetworkRequest,
  reportPeriod,
  getLastDate,
}: PersonnelPerformanceColumnsProps): CustomColumnDef<
  PersonnelPerformanceData,
  string | number | null
>[] {
  return [
    {
      header: "ردیف",
      accessorKey: "Id",
      cell: ({ row }) => (
        <div className="w-full cursor-pointer rounded-full px-2 py-2 text-primary">
          {row.index + 1}
        </div>
      ),
    },
    {
      header: "استان",
      accessorKey: "CityName",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <CityNameFilter
          column={column}
          initialFilters={initialFilters}
          reportPeriod={reportPeriod}
          setDataFilters={setDataFilters}
        />
      ),
    },
    {
      header: "پرسنل",
      hSticky: true,
      width: 200,
      accessorKey: "NameFamily",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <PersonnelFilter
          column={column}
          personnelPerformance={personnelPerformance}
        />
      ),
    },
    {
      header: "نوع پروژه",
      hSticky: true,
      width: 200,
      accessorKey: "ProjectType",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <ProjectTypeFilter
          column={column}
          initialFilters={initialFilters}
          filters={filters}
          setDataFilters={setDataFilters}
        />
      ),
    },
    {
      header: "نوع قرارداد",
      hSticky: true,
      width: 200,
      accessorKey: "ContractType",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <ContractTypeFilter
          column={column}
          personnelPerformance={personnelPerformance}
          filtersWithNoNetworkRequest={filtersWithNoNetworkRequest}
          setFiltersWithNoNetworkRequest={setFiltersWithNoNetworkRequest}
        />
      ),
    },
    {
      header: "سمت",
      hSticky: true,
      width: 250,
      accessorKey: "Role",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <RoleFilter
          column={column}
          personnelPerformance={personnelPerformance}
        />
      ),
    },
    {
      header: "نوع سمت",
      enablePinning: true,
      hSticky: false,
      accessorKey: "RoleType",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <RoleTypeFilter
          column={column}
          personnelPerformance={personnelPerformance}
          filtersWithNoNetworkRequest={filtersWithNoNetworkRequest}
        />
      ),
    },
    // Performance columns
    {
      header: "عملکرد کلی",
      accessorKey: "TotalPerformance",
      cell: ({ row }) => (
        <span>{row.original.TotalPerformance?.toFixed(2) ?? "0.00"}</span>
      ),
      footer: ({ table }) =>
        commify(
          Math.round(
            table
              .getFilteredRowModel()
              .rows.reduce(
                (total, row) =>
                  total + (row.getValue("TotalPerformance") as number) || 0,
                0,
              ),
          ),
        ),
    },
    {
      header: "عملکرد مستقیم",
      accessorKey: "DirectPerFormance",
      cell: ({ row }) => (
        <span>{row.original.DirectPerFormance?.toFixed(2) ?? "0.00"}</span>
      ),
      footer: ({ table }) =>
        commify(
          Math.round(
            table
              .getFilteredRowModel()
              .rows.reduce(
                (total, row) =>
                  total + (row.getValue("DirectPerFormance") as number) || 0,
                0,
              ),
          ),
        ),
    },
    {
      header: "عملکرد غیر مستقیم",
      accessorKey: "InDirectPerFormance",
      cell: ({ row }) => (
        <span>{row.original.InDirectPerFormance?.toFixed(2) ?? "0.00"}</span>
      ),
      footer: ({ table }) =>
        commify(
          Math.round(
            table
              .getFilteredRowModel()
              .rows.reduce(
                (total, row) =>
                  total + (row.getValue("InDirectPerFormance") as number) || 0,
                0,
              ),
          ),
        ),
    },
    // Document processing columns
    {
      header: "ثبت اولیه اسناد",
      accessorKey: "SabtAvalieAsnad",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("SabtAvalieAsnad") as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "پذیرش و ثبت اولیه اسناد",
      accessorKey: "PazireshVaSabtAvalieAsnad",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("PazireshVaSabtAvalieAsnad") as number) ||
                0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی اسناد بیمارستانی مستقیم",
      accessorKey: "ArzyabiAsanadBimarsetaniDirect",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total +
                  (row.getValue("ArzyabiAsanadBimarsetaniDirect") as number) ||
                0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی اسناد بیمارستانی غیر مستقیم",
      accessorKey: "ArzyabiAsnadBimarestaniIndirect",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total +
                  (row.getValue("ArzyabiAsnadBimarestaniIndirect") as number) ||
                0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی اسناد دندان و پارا مستقیم",
      accessorKey: "ArzyabiAsnadDandanVaParaDirect",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total +
                  (row.getValue("ArzyabiAsnadDandanVaParaDirect") as number) ||
                0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی اسناد دندان و پارا غیر مستقیم",
      accessorKey: "ArzyabiAsnadDandanVaParaIndirect",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total +
                  (row.getValue(
                    "ArzyabiAsnadDandanVaParaIndirect",
                  ) as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی اسناد دارو مستقیم",
      accessorKey: "ArzyabiAsnadDaroDirect",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("ArzyabiAsnadDaroDirect") as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی اسناد دارو غیر مستقیم",
      accessorKey: "ArzyabiAsnadDaroIndirect",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("ArzyabiAsnadDaroIndirect") as number) ||
                0,
              0,
            ),
        ),
    },
    {
      header: "ثبت ارزیابی با اسکن مدارک",
      accessorKey: "WithScanCount",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("WithScanCount") as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
      accessorKey: "WithoutScanInDirectCount",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("WithoutScanInDirectCount") as number) ||
                0,
              0,
            ),
        ),
    },
    {
      header: "ثبت ارزیابی بدون اسکن مدارک",
      accessorKey: "WithoutScanCount",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("WithoutScanCount") as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "بایگانی مستقیم",
      accessorKey: "ArchiveDirectCount",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("ArchiveDirectCount") as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "بایگانی غیر مستقیم",
      accessorKey: "ArchiveInDirectCount",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("ArchiveInDirectCount") as number) || 0,
              0,
            ),
        ),
    },
    {
      header: "ارزیابی ویزیت",
      accessorKey: "ArzyabiVisitDirectCount",
      footer: ({ table }) =>
        commify(
          table
            .getFilteredRowModel()
            .rows.reduce(
              (total, row) =>
                total + (row.getValue("ArzyabiVisitDirectCount") as number) ||
                0,
              0,
            ),
        ),
    },
    // Date columns
    {
      header: "بازه گزارش",
      accessorKey: "Start_Date",
      filterFn: "arrIncludesSome",
      cell: ({ row }) => {
        if (personnelPerformance?.periodType === "هفتگی") {
          return (
            <span>
              {getMonthNamesFromJOINED_date_strings(
                filters?.filter?.Start_Date?.join(",") ?? "",
                personnelPerformance.periodType,
              )}
            </span>
          );
        }

        if (personnelPerformance?.periodType === "ماهانه") {
          return (
            <span>
              {getMonthNamesFromJOINED_date_strings(
                row.original.Start_Date ?? "",
                personnelPerformance.periodType,
              )}
            </span>
          );
        }

        if (personnelPerformance?.periodType === "روزانه") {
          return <span>{filters?.filter?.Start_Date?.join(",") ?? ""}</span>;
        }

        return null;
      },
    },
    {
      header: "تاریخ گزارش پرسنل",
      accessorKey: "DateInfo",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <DateInfoFilter
          column={column}
          initialFilters={initialFilters}
          filters={filters}
          personnelPerformance={personnelPerformance}
          setDataFilters={setDataFilters}
        />
      ),
    },
  ];
}
