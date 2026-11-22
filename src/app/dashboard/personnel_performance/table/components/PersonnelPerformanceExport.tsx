"use client";
import { DownloadCloudIcon, FileBarChart2 } from "lucide-react";
import * as XLSX from "xlsx";
import Button from "~/ui/buttons";
import {
  getMonthNamesFromJOINED_date_strings,
  normalizeNationalCode,
} from "~/utils/personnel-performance";
import { CustomColumnDef } from "~/types/table";

interface PersonnelPerformanceExportProps {
  flatRows: any[];
  columns: CustomColumnDef<any, any>[];
  personnelPerformance: any;
  filters: any;
  toggleDistinctData: "Distincted" | "Pure";
  distincedData: any[];
}

type ExportHeader = { label: string; key: string };

function downloadXlsx(
  filename: string,
  headers: ExportHeader[],
  rows: Record<string, unknown>[],
) {
  const labels = headers.map((h) => h.label);
  const keys = headers.map((h) => h.key);
  const nationalCodeCol = keys.indexOf("NationalCode");

  const aoa: (string | number | boolean | null | undefined)[][] = [
    labels,
    ...rows.map((row) =>
      keys.map((key) => {
        const value = row[key];
        if (key === "NationalCode") {
          return normalizeNationalCode(value);
        }
        if (value == null) return "";
        return value as string | number | boolean;
      }),
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Force national-code cells to Excel text so leading zeros are kept.
  if (nationalCodeCol >= 0) {
    const col = XLSX.utils.encode_col(nationalCodeCol);
    for (let rowIndex = 1; rowIndex < aoa.length; rowIndex++) {
      const cellRef = `${col}${rowIndex + 1}`;
      const cell = worksheet[cellRef];
      if (!cell) continue;
      const text = normalizeNationalCode(cell.v);
      cell.t = "s";
      cell.v = text;
      cell.w = text;
      cell.z = "@";
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "عملکرد پرسنل");
  XLSX.writeFile(workbook, filename);
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

  const exportHeaders: ExportHeader[] = columns
    .map((item) => ({
      label: String(item.header ?? ""),
      key: String(item.accessorKey ?? ""),
    }))
    .filter((f) => f.key && f.key !== "Id");

  const completeData = (
    toggleDistinctData === "Distincted"
      ? distincedData
      : personnelPerformance.result
  ).map((row: any) => ({
    ...row,
    NationalCode: normalizeNationalCode(row.NationalCode),
    Start_Date: getFormattedStartDate(row),
  }));

  const filteredData = flatRows.map((row: any) => ({
    ...row,
    NationalCode: normalizeNationalCode(row.NationalCode),
    Start_Date: getFormattedStartDate(row),
  }));

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn p-5 xl:flex-row">
      <FileBarChart2 className="stroke-accent" />

      <Button
        className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-xs font-semibold text-emerald-900"
        onClick={() =>
          downloadXlsx(
            "جزئیات عملکرد پرسنل.xlsx",
            exportHeaders,
            completeData,
          )
        }
      >
        <DownloadCloudIcon />
        دانلود دیتای کامل
      </Button>

      <Button
        className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-xs font-semibold text-amber-900"
        onClick={() =>
          downloadXlsx(
            "جزئیات عملکرد پرسنل (فیلتر شده).xlsx",
            exportHeaders,
            filteredData,
          )
        }
      >
        <DownloadCloudIcon />
        دانلود دیتای فیلتر شده
      </Button>
    </div>
  );
}
