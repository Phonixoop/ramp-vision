"use client";
import { Column, ColumnDef, Header } from "@tanstack/react-table";
import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
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
import { useEffect, useState } from "react";
import { usePersonnelPerformance } from "../context";
import { CityLevelTabs } from "./CityLevelTabs";
import { TableFilterSkeleton } from "./TableFilterSkeleton";

// Extend ColumnDef to include custom properties used by the table component
export type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  Filter?: (
    header: Header<TData, string | number | null>,
  ) => JSX.Element | null;
  hSticky?: boolean;
  accessorKey?: string;
  width?: number;
};

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
      Filter: ({ column }) => {
        // Track selected city values for tabs integration
        const [selectedCityValues, setSelectedCityValues] = useState<string[]>(
          [],
        );

        // Update column filter when selectedCityValues changes
        useEffect(() => {
          const { setFilterValue } = column as Column<any>;
          if (selectedCityValues.length === 0) {
            setFilterValue(undefined);
          } else {
            setFilterValue(selectedCityValues);
          }
        }, [selectedCityValues, column]);

        // Check if initial filters are loading
        const isCityNamesLoading = !initialFilters?.CityNames;

        return (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">استان</span>
            {isCityNamesLoading ? (
              <TableFilterSkeleton />
            ) : (
              <>
                {reportPeriod !== "ماهانه" && (
                  <CityLevelTabs
                    initialCities={initialFilters?.CityNames ?? []}
                    column={column}
                    onChange={(data) => {
                      console.log({ dataTabs: data });
                      setSelectedCityValues(data.values);

                      setDataFilters((prev: any) => ({
                        ...prev,
                        filter: {
                          ...prev.filter,
                          CityName: data.values.map(getPersianToEnglishCity),
                          Start_Date: prev.filter?.Start_Date ?? [],
                        },
                      }));
                    }}
                  />
                )}

                <SelectColumnFilterOptimized<
                  Pick<PersonnelPerformanceData, "CityName">
                >
                  singleSelect={reportPeriod === "ماهانه"}
                  column={column}
                  values={
                    initialFilters?.CityNames?.map((a: any) => ({
                      CityName: a,
                    })) ?? []
                  }
                  initialFilters={
                    initialFilters?.CityNames?.map((a: any) => ({
                      CityName: a,
                    })) ?? []
                  }
                  onChange={(data) => {
                    setSelectedCityValues(data.values);

                    setDataFilters((prev: any) => ({
                      ...prev,
                      filter: {
                        ...prev.filter,
                        CityName: data.values.map(getPersianToEnglishCity),
                        Start_Date: prev.filter?.Start_Date ?? [],
                      },
                    }));
                  }}
                />
              </>
            )}
          </div>
        );
      },
    },
    {
      header: "پرسنل",
      hSticky: true,
      width: 200,
      accessorKey: "NameFamily",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => {
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
                onChange={(filter) => {
                  // Personnel filter logic can be added here if needed
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      header: "نوع پروژه",
      hSticky: true,
      width: 200,
      accessorKey: "ProjectType",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => {
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
                initialFilters={
                  filters?.filter?.ProjectType ?? defaultProjectTypes
                }
                column={column}
                values={(initialFilters?.ProjectTypes ?? []).map(
                  (a: string) => ({
                    ProjectType: a,
                  }),
                )}
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
      },
    },
    {
      header: "نوع قرارداد",
      hSticky: true,
      width: 200,
      accessorKey: "ContractType",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => {
        // Check if personnel data is loading (needed for contract type values)
        const isPersonnelDataLoading = !personnelPerformance?.result;

        return (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">نوع قرارداد</span>
            {isPersonnelDataLoading ? (
              <TableFilterSkeleton />
            ) : (
              <SelectColumnFilterOptimized<
                Pick<PersonnelPerformanceData, "ContractType">
              >
                initialFilters={
                  filtersWithNoNetworkRequest?.filter?.ContractType ??
                  defualtContractTypes
                }
                column={column}
                values={personnelPerformance?.result ?? []}
                onChange={(filter) => {
                  setFiltersWithNoNetworkRequest((prev: any) => ({
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
      },
    },
    {
      header: "سمت",
      hSticky: true,
      width: 250,
      accessorKey: "Role",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => {
        // Check if personnel data is loading (needed for role values)
        const isPersonnelDataLoading = !personnelPerformance?.result;

        return (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">سمت</span>
            {isPersonnelDataLoading ? (
              <TableFilterSkeleton />
            ) : (
              <SelectColumnFilterOptimized<
                Pick<PersonnelPerformanceData, "Role">
              >
                initialFilters={defualtRoles}
                column={column}
                values={personnelPerformance?.result ?? []}
                onChange={(filter) => {
                  // Role filter logic can be added here if needed
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      header: "نوع سمت",
      enablePinning: true,
      hSticky: false,
      accessorKey: "RoleType",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => {
        // Check if personnel data is loading (needed for role type values)
        const isPersonnelDataLoading = !personnelPerformance?.result;

        return (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">نوع سمت</span>
            {isPersonnelDataLoading ? (
              <TableFilterSkeleton />
            ) : (
              <SelectColumnFilterOptimized<PersonnelPerformanceData>
                initialFilters={getDefaultRoleTypesBaseOnContractType(
                  filtersWithNoNetworkRequest?.filter?.ContractType ??
                    defualtContractTypes,
                )}
                column={column}
                values={personnelPerformance?.result ?? []}
              />
            )}
          </div>
        );
      },
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
      Filter: ({ column }) => {
        if (!initialFilters?.DateInfos) return null;

        const _DateInfos: string[] = initialFilters.DateInfos.map(
          (a: any) => a.DateInfo,
        );
        const DateInfos = sortDates({ dates: _DateInfos });

        if (DateInfos.length <= 0) return null;

        const initialDateInfo: string[] =
          filters?.filter?.DateInfo ??
          (DateInfos.length > 0 ? [DateInfos.at(-1)!] : []);

        return (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">تاریخ گزارش پرسنل</span>
            <SelectColumnFilterOptimized<
              Pick<PersonnelPerformanceData, "DateInfo">
            >
              singleSelect
              column={column}
              initialFilters={initialDateInfo}
              values={DateInfos.map((a: string) => ({ DateInfo: a }))}
              onChange={(filter) => {
                setDataFilters((prev: any) => ({
                  ...prev,
                  filter: {
                    ...prev.filter,
                    [filter.id]: filter.values.filter((a: string) => a),
                  },
                }));
              }}
            />
          </div>
        );
      },
    },
  ];
}
