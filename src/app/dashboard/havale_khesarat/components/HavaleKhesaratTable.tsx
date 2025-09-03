"use client";

import { useMemo, useDeferredValue } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import { City_Levels } from "~/constants";
import { SelectControlled } from "~/features/checkbox-list";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { InPageMenu } from "~/features/menu";
import Table from "~/features/table";
import { arrIncludeExcat, en, getEnglishToPersianCity } from "~/utils/util";
import { api } from "~/trpc/react";
import { useHavaleKhesarat } from "../context";
import { HavaleKhesaratTableProps } from "../types";

import { CustomColumnDef } from "~/types/table";
import { CityNameFilter } from "~/app/dashboard/havale_khesarat/components/filter-components/cityLevel";

export function HavaleKhesaratTable({ sessionData }: HavaleKhesaratTableProps) {
  const { filters, setDataFilters, reportPeriod, setReportPeriod } =
    useHavaleKhesarat();
  const deferredFilter = useDeferredValue(filters);

  const havaleKhesarat = api.havaleKhesarat.getAll.useQuery(deferredFilter, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });

  const initialFilters = api.havaleKhesarat.getInitialCities.useQuery(
    undefined,
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );

  const columns = useMemo<CustomColumnDef<any, string | number | null>[]>(
    () => [
      {
        header: "ردیف",
        accessorKey: "Id",
        accessorFn: (row) => row.Id,
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
        accessorFn: (row) => row.CityName,
        filterFn: arrIncludeExcat,
        Filter: ({ column }) => {
          return (
            <CityNameFilter
              cityNames={
                initialFilters.data?.Cities.map((city) => city.CityName).filter(
                  (city) => city,
                ) ?? []
              }
              column={column}
              setDataFilters={setDataFilters}
            />
          );
        },
      },
      {
        header: "نوع فعالیت",
        accessorKey: "ServiceName",
        accessorFn: (row) => row.ServiceName,
        filterFn: arrIncludeExcat,
        Filter: ({ column }) => {
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع فعالیت</span>
              <SelectControlled
                withSelectAll
                list={
                  Array.from(
                    new Set(
                      havaleKhesarat.data?.map((item) => item.ServiceName) ??
                        [],
                    ),
                  ).filter(Boolean) as string[]
                }
                value={(column.getFilterValue() as string[]) ?? []}
                onChange={(selectedValues) => {
                  column.setFilterValue(selectedValues);
                  setDataFilters((prev: any) => ({
                    ...prev,
                    filter: {
                      ...prev.filter,
                      ServiceName: selectedValues,
                    },
                  }));
                }}
              />
            </div>
          );
        },
      },
      {
        header: "نوع حواله",
        accessorKey: "HavaleType",
        accessorFn: (row) => row.HavaleType,
        filterFn: arrIncludeExcat,
        Filter: ({ column }) => {
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">نوع حواله</span>
              <SelectControlled
                withSelectAll
                list={
                  Array.from(
                    new Set(
                      havaleKhesarat.data?.map((item) => item.HavaleType) ?? [],
                    ),
                  ).filter(Boolean) as string[]
                }
                value={(column.getFilterValue() as string[]) ?? []}
                onChange={(selectedValues) => {
                  column.setFilterValue(selectedValues);
                  setDataFilters((prev: any) => ({
                    ...prev,
                    filter: {
                      ...prev.filter,
                      HavaleType: selectedValues,
                    },
                  }));
                }}
              />
            </div>
          );
        },
      },
      {
        header: "صدور شده",
        accessorKey: "SodorShode",
        accessorFn: (row) => row.SodorShode,
      },
      {
        header: "ابطال شده",
        accessorKey: "EbtalShode",
        accessorFn: (row) => row.EbtalShode,
      },
      {
        header: "صادر شده",
        accessorKey: "SaderShode",
        accessorFn: (row) => row.SaderShode,
      },
      {
        header: "درصد عودتی",
        accessorKey: "OdatPercentage",
        accessorFn: (row) => row.OdatPercentage,
        cell: ({ row }) => {
          return (
            <div className="w-full cursor-pointer rounded-full px-2 py-2 text-primary">
              {row.original.OdatPercentage.toFixed(2)}%
            </div>
          );
        },
      },
      {
        header: "درصد انحراف",
        accessorKey: "DeviationPercentage",
        accessorFn: (row) => row.DeviationPercentage,
        cell: ({ row }) => {
          return (
            <div className="w-full cursor-pointer rounded-full px-2 py-2 text-primary">
              {row.original.DeviationPercentage.toFixed(2)}%
            </div>
          );
        },
      },
      {
        header: "تاریخ شروع",
        accessorKey: "Start_Date",
        accessorFn: (row) => row.Start_Date,
      },
      {
        header: "تاریخ پایان",
        accessorKey: "End_Date",
        accessorFn: (row) => row.End_Date,
      },
      {
        header: "مبلغ حواله",
        accessorKey: "HavaleAmount",
        accessorFn: (row) => row.HavaleAmount,
        cell: ({ row }) => {
          const amount = parseFloat(row.original.HavaleAmount);
          return (
            <div className="text-right font-medium">
              {amount.toLocaleString("fa-IR")} ریال
            </div>
          );
        },
      },
      {
        header: "مبلغ خسارت",
        accessorKey: "KhesaratAmount",
        accessorFn: (row) => row.KhesaratAmount,
        cell: ({ row }) => {
          const amount = parseFloat(row.original.KhesaratAmount);
          return (
            <div className="text-right font-medium text-red-600">
              {amount.toLocaleString("fa-IR")} ریال
            </div>
          );
        },
      },
      {
        header: "درصد خسارت",
        accessorKey: "KhesaratPercentage",
        accessorFn: (row) => row.KhesaratPercentage,
        cell: ({ row }) => {
          const percentage = parseFloat(row.original.KhesaratPercentage);
          return (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium">
                {percentage.toFixed(2)}%
              </span>
              <div
                className={`h-2 w-16 rounded-full ${
                  percentage <= 5
                    ? "bg-green-500"
                    : percentage <= 15
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          );
        },
      },
    ],
    [
      filters.filter.CityName,
      setDataFilters,
      initialFilters.data?.Cities,
      havaleKhesarat.data,
    ],
  );

  return (
    <div dir="rtl" className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between gap-4 rounded-xl  p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">
            گزارش حواله و خسارت
          </h1>
          <CalendarButton
            onSelect={(data) => {
              setReportPeriod(
                data.reportPeriod === "daily"
                  ? "روزانه"
                  : data.reportPeriod === "weekly"
                  ? "هفتگی"
                  : "ماهانه",
              );
              setDataFilters((prev) => ({
                ...prev,
                periodType:
                  data.reportPeriod === "daily"
                    ? "روزانه"
                    : data.reportPeriod === "weekly"
                    ? "هفتگی"
                    : "ماهانه",
                filter: { ...prev.filter, Start_Date: data.selectedDates },
              }));
            }}
            selectedDates={filters.filter.Start_Date}
            periodType={
              reportPeriod === "روزانه"
                ? "daily"
                : reportPeriod === "هفتگی"
                ? "weekly"
                : "monthly"
            }
            buttonText={reportPeriod}
          />
        </div>
      </div>

      <div className="rounded-xl  p-4 shadow-sm">
        <Table
          data={havaleKhesarat.data || []}
          columns={columns}
          isLoading={havaleKhesarat.isLoading}
          renderInFilterView={() => <></>}
        />
      </div>
    </div>
  );
}
