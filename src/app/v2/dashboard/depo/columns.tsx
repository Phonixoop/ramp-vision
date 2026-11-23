/**
 * Table columns for the v2 depo page.
 *
 * Titles and order match `DepoColumns.tsx` in v1. The two derived columns are
 * computed per row here instead of in the browser over the full set:
 *
 * - `DepoCompletionTime` is `DepoCount / (Capicity - EntryCount)` — the same
 *   function `/charts` uses for the aggregate, applied row-wise.
 * - `DepoStatus` renders the completion ratio against the v1 semantics.
 *
 * Only the columns in `DEPO_SORTABLE` (`src/server/ramp-performance/depo.ts`)
 * are marked `sortable`: the server rejects anything else, so a clickable
 * `MyDepoCompletionTime` / `DepoStatus` header would silently do nothing.
 */
"use client";

import { cn } from "~/lib/utils";
import type { TableColumn } from "~/components/motion/table";
import type { DepoTableRow } from "~/server/ramp-performance/params";

const num = new Intl.NumberFormat("fa-IR");

/**
 * `calculateDepoCompleteTime` from `~/utils/date-utils`, reproduced for a row.
 *
 * The *sign* carries meaning in v1's status column: a negative ratio means depo
 * is growing faster than it is being worked off, zero means no depo, positive
 * means it is shrinking. Do not clamp it to zero.
 */
export function depoCompleteTime(row: DepoTableRow): number {
  if (row.DepoCount === 0) return 0;
  const remaining = row.Capicity - row.EntryCount;
  if (remaining === 0) return row.DepoCount;
  return row.DepoCount / remaining;
}

/** v1's three-way status, with the same wording and colours. */
function statusLabel(value: number): { label: string; tone: string } {
  if (value < 0) return { label: "دپو در حال افزایش است", tone: "text-red-400" };
  if (value === 0) return { label: "دپو صفر است", tone: "text-amber-400" };
  return { label: "دپو در حال کاهش است", tone: "text-emerald-400" };
}

/** Columns whose header may be clicked; the rest render as plain headers. */
export type DepoColumnKey =
  | "rowNumber"
  | "CityName"
  | "ServiceName"
  | "BillType"
  | "CaseType"
  | "DepoCount"
  | "EntryCount"
  | "Capicity"
  | "MyDepoCompletionTime"
  | "DepoStatus";

export type DepoColumn = TableColumn<DepoTableRow> & { key: DepoColumnKey };

export function buildDepoColumns(
  /** Rows already shown on earlier pages; keeps row numbers absolute. */
  pageOffset = 0,
): DepoColumn[] {
  const number = (value: number) => (
    <span className="tabular-nums">{num.format(value)}</span>
  );

  return [
    {
      key: "rowNumber",
      header: "ردیف",
      width: "64px",
      align: "center",
      // Page-absolute: page 2 of 50 starts at 51. `index` is the row's position
      // within this page, so the number survives reordering and sorting.
      cell: (_row, index) => (
        <span className="tabular-nums text-primary/45">
          {num.format(pageOffset + index + 1)}
        </span>
      ),
    },
    {
      key: "CityName",
      header: "استان",
      width: "130px",
      sortable: true,
    },
    {
      key: "ServiceName",
      header: "نوع فعالیت",
      width: "200px",
      sortable: true,
    },
    {
      key: "BillType",
      header: "نوع صورت‌حساب",
      width: "160px",
      sortable: true,
    },
    {
      key: "CaseType",
      header: "نوع پرونده",
      width: "160px",
      sortable: true,
    },
    {
      key: "DepoCount",
      header: "تعداد دپو",
      width: "110px",
      align: "center",
      sortable: true,
      cell: (row) => number(row.DepoCount),
    },
    {
      key: "EntryCount",
      header: "تعداد ورودی",
      width: "110px",
      align: "center",
      sortable: true,
      cell: (row) => number(row.EntryCount),
    },
    {
      key: "Capicity",
      header: "تعداد رسیدگی شده",
      width: "120px",
      align: "center",
      sortable: true,
      cell: (row) => number(row.Capicity),
    },
    {
      key: "MyDepoCompletionTime",
      header: "مدت زمان اتمام دپو",
      width: "140px",
      align: "center",
      cell: (row) => {
        const value = depoCompleteTime(row);
        return (
          <span className="tabular-nums">
            {Number.isFinite(value) ? value.toFixed(2) : "—"}
          </span>
        );
      },
    },
    {
      key: "DepoStatus",
      header: "وضعیت دپو",
      width: "150px",
      cell: (row) => {
        const { label, tone } = statusLabel(depoCompleteTime(row));
        return <span className={cn("text-xs font-medium", tone)}>{label}</span>;
      },
    },
  ];
}
