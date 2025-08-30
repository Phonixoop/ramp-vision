"use client";
import { DownloadCloudIcon, FileBarChart2 } from "lucide-react";
import { CSVLink } from "react-csv";
import { ColumnDef } from "@tanstack/react-table";
import Button from "~/ui/buttons";
import { getMonthNamesFromJOINED_date_strings } from "~/utils/personnel-performance";

interface PersonnelPerformanceExportProps {
  flatRows: any[];
  columns: ColumnDef<any>[];
  personnelPerformance: any;
  filters: any;
  toggleDistinctData: "Distincted" | "Pure";
  distincedData: any[];
}

export function PersonnelPerformanceExport({
  flatRows,
  columns,
  personnelPerformance,
  filters,
  toggleDistinctData,
  distincedData,
}: PersonnelPerformanceExportProps) {
  if (!personnelPerformance?.result?.length) return null;

  const getFormattedStartDate = (row: any) => {
    if (personnelPerformance.periodType === "هفتگی") {
      return getMonthNamesFromJOINED_date_strings(
        filters.filter.Start_Date.join(","),
        personnelPerformance.periodType,
      );
    }

    if (personnelPerformance.periodType === "ماهانه") {
      return getMonthNamesFromJOINED_date_strings(
        row.Start_Date,
        personnelPerformance.periodType,
      );
    }

    if (personnelPerformance.periodType === "روزانه") {
      return filters.filter.Start_Date.join(",");
    }

    return "";
  };

  const csvHeaders = columns
    .map((item) => ({
      label: item.header,
      key: item.id,
    }))
    .filter((f) => f.key !== "Id");

  const completeData = (
    toggleDistinctData === "Distincted"
      ? distincedData
      : personnelPerformance.result
  ).map((row: any) => ({
    ...row,
    Start_Date: getFormattedStartDate(row),
  }));

  const filteredData = flatRows.map((row: any) => ({
    ...row,
    Start_Date: getFormattedStartDate(row),
  }));

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn p-5 xl:flex-row">
      <FileBarChart2 className="stroke-accent" />

      <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-sm font-semibold text-emerald-900">
        <DownloadCloudIcon />
        <CSVLink
          filename="جزئیات عملکرد پرسنل.csv"
          headers={csvHeaders}
          data={completeData}
        >
          دانلود دیتای کامل
        </CSVLink>
      </Button>

      <Button className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-sm font-semibold text-amber-900">
        <DownloadCloudIcon />
        <CSVLink
          filename="جزئیات عملکرد پرسنل (فیلتر شده).csv"
          headers={csvHeaders}
          data={filteredData}
        >
          دانلود دیتای فیلتر شده
        </CSVLink>
      </Button>
    </div>
  );
}
