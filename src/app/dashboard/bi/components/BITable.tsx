"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Table from "~/features/table";
import { api } from "~/trpc/react";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { arrIncludeExcat } from "~/utils/util";
import { SelectColumnFilter } from "~/features/checkbox-list";
import { useBI } from "../context";
import { BITableProps } from "../types";
import { CustomColumnDef } from "~/types/table";

export function BITable({ sessionData }: BITableProps) {
  const { filters, setDataFilters, reportPeriod, setReportPeriod } = useBI();

  const { data, isLoading } = api.bi.getReports.useQuery(
    {
      filter: {
        DateFa: filters.filter.DateFa,
      },
      periodType: filters.periodType,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const columns = useMemo<CustomColumnDef<any, string | number | null>[]>(
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
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">استان</span>
              <SelectColumnFilter column={column} data={data?.result} />
            </div>
          );
        },
      },
      { header: "تاریخ فارسی", accessorKey: "DateFa" },
      { header: "تاریخ میلادی", accessorKey: "DateEn" },
      {
        header: "عمل به تعهدات 5 روزه",
        accessorKey: "CommitmentFivePercentage",
        cell: ({ row }) =>
          parseFloat(row.original.CommitmentFivePercentage).toFixed(4),
      },
      {
        header: "عمل به تعهدات 10 روزه",
        accessorKey: "CommitmentTenPercentage",
        cell: ({ row }) =>
          parseFloat(row.original.CommitmentTenPercentage).toFixed(4),
      },
      {
        header: "عمل به تعهدات 15 روزه",
        accessorKey: "CommitmentFifteenPercentage",
        cell: ({ row }) =>
          parseFloat(row.original.CommitmentFifteenPercentage).toFixed(4),
      },
      {
        header: "عمل به تعهدات 20 روزه",
        accessorKey: "CommitmentTwentyPercentage",
        cell: ({ row }) =>
          parseFloat(row.original.CommitmentTwentyPercentage).toFixed(4),
      },
      {
        header: "عمل به تعهدات 25 روزه",
        accessorKey: "CommitmentTwentyFivePercentage",
        cell: ({ row }) =>
          parseFloat(row.original.CommitmentTwentyFivePercentage).toFixed(4),
      },
      {
        header: "عمل به تعهدات 30 روزه",
        accessorKey: "CommitmentThirtyPercentage",
        cell: ({ row }) =>
          parseFloat(row.original.CommitmentThirtyPercentage).toFixed(4),
      },
    ],
    [data?.result],
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between gap-4 rounded-xl  p-4 shadow-sm">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-primary">
            گزارش BI
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
                filter: { ...prev.filter, DateFa: data.selectedDates },
              }));
            }}
            selectedDates={filters.filter.DateFa}
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

      <div dir="rtl" className="rounded-xl  p-4 shadow-sm">
        <Table
          data={data?.result || []}
          columns={columns}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
