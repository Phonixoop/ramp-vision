/**
 * Hand-written schema for the legacy `RAMP_Daily` SQL Server database.
 *
 * The database is read-only from this app's point of view (one legacy mutation
 * still writes through `mssql-pool.ts`), so there is no codegen and therefore no
 * drift to reconcile: these interfaces are the contract.
 *
 * Only the four tables the v2 pages need are typed. Column types follow the
 * narrowed columns from `db/migrations/2026-11-23-ramp-daily-perf.sql`.
 */
import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

/** SQL Server returns `bit` as boolean through tedious. */
type Bit = ColumnType<boolean, boolean | 0 | 1, boolean | 0 | 1>;

/** Numeric measure columns: SQL Server `int`, but summed/averaged expressions can be decimal. */
type Measure = ColumnType<number | null, number | null, number | null>;

/** Persian (Jalali) date as stored: `YYYY/MM/DD`. Compared as a string on purpose. */
type JalaliDate = ColumnType<string, string, string>;

/** All four tables use a `uniqueidentifier` primary key. */
type Guid = ColumnType<string, never, never>;

/**
 * `personnel_performance` — one row per person, per city, per day, per branch.
 * 1.6M rows; every public measure lives here.
 */
export interface PersonnelPerformanceTable {
  Id: Guid;
  CityName: ColumnType<string | null, string | null, string | null>;
  NationalCode: ColumnType<string | null, string | null, string | null>;
  NameFamily: ColumnType<string | null, string | null, string | null>;
  Start_Date: JalaliDate;
  End_Date: ColumnType<string | null, string | null, string | null>;
  CreatedAtPersian: ColumnType<string | null, string | null, string | null>;
  HasTheDayOff: Bit;

  TownName: ColumnType<string | null, string | null, string | null>;
  BranchCode: ColumnType<string | null, string | null, string | null>;
  BranchName: ColumnType<string | null, string | null, string | null>;
  BranchType: ColumnType<string | null, string | null, string | null>;

  SabtAvalieAsnad: Measure;
  PazireshVaSabtAvalieAsnad: Measure;
  ArzyabiAsanadBimarsetaniDirect: Measure;
  ArzyabiAsnadBimarestaniIndirect: Measure;
  ArzyabiAsnadDandanVaParaDirect: Measure;
  ArzyabiAsnadDandanVaParaIndirect: Measure;
  ArzyabiAsnadDandanDirect: Measure;
  ArzyabiAsnadDandanIndirect: Measure;
  ArzyabiAsnadDaroDirect: Measure;
  ArzyabiAsnadDaroIndirect: Measure;
  WithScanCount: Measure;
  WithoutScanCount: Measure;
  WithoutScanInDirectCount: Measure;
  ArchiveDirectCount: Measure;
  ArchiveInDirectCount: Measure;
  ArzyabiVisitDirectCount: Measure;
  ArzyabiVisitInDirectCount: Measure;

  /** Percentages already computed by the legacy system (0-100 scale). */
  DirectPerFormance: Measure;
  IndirectPerFormance: Measure;
  TotalPerformance: Measure;
}

/**
 * `users_info` — the personnel roster with role/contract metadata.
 * Multiple rows per NationalCode exist (role history, contracts); queries
 * dedupe with `ROW_NUMBER() OVER (PARTITION BY NationalCode …)`.
 */
export interface UsersInfoTable {
  Id: Guid;
  NationalCode: ColumnType<string | null, string | null, string | null>;
  PersonnelCode: ColumnType<string | null, string | null, string | null>;
  NameFamily: ColumnType<string | null, string | null, string | null>;
  ProjectType: ColumnType<string | null, string | null, string | null>;
  ContractType: ColumnType<string | null, string | null, string | null>;
  Role: ColumnType<string | null, string | null, string | null>;
  RoleType: ColumnType<string | null, string | null, string | null>;
  DateInfo: ColumnType<string | null, string | null, string | null>;
  PhoneNumber: ColumnType<string | null, string | null, string | null>;
  ContractStartDate: ColumnType<string | null, string | null, string | null>;
  ContractEndDate: ColumnType<string | null, string | null, string | null>;
  TotalPresence: ColumnType<string | null, string | null, string | null>;
  ChargedPresence: ColumnType<string | null, string | null, string | null>;
  OverTimeHour: ColumnType<string | null, string | null, string | null>;
  Salary: Measure;
  SalaryDirect: Measure;
  SalaryInDirect: Measure;
}

/**
 * `users` — 2.1K rows of real personnel placement. Source of the *real* city,
 * which can differ from the city a performance row was recorded against.
 */
export interface UsersTable {
  Id: Guid;
  NationalCode: ColumnType<string | null, string | null, string | null>;
  CityName: ColumnType<string | null, string | null, string | null>;
  NameFamily: ColumnType<string | null, string | null, string | null>;
  CreatedAtPersian: ColumnType<string | null, string | null, string | null>;
}

/** `depos` — daily depot capacity/entry counts per city/service. 330K rows. */
export interface DeposTable {
  Id: Guid;
  CityName: ColumnType<string | null, string | null, string | null>;
  Start_Date: JalaliDate;
  End_Date: ColumnType<string | null, string | null, string | null>;
  CreatedAtPersian: ColumnType<string | null, string | null, string | null>;
  ServiceName: ColumnType<string | null, string | null, string | null>;
  BillType: ColumnType<string | null, string | null, string | null>;
  CaseType: ColumnType<string | null, string | null, string | null>;
  DepoCount: Measure;
  EntryCount: Measure;
  Capicity: Measure;
  DepoCompletionTime: ColumnType<number | null, number | null, number | null>;
}

export interface RampDB {
  personnel_performance: PersonnelPerformanceTable;
  users_info: UsersInfoTable;
  users: UsersTable;
  depos: DeposTable;
}

export type PersonnelPerformanceRow = Selectable<PersonnelPerformanceTable>;
export type PersonnelPerformanceInsert = Insertable<PersonnelPerformanceTable>;
export type PersonnelPerformanceUpdate = Updateable<PersonnelPerformanceTable>;
export type UsersInfoRow = Selectable<UsersInfoTable>;
export type UsersRow = Selectable<UsersTable>;
export type DeposRow = Selectable<DeposTable>;

/** Every numeric measure summed by the table and summary queries. */
export const PERFORMANCE_MEASURE_COLUMNS = [
  "SabtAvalieAsnad",
  "PazireshVaSabtAvalieAsnad",
  "ArzyabiAsanadBimarsetaniDirect",
  "ArzyabiAsnadBimarestaniIndirect",
  "ArzyabiAsnadDandanVaParaDirect",
  "ArzyabiAsnadDandanVaParaIndirect",
  "ArzyabiAsnadDandanDirect",
  "ArzyabiAsnadDandanIndirect",
  "ArzyabiAsnadDaroDirect",
  "ArzyabiAsnadDaroIndirect",
  "WithScanCount",
  "WithoutScanCount",
  "WithoutScanInDirectCount",
  "ArchiveDirectCount",
  "ArchiveInDirectCount",
  "ArzyabiVisitDirectCount",
  "ArzyabiVisitInDirectCount",
] as const satisfies readonly (keyof PersonnelPerformanceTable)[];

export type PerformanceMeasureColumn =
  (typeof PERFORMANCE_MEASURE_COLUMNS)[number];
