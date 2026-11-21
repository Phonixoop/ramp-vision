import { ServiceNames } from "~/constants/depo";
import { sumColumnBasedOnRowValue } from "~/utils/util";

/** Service names used by DepoSummary pie charts (ثبت ارزیابی / sabt). */
export const SABT_SERVICE_NAMES = [
  ServiceNames["ثبت ارزیابی با اسکن مدارک"],
  ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
  ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
];

export const SABT_DIRECT_SERVICE_NAMES = [
  ServiceNames["ثبت ارزیابی با اسکن مدارک"],
  ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
];

export const SABT_INDIRECT_SERVICE_NAMES = [
  ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
];

export type SabtPieTotals = {
  entryDirect: number;
  entryIndirect: number;
  entry: number;
  capacityDirect: number;
  capacityIndirect: number;
  capacity: number;
  depoDirect: number;
  depoIndirect: number;
  depo: number;
};

/**
 * Pie-chart-aligned totals for sabt ServiceNames.
 * Entry/Capacity split by BillType; Depo splits direct vs indirect sabt services.
 */
export function getSabtPieTotals(rows: any[]): SabtPieTotals {
  const directRows = rows.filter((a) => a.BillType === "مستقیم");
  const indirectRows = rows.filter((a) => a.BillType === "غیر مستقیم");

  const entryDirect = sumColumnBasedOnRowValue(
    directRows,
    "EntryCount",
    "ServiceName",
    SABT_SERVICE_NAMES,
  );
  const entryIndirect = sumColumnBasedOnRowValue(
    indirectRows,
    "EntryCount",
    "ServiceName",
    SABT_SERVICE_NAMES,
  );
  const capacityDirect = sumColumnBasedOnRowValue(
    directRows,
    "Capicity",
    "ServiceName",
    SABT_SERVICE_NAMES,
  );
  const capacityIndirect = sumColumnBasedOnRowValue(
    indirectRows,
    "Capicity",
    "ServiceName",
    SABT_SERVICE_NAMES,
  );
  const depoDirect = sumColumnBasedOnRowValue(
    rows,
    "DepoCount",
    "ServiceName",
    SABT_DIRECT_SERVICE_NAMES,
  );
  const depoIndirect = sumColumnBasedOnRowValue(
    rows,
    "DepoCount",
    "ServiceName",
    SABT_INDIRECT_SERVICE_NAMES,
  );

  return {
    entryDirect,
    entryIndirect,
    entry: entryDirect + entryIndirect,
    capacityDirect,
    capacityIndirect,
    capacity: capacityDirect + capacityIndirect,
    depoDirect,
    depoIndirect,
    depo: depoDirect + depoIndirect,
  };
}
