/**
 * Grid columns for the v2 personnel performance table.
 *
 * Column titles and order mirror `PersonnelPerformanceColumns.tsx` in v1 so a
 * user can move between the two pages without relearning the table.
 *
 * The important difference is `footer`: v1 summed the footer inside the browser
 * from the rows it had downloaded (`getFilteredRowModel()`), which is exactly
 * what forced it to hold every row. Here each column reads its total from the
 * `/summary` response, which is computed over the *full* filtered set in SQL —
 * so the footer stays correct while the grid only ever holds one page.
 */
"use client";

import type { ColumnDef } from "@tanstack/react-table-v9";

import { DataGridColumnHeader } from "~/components/reui/data-grid/data-grid-column-header";
import type { DataGridFeatures } from "~/components/reui/data-grid/data-grid";
import {
  getPersonnelDisplayName,
  normalizeNationalCode,
} from "~/utils/personnel-performance";
import { commify } from "~/utils/util";
import type {
  PersonnelTableRow,
  PersonnelSummaryResponse,
} from "~/server/ramp-performance/params";

type NumericColumn = {
  id: keyof PersonnelTableRow & string;
  title: string;
  /** Fixed width in px; the count columns are narrow and never wrap. */
  size?: number;
};

/** The 17 measure columns, in the same order v1 renders them. */
export const MEASURE_COLUMN_META: NumericColumn[] = [
  { id: "SabtAvalieAsnad", title: "ثبت اولیه اسناد" },
  { id: "PazireshVaSabtAvalieAsnad", title: "پذیرش و ثبت اولیه اسناد" },
  { id: "ArzyabiAsanadBimarsetaniDirect", title: "ارزیابی اسناد بیمارستانی مستقیم" },
  { id: "ArzyabiAsnadBimarestaniIndirect", title: "ارزیابی اسناد بیمارستانی غیر مستقیم" },
  { id: "ArzyabiAsnadDandanVaParaDirect", title: "ارزیابی اسناد پاراکلینیکی مستقیم" },
  { id: "ArzyabiAsnadDandanVaParaIndirect", title: "ارزیابی اسناد پاراکلینیکی غیر مستقیم" },
  { id: "ArzyabiAsnadDandanDirect", title: "ارزیابی اسناد دندانپزشکی مستقیم" },
  { id: "ArzyabiAsnadDandanIndirect", title: "ارزیابی اسناد دندانپزشکی غیر مستقیم" },
  { id: "ArzyabiAsnadDaroDirect", title: "ارزیابی اسناد دارو مستقیم" },
  { id: "ArzyabiAsnadDaroIndirect", title: "ارزیابی اسناد دارو غیر مستقیم" },
  { id: "WithScanCount", title: "ثبت ارزیابی با اسکن مدارک" },
  { id: "WithoutScanInDirectCount", title: "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)" },
  { id: "WithoutScanCount", title: "ثبت ارزیابی بدون اسکن مدارک" },
  { id: "ArchiveDirectCount", title: "بایگانی مستقیم" },
  { id: "ArchiveInDirectCount", title: "بایگانی غیر مستقیم" },
  { id: "ArzyabiVisitDirectCount", title: "ارزیابی ویزیت مستقیم" },
  { id: "ArzyabiVisitInDirectCount", title: "ارزیابی ویزیت غیر مستقیم" },
];

/** Performance columns: two-decimal display, totals rounded like v1. */
const PERFORMANCE_COLUMN_META: NumericColumn[] = [
  { id: "TotalPerformance", title: "عملکرد کلی" },
  { id: "DirectPerFormance", title: "عملکرد مستقیم" },
  { id: "InDirectPerFormance", title: "عملکرد غیر مستقیم" },
];

const num = new Intl.NumberFormat("fa-IR");

/**
 * Every footer total comes from `/summary`, never from the visible page.
 * `totals` holds the summed measures; the three performance columns have their
 * own average block, matching what the summary endpoint returns.
 */
export type FooterTotals = Pick<
  PersonnelSummaryResponse,
  "totals" | "average"
