"use client";
import { DownloadCloudIcon, FileBarChart2 } from "lucide-react";
import { CSVLink } from "react-csv";
import { ColumnDef } from "@tanstack/react-table";
import Button from "~/ui/buttons";
import { getMonthNamesFromJOINED_date_strings } from "~/utils/personnel-performance";
import { CustomColumnDef } from "~/app/dashboard/personnel_performance/table/components/PersonnelPerformanceColumns";

interface PersonnelPerformanceExportProps {
  flatRows: any[];
  columns: CustomColumnDef<any, any>[];
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

  // Safety check for required data
  if (!personnelPerformance?.periodType || !filters?.filter) return null;

  const getFormattedStartDate = (row: any) => {
    if (personnelPerformance.periodType === "هفتگی") {
      const startDateArray = filters?.filter?.Start_Date;
      if (!startDateArray || !Array.isArray(startDateArray)) return "";
      return getMonthNamesFromJOINED_date_strings(
        startDateArray.join(","),
        personnelPerformance.periodType,
      );
    }

    if (personnelPerformance.periodType === "ماهانه") {
      const startDate = row?.Start_Date;
      if (!startDate) return "";
      return getMonthNamesFromJOINED_date_strings(
        startDate,
        personnelPerformance.periodType,
      );
    }

    if (personnelPerformance.periodType === "روزانه") {
      const startDateArray = filters?.filter?.Start_Date;
      if (!startDateArray || !Array.isArray(startDateArray)) return "";
      return startDateArray.join(",");
    }

    return "";
  };

  const csvHeaders = columns
    .map((item) => ({
      label: item.header,
      key: item.accessorKey,
    }))
    .filter((f) => f.key != "Id");

  const completeData = (
    toggleDistinctData === "Distincted"
      ? distincedData
      : personnelPerformance.result
  ).map((row: any) => ({
    ...row,
    Start_Date: getFormattedStartDate(row),
  }));

  //remove key and rowCount from completeData

  const filteredData = flatRows.map((row: any) => ({
    ...row,
    Start_Date: getFormattedStartDate(row),
  }));

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn p-5 xl:flex-row">
      <FileBarChart2 className="stroke-accent" />

      <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-xs font-semibold text-emerald-900">
        <DownloadCloudIcon />
        <CSVLink
          filename="جزئیات عملکرد پرسنل.csv"
          headers={csvHeaders}
          data={completeData}
        >
          دانلود دیتای کامل
        </CSVLink>
      </Button>

      <Button className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-xs font-semibold text-amber-900">
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
