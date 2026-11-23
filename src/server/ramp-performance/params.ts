/**
 * Shared request/response contract for the `/api/v2` routes and the client
 * hooks in `src/app/v2/dashboard/_lib/v2-api.ts`.
 *
 * Zod lives server-side only; the plain types are re-exported so client code
 * never imports zod.
 */
import { z } from "zod";

/** Persian period labels are the wire format used by v1 and the UI. */
export const periodTypeSchema = z.enum(["روزانه", "هفتگی", "ماهانه"]);
export type PeriodType = z.infer<typeof periodTypeSchema>;
export const sortDirSchema = z.enum(["asc", "desc"]);

const csvList = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
      : undefined,
  );

/**
 * Filter fields shared by both pages. Everything is optional: an absent field
 * means "no filter" (never `IN ()`), matching `generateWhereClause` in v1.
 */
export const filterQuerySchema = z.object({
  periodType: periodTypeSchema.default("روزانه"),
  /** Comma-separated Jalali dates (`YYYY/MM/DD`). */
  dates: csvList,
  cities: csvList,
  projectTypes: csvList,
  contractTypes: csvList,
  roles: csvList,
  roleTypes: csvList,
  dateInfos: csvList,
  towns: csvList,
  branchCodes: csvList,
  branchNames: csvList,
  branchTypes: csvList,
  /** Divide by configured work days instead of worked-row count. */
  workDays: z.coerce.boolean().optional(),
  workDaysCount: z.coerce.number().int().positive().max(366).optional(),
  /** Bypass the `TotalPerformance <> 0` row filter (debug/export parity). */
  includeZeroPerformance: z.coerce.boolean().optional(),
});

export type FilterQuery = z.infer<typeof filterQuerySchema>;

export const tableQuerySchema = filterQuerySchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(500).default(50),
  sort: z.string().optional(),
  dir: sortDirSchema.default("asc"),
  /** Free-text search across name / national code / personnel code. */
  q: z.string().trim().max(100).optional(),
});

export type TableQuery = z.infer<typeof tableQuerySchema>;

export const exportQuerySchema = filterQuerySchema.extend({
  sort: z.string().optional(),
  dir: sortDirSchema.default("asc"),
  q: z.string().trim().max(100).optional(),
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;

export const depoTableQuerySchema = z.object({
  periodType: periodTypeSchema.default("روزانه"),
  dates: csvList,
  cities: csvList,
  services: csvList,
  billTypes: csvList,
  caseTypes: csvList,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(500).default(50),
  sort: z.string().optional(),
  dir: sortDirSchema.default("asc"),
});

export type DepoTableQuery = z.infer<typeof depoTableQuerySchema>;

/** A single aggregated table row — one person in one city. */
export type PersonnelTableRow = {
  NationalCode: string;
  NameFamily: string;
  CityName: string;
  RealCityName: string | null;
  PersonnelCode: string | null;
  Role: string | null;
  RoleType: string | null;
  ContractType: string | null;
  ProjectType: string | null;
  DateInfo: string | null;
  Start_Date: string | null;
  HasTheDayOff: boolean;
  /** Number of deduped daily rows behind this person — the v1 divisor. */
  rowCount: number;
  DirectPerFormance: number;
  InDirectPerFormance: number;
  TotalPerformance: number;
} & Record<
  | "SabtAvalieAsnad"
  | "PazireshVaSabtAvalieAsnad"
  | "ArzyabiAsanadBimarsetaniDirect"
  | "ArzyabiAsnadBimarestaniIndirect"
  | "ArzyabiAsnadDandanVaParaDirect"
  | "ArzyabiAsnadDandanVaParaIndirect"
  | "ArzyabiAsnadDandanDirect"
  | "ArzyabiAsnadDandanIndirect"
  | "ArzyabiAsnadDaroDirect"
  | "ArzyabiAsnadDaroIndirect"
  | "WithScanCount"
  | "WithoutScanCount"
  | "WithoutScanInDirectCount"
  | "ArchiveDirectCount"
  | "ArchiveInDirectCount"
  | "ArzyabiVisitDirectCount"
  | "ArzyabiVisitInDirectCount",
  number
>;

export type PersonnelTableResponse = {
  rows: PersonnelTableRow[];
  total: number;
  page: number;
  pageSize: number;
  /** Work days used as divisor, when the work-days toggle is on. */
  workDays: number | null;
  /** Per-city count of distinct worked days (v1 `dateLength`). */
  dateLength: Record<string, number>;
};

export type PersonnelSummaryResponse = {
  total: number;
  totals: Record<string, number>;
  average: {
    TotalPerformance: number;
    DirectPerFormance: number;
    InDirectPerFormance: number;
  };
  byRole: { Role: string; count: number; TotalPerformance: number }[];
  byCity: { CityName: string; count: number; TotalPerformance: number }[];
};

export type PersonnelOptionsResponse = {
  cities: string[];
  projectTypes: string[];
  contractTypes: string[];
  roles: string[];
  roleTypes: string[];
  dateInfos: string[];
  towns: string[];
  branchCodes: string[];
  branchNames: string[];
  branchTypes: string[];
};

export type DepoTableRow = {
  ServiceName: string;
  CityName: string;
  BillType: string | null;
  CaseType: string | null;
  EntryCount: number;
  Capicity: number;
  DepoCount: number;
  Start_Date: string;
};

export type DepoTableResponse = {
  rows: DepoTableRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type DepoChartsResponse = {
  services: {
    ServiceName: string;
    EntryCount: number;
    Capicity: number;
    DepoCount: number;
    DepoCompleteTime: number;
  }[];
  totals: {
    EntryCount: number;
    Capicity: number;
    DepoCount: number;
    DepoCompleteTime: number;
  };
  byCity: { CityName: string; EntryCount: number; Capicity: number; DepoCount: number }[];
};

export type DepoEstimateResponse = {
  latestDepo: number;
  depoDate: string | null;
  prevCapicity: number;
  entryTotal: number;
  estimate: number;
};

/** Envelope every v2 route returns so clients get a uniform error shape. */
export type ApiErrorBody = { error: string; message: string; details?: unknown };
