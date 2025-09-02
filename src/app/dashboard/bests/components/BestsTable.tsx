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
import { CityLevelTabs } from "~/features/city-level-tab";
import { CityNameFilter } from "~/app/dashboard/bests/components/filter-components/cityName";
import {
  SelectColumnFilter,
  SelectColumnFilterOptimized,
} from "~/features/checkbox-list";

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
            <CityNameFilter
              cityNames={getInitialCities.data?.Cities ?? []}
              column={column}
              setDataFilters={setDataFilters}
            />
          );
        },
      },
      {
        header: "نام خانوادگی",
        accessorKey: "NameFamily",
      },
      {
        header: "درصد عملکرد",
        accessorKey: "TotalPerformance",
        cell: ({ row }) => (
          <span>{Number(row.original.TotalPerformance).toFixed(2)}</span>
        ),
      },
      {
        header: "عملکرد",
        accessorKey: "PerformanceText",
        filterFn: arrIncludeExcat,
        cell: ({ row }) => {
          return (
            <>
              <span
                style={{
                  color:
                    performanceLevels.find(
                      (a) => a.text === row.original.PerformanceText,
                    )?.color || "inherit",
                }}
              >
                {row.original.PerformanceText}
              </span>
            </>
          );
        },
        Filter: ({ column }) => {
          return (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">عملکرد</span>
              <SelectColumnFilterOptimized
                column={column}
                values={data?.filter((item) => item)}
              />
            </div>
          );
        },
      },
      {
        header: "کد ملی",
        accessorKey: "NationalCode",
      },
      { header: "تاریخ شروع", accessorKey: "Start_Date" },
      { header: "تاریخ پایان", accessorKey: "End_Date" },
      {
        header: "عمل به تعهدات",
        accessorKey: "CommitmentPercentage",
        cell: ({ row }) => {
          const value = parseFloat(row.CommitmentPercentage);
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
          console.log({ row });
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
    [filters.filter.CityName, setDataFilters, data],
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between gap-4 rounded-xl  p-4 shadow-sm">
        <div className="flex w-8/12 flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-primary">بهترین کارکنان</h1>
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

      <div dir="rtl" className="rounded-xl p-4 shadow-sm">
        <Table
          data={data || []}
          columns={columns}
          isLoading={isLoading}
          renderInFilterView={() => <></>}
          // renderAfterFilterView={(flatRows) => {
          //   return (
          //     <>
          //       <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl bg-secbuttn p-5 xl:flex-row">
          //         <FileBarChart2Icon className="stroke-accent" />
          //         <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-sm  font-semibold text-emerald-900">
          //           <DownloadCloudIcon />
          //           <CSVLink
          //             filename="برترین ها.csv"
          //             headers={columns
          //               .map((item) => {
          //                 return {
          //                   label: item.header,
          //                   //@ts-ignore
          //                   key: item.accessorKey,
          //                 };
          //               })
          //               .filter((f) => f.key != "Id")}
          //             data={data ?? []}
          //           >
          //             دانلود دیتای کامل
          //           </CSVLink>
          //         </Button>
          //         <Button className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-sm font-semibold text-amber-900">
          //           <DownloadCloudIcon />
          //           <CSVLink
          //             filename="برترین ها (فیلتر شده).csv"
          //             headers={columns
          //               .map((item) => {
          //                 return {
          //                   label: item.header,
          //                   //@ts-ignore
          //                   key: item.accessorKey,
          //                 };
          //               })
          //               .filter((f) => f.key != "Id")}
          //             data={flatRows ?? []}
          //           >
          //             دانلود دیتای فیلتر شده
          //           </CSVLink>
          //         </Button>
          //       </div>
          //     </>
          //   );
          // }}
        />
      </div>
    </div>
  );
}
