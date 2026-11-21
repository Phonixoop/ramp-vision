"use client";

import { arrIncludeExcat, commify } from "~/utils/util";
import { calculateDepoCompleteTime } from "~/utils/date-utils";
import { DepoData } from "../types";
import { CityNameFilter } from "~/app/dashboard/depo/components/filter-components/cityName";
import { ServiceNameFilter } from "~/app/dashboard/depo/components/filter-components/serviceName";
import { BillTypeFilter } from "~/app/dashboard/depo/components/filter-components/billType";
import { CaseTypeFilter } from "~/app/dashboard/depo/components/filter-components/caseType";
import { CustomColumnDef } from "~/types/table";
import { getSabtPieTotals } from "~/app/dashboard/depo/utils/sabt-pie-totals";

function sabtFooterTotal(
  table: { getFilteredRowModel: () => { rows: { original: DepoData }[] } },
  key: "entry" | "capacity" | "depo",
) {
  const rows = table.getFilteredRowModel().rows.map((row) => row.original);
  return commify(getSabtPieTotals(rows)[key]);
}

interface DepoColumnsProps {
  initialFilters: any;
  depo: any;
  filters: any;
  setDataFilters: (filters: any) => void;
  reportPeriod: string;
}

export function DepoColumns({
  initialFilters,
  depo,
  filters,
  setDataFilters,
  reportPeriod,
}: DepoColumnsProps): CustomColumnDef<DepoData, string | number | null>[] {
  return [
    {
      header: "ردیف",
      accessorKey: "Id",
      cell: ({ row }) => {
        return (
          <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
            {row.index + 1}
          </div>
        );
      },
    },
    {
      header: "استان",
      accessorKey: "CityName",
      filterFn: arrIncludeExcat,
      Filter: ({ column }) => (
        <CityNameFilter
          column={column}
          depo={depo}
          fallbackCityNames={
            initialFilters?.data?.Cities?.map((a: any) => a.CityName) ?? []
          }
          setDataFilters={setDataFilters}
        />
      ),
    },
    {
      header: "نوع فعالیت",
      accessorKey: "ServiceName",
      filterFn: "arrIncludesSome",
      Filter: ({ column }) => (
        <ServiceNameFilter
          column={column}
          depo={depo}
          setDataFilters={setDataFilters}
        />
      ),
    },
    {
      header: "نوع صورتحساب",
      accessorKey: "BillType",
      filterFn: arrIncludeExcat,
      Filter: ({ column }) => (
        <BillTypeFilter
          column={column}
          depo={depo}
          setDataFilters={setDataFilters}
        />
      ),
    },
    {
      header: "نوع پرونده",
      accessorKey: "CaseType",
      filterFn: arrIncludeExcat,
      Filter: ({ column }) => (
        <CaseTypeFilter
          column={column}
          depo={depo}
          setDataFilters={setDataFilters}
        />
      ),
    },
    {
      header: "تعداد دپو",
      accessorKey: "DepoCount",
      cell: ({ row }) => <span>{commify(row.original.DepoCount)}</span>,
      footer: ({ table }) => sabtFooterTotal(table, "depo"),
    },
    {
      header: "تعداد ورودی",
      accessorKey: "EntryCount",
      cell: ({ row }) => <span>{commify(row.original.EntryCount)}</span>,
      footer: ({ table }) => sabtFooterTotal(table, "entry"),
    },
    {
      header: "تعداد رسیدگی شده",
      accessorKey: "Capicity",
      cell: ({ row }) => <span>{commify(row.original.Capicity)}</span>,
      footer: ({ table }) => sabtFooterTotal(table, "capacity"),
    },
    {
      header: "مدت زمان اتمام دپو",
      accessorKey: "MyDepoCompletionTime",
      cell: ({ row }) => {
        const data = row.original;
        const result: number = calculateDepoCompleteTime(data);

        return <span dir="ltr">{result.toFixed(2)}</span>;
      },
    },
    {
      header: "وضعیت دپو",
      accessorKey: "DepoStatus",
      cell: ({ row }) => {
        const data = row.original;
        const result = calculateDepoCompleteTime(data);

        if (result < 0)
          return <span className="text-red-400">دپو در حال افزایش است</span>;
        else if (result == 0)
          return <span className="text-amber-400">دپو صفر است</span>;
        else
          return <span className="text-emerald-400 ">دپو در حال کاهش است</span>;
      },
    },
    {
      header: "بازه گزارش",
      accessorKey: "Start_Date",
      filterFn: "arrIncludesSome",
    },
  ];
}
