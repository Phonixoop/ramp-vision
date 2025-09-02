"use client";

import { useMemo } from "react";
import Table from "~/features/table";

import { api } from "~/trpc/react";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { arrIncludeExcat, en, getEnglishToPersianCity } from "~/utils/util";
import { City_Levels } from "~/constants";
import { InPageMenu } from "~/features/menu";
import { LayoutGroup } from "framer-motion";
import { performanceLevels } from "~/constants/personnel-performance";
import { CSVLink } from "react-csv";
import { DownloadCloudIcon } from "lucide-react";
import { FileBarChart2Icon } from "lucide-react";
import Button from "~/ui/buttons";
import { useBests } from "../context";
import { BestsTableProps } from "../types";

export function BestsTable({ sessionData }: BestsTableProps) {
  const { filters, setDataFilters, reportPeriod, setReportPeriod } = useBests();

  const getInitialCities =
    api.personnelPerformance.getInitialCitiesPublic.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data, isLoading } =
    api.personnelPerformance.getBestPersonnel.useQuery(
      {
        filter: {
          Start_Date: filters.filter.Start_Date,
        },
        periodType: filters.periodType,
      },
      {
        refetchOnWindowFocus: false,
      },
    );

  const columns = useMemo(
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
        header: "عمل به تعهدات",
        accessorKey: "CommitmentPercentage",
        cell: ({ row }) => {
          const value = parseFloat(row.original.CommitmentPercentage);
          return (
            <div className="flex w-full items-center justify-center gap-2">
              <span className="text-sm font-medium">{value.toFixed(2)}%</span>
              <div
                className={`h-2 w-16 rounded-full ${
                  value >= 90
                    ? "bg-green-500"
                    : value >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          );
        },
      },
      {
        header: "عملکرد",
        accessorKey: "Performance",
        cell: ({ row }) => {
          const value = parseFloat(row.original.Performance);
          return (
            <div className="flex w-full items-center justify-center gap-2">
              <span className="text-sm font-medium">{value.toFixed(2)}%</span>
              <div
                className={`h-2 w-16 rounded-full ${
                  value >= 90
                    ? "bg-green-500"
                    : value >= 70
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
          <h1 className="text-2xl font-bold text-primary">بهترین کارکنان</h1>
          <CalendarButton
            onSelect={(data) => {
              setReportPeriod(data.reportPeriod === "daily" ? "روزانه" : data.reportPeriod === "weekly" ? "هفتگی" : "ماهانه");
              setDataFilters((prev) => ({
                ...prev,
                periodType: data.reportPeriod === "daily" ? "روزانه" : data.reportPeriod === "weekly" ? "هفتگی" : "ماهانه",
                filter: { ...prev.filter, Start_Date: data.selectedDates },
              }));
            }}
            selectedDates={filters.filter.Start_Date}
            periodType={reportPeriod === "روزانه" ? "daily" : reportPeriod === "هفتگی" ? "weekly" : "monthly"}
            buttonText={reportPeriod}
          />
        </div>
        <div className="flex items-center gap-2">
          <CSVLink
            data={data || []}
            filename={`bests-${reportPeriod}-${new Date().toISOString()}.csv`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <DownloadCloudIcon className="h-4 w-4" />
            دانلود CSV
          </CSVLink>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <Table
          data={data || []}
          columns={columns}
          isLoading={isLoading}
          className="w-full"
        />
      </div>
    </div>
  );
}
