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

  const columns = useMemo<ColumnDef<any>[]>(
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
        filterFn: "arrIncludesSome",
        Filter: ({ column }) => {
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">استان</span>
              <LayoutGroup id="CityLevelMenu">
                <InPageMenu
                  list={City_Levels.map((a) => a.name)}
                  selectedItems={filters.filter.CityName}
                  onSelectionChange={(selected) =>
                    setDataFilters((prev) => ({
                      ...prev,
                      filter: { ...prev.filter, CityName: selected },
                    }))
                  }
                />
              </LayoutGroup>
            </div>
          );
        },
      },
      { header: "تاریخ شروع", accessorKey: "Start_Date" },
      { header: "تاریخ پایان", accessorKey: "End_Date" },
      {
        header: "مبلغ حواله",
        accessorKey: "HavaleAmount",
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
    [filters.filter.CityName, setDataFilters],
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
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

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <Table
          data={havaleKhesarat.data || []}
          columns={columns}
          isLoading={havaleKhesarat.isLoading}
          className="w-full"
        />
      </div>
    </div>
  );
}