> & { total: number };

function measureFooter(footer: FooterTotals | undefined, id: string): string {
  if (!footer) return "—";
  const value = Number(footer.totals?.[id] ?? 0);
  return commify(Math.round(value));
}

function performanceFooter(
  footer: FooterTotals | undefined,
  id: "TotalPerformance" | "DirectPerFormance" | "InDirectPerFormance",
): string {
  if (!footer) return "—";
  return Number(footer.totals?.[id] ?? 0).toFixed(2);
}

export function buildPersonnelColumns(
  footer: FooterTotals | undefined,
  /** Rows already shown on earlier pages; keeps row numbers absolute. */
  pageOffset = 0,
): ColumnDef<DataGridFeatures, PersonnelTableRow>[] {
  return [
    {
      id: "rowNumber",
      header: ({ column }) => <DataGridColumnHeader title="ردیف" column={column} />,
      // Row numbers are page-relative so page 2 starts at 51, not 1.
      cell: ({ row }) => (
        <span className="tabular-nums text-primary/60">
          {num.format(pageOffset + row.index + 1)}
        </span>
      ),
      size: 64,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "CityName",
      header: ({ column }) => <DataGridColumnHeader title="استان" column={column} />,
      size: 130,
    },
    {
      accessorKey: "NameFamily",
      header: ({ column }) => <DataGridColumnHeader title="پرسنل" column={column} />,
      cell: ({ row }) => (
        <span className="truncate">
          {getPersonnelDisplayName(
            row.original.NameFamily,
            row.original.CityName,
            row.original.RealCityName,
          )}
        </span>
      ),
      size: 200,
      enableHiding: false,
    },
    {
      id: "NationalCode",
      accessorFn: (row) => normalizeNationalCode(row.NationalCode),
      header: ({ column }) => <DataGridColumnHeader title="کد ملی" column={column} />,
      cell: ({ row }) => (
        <span className="font-iransans text-sm tabular-nums">
          {normalizeNationalCode(row.original.NationalCode)}
        </span>
      ),
      size: 130,
    },
    {
      accessorKey: "ProjectType",
      header: ({ column }) => <DataGridColumnHeader title="نوع پروژه" column={column} />,
      size: 160,
    },
    {
      accessorKey: "ContractType",
      header: ({ column }) => <DataGridColumnHeader title="نوع قرارداد" column={column} />,
      size: 140,
    },
    {
      accessorKey: "Role",
      header: ({ column }) => <DataGridColumnHeader title="سمت" column={column} />,
      size: 240,
    },
    {
      accessorKey: "RoleType",
      header: ({ column }) => <DataGridColumnHeader title="نوع سمت" column={column} />,
      size: 160,
    },
    ...PERFORMANCE_COLUMN_META.map(
      (meta): ColumnDef<DataGridFeatures, PersonnelTableRow> => ({
        id: meta.id,
        accessorFn: (row) => Number(row[meta.id] ?? 0),
        header: ({ column }) => (
          <DataGridColumnHeader title={meta.title} column={column} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {Number(row.original[meta.id] ?? 0).toFixed(2)}
          </span>
        ),
        footer: () => performanceFooter(footer, meta.id as never),
        size: 130,
      }),
    ),
    ...MEASURE_COLUMN_META.map(
      (meta): ColumnDef<DataGridFeatures, PersonnelTableRow> => ({
        id: meta.id,
        accessorFn: (row) => Number(row[meta.id] ?? 0),
        header: ({ column }) => (
          <DataGridColumnHeader title={meta.title} column={column} />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-primary/70">
            {num.format(Number(row.original[meta.id] ?? 0))}
          </span>
        ),
        footer: () => measureFooter(footer, meta.id),
        size: 120,
      }),
    ),
    {
      accessorKey: "DateInfo",
      header: ({ column }) => (
        <DataGridColumnHeader title="تاریخ گزارش پرسنل" column={column} />
      ),
      size: 130,
    },
  ];
}
