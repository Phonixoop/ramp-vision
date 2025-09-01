"use client";

import { DownloadCloudIcon, FileBarChart2 } from "lucide-react";
import { CSVLink } from "react-csv";
import Button from "~/ui/buttons";
import { calculateDepoCompleteTime } from "~/utils/date-utils";
import { CustomColumnDef } from "~/app/dashboard/personnel_performance/table/components/PersonnelPerformanceColumns";

interface DepoExportProps {
  columns: CustomColumnDef<any, string | number>[];
  data: any[];
  isLoading: boolean;
  flatRows?: any[];
}

export function DepoExport({ columns, data, isLoading, flatRows = [] }: DepoExportProps) {
  if (isLoading || !data?.length) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl bg-secbuttn p-5 xl:flex-row">
      <FileBarChart2 className="stroke-accent" />
      <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-xs  font-semibold text-emerald-900">
        <DownloadCloudIcon />
        <CSVLink
          filename="جزئیات عملکرد شعب.csv"
          headers={columns
            .map((item) => {
              return {
                label: item.header,
                key: (item as any).accessorKey,
              };
            })
            .filter((f) => f.key != "Id")}
          data={data.map((item) => {
            const depo: number = calculateDepoCompleteTime(item);

            let depoStatus = "";
            if (depo < 0) depoStatus = "دپو در حال افزایش است";
            else if (depo == 0) depoStatus = "دپو صفر است";
            else depoStatus = "دپو در حال کاهش است";

            return {
              ...item,
              MyDepoCompletionTime: depo.toFixed(2),
              DepoStatus: depoStatus,
            };
          })}
        >
          دانلود دیتای کامل
        </CSVLink>
      </Button>
      <Button className="font flex justify-center gap-1 rounded-3xl bg-amber-300 text-xs  font-semibold text-amber-900">
        <DownloadCloudIcon />
        <CSVLink
          filename="جزئیات عملکرد شعب (فیلتر شده).csv"
          headers={columns
            .map((item) => {
              return {
                label: item.header,
                key: (item as any).accessorKey,
              };
            })
            .filter((f) => f.key != "Id")}
          data={flatRows.map((item) => {
            const depo: number = calculateDepoCompleteTime(item);

            let depoStatus = "";
            if (depo < 0) depoStatus = "دپو در حال افزایش است";
            else if (depo == 0) depoStatus = "دپو صفر است";
            else depoStatus = "دپو در حال کاهش است";

            return {
              ...item,
              MyDepoCompletionTime: depo.toFixed(2),
              DepoStatus: depoStatus,
            };
          })}
        >
          دانلود دیتای فیلتر شده
        </CSVLink>
      </Button>
    </div>
  );
}
