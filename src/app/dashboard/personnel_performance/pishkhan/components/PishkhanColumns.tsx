"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SelectColumnFilter } from "~/features/checkbox-list";
import { InPageMenu } from "~/features/menu";
import { LayoutGroup } from "framer-motion";
import { City_Levels } from "~/constants";
import { getPersianToEnglishCity, getEnglishToPersianCity } from "~/utils/util";
import { arrIncludeExcat, commify } from "~/utils/util";
import { PishkhanData } from "../types";

export type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  Filter?: (props: { column: any }) => JSX.Element | null;
  hSticky?: boolean;
  accessorKey?: string;
  width?: number;
};

export function PishkhanColumns({
  personnelPerformance,
  initialFilters,
  filters,
  setFilters,
  reportPeriod,
}: {
  personnelPerformance: any;
  initialFilters: any;
  filters: any;
  setFilters: any;
  reportPeriod: string;
}): CustomColumnDef<PishkhanData, string | number | null>[] {
  const columns = useMemo<
    CustomColumnDef<PishkhanData, string | number | null>[]
  >(
    () => [
      {
        header: "ردیف",
        accessorKey: "Id",
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
        filterFn: arrIncludeExcat,
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">استان</span>
              <LayoutGroup id="CityLevelMenu">
                <InPageMenu
                  list={City_Levels.map((a) => a.name)}
                  startIndex={-1}
                  onChange={(value) => {
                    const { setFilterValue } = column;
                    const cities = City_Levels.find(
                      (a) => a.name === value.item.name,
                    )?.cities;

                    if (!cities) return;

                    // Because our system is permission based we need to show only allowed cities.
                    const canFilterCities = cities
                      .filter(
                        (city) =>
                          initialFilters?.data?.Cities?.map((initCity: any) =>
                            getPersianToEnglishCity(initCity.CityName),
                          ).includes(city),
                      )
                      .map((cityName) => getEnglishToPersianCity(cityName));

                    if (cities.length <= 0) {
                      setFilterValue(
                        initialFilters?.data?.Cities?.map(
                          (a: any) => a.CityName,
                        ) || [],
                      );
                    } else {
                      setFilterValue(canFilterCities);
                    }

                    setFilters((prev: any) => ({
                      ...prev,
                      filter: {
                        CityName: canFilterCities.map(getPersianToEnglishCity),
                        Start_Date: prev.filter.Start_Date,
                      },
                    }));
                  }}
                />
              </LayoutGroup>

              <SelectColumnFilter
                column={column}
                data={initialFilters?.data?.Cities}
                onChange={(filter) => {
                  setFilters((prev: any) => ({
                    ...prev,
                    filter: {
                      ...prev.filter,
                      CityName: filter.values.map(getPersianToEnglishCity),
                      Start_Date: prev.filter.Start_Date,
                    },
                  }));
                }}
              />
            </div>
          );
        },
      },
      {
        header: "کاربر ایجاد کننده",
        hSticky: true,
        width: 200,
        accessorKey: "NameFamily",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">کاربر ایجاد کننده</span>
              <SelectColumnFilter
                column={column}
                data={personnelPerformance?.data?.result}
                onChange={() => {
                  // Local filtering only
                }}
              />
            </div>
          );
        },
      },
      {
        header: "عملکرد کلی",
        accessorKey: "TotalPerformance",
        cell: ({ row }) => (
          <span>{row.original.TotalPerformance.toFixed(2)}</span>
        ),
        footer: ({ table }) =>
          commify(
            Math.round(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("TotalPerformance") as number),
                  0,
                ),
            ),
          ),
      },
      {
        header: "نام شهر",
        enablePinning: true,
        hSticky: false,
        accessorKey: "TownName",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نام شهر</span>
              <SelectColumnFilter
                column={column}
                data={personnelPerformance?.data?.result}
                onChange={() => {
                  // Local filtering only
                }}
              />
            </div>
          );
        },
      },
      {
        header: "نام شعبه",
        enablePinning: true,
        hSticky: false,
        accessorKey: "BranchName",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نام شعبه</span>
              <SelectColumnFilter
                column={column}
                data={personnelPerformance?.data?.result}
                onChange={() => {
                  // Local filtering only
                }}
              />
            </div>
          );
        },
      },
      {
        header: "کد شعبه",
        enablePinning: true,
        hSticky: false,
        accessorKey: "BranchCode",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">کد شعبه</span>
              <SelectColumnFilter
                column={column}
                data={personnelPerformance?.data?.result}
                onChange={() => {
                  // Local filtering only
                }}
              />
            </div>
          );
        },
      },
      {
        header: "نوع شعبه",
        enablePinning: true,
        hSticky: false,
        accessorKey: "BranchType",
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع شعبه</span>
              <SelectColumnFilter
                column={column}
                data={personnelPerformance?.data?.result}
                onChange={() => {
                  // Local filtering only
                }}
              />
            </div>
          );
        },
      },
    ],
    [
      personnelPerformance?.data,
      initialFilters?.data,
      filters,
      setFilters,
      reportPeriod,
    ],
  );

  return columns;
}
