import moment from "jalali-moment";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";
export type CalendarPeriod = "daily" | "weekly" | "monthly";

export type ChartFilterValues = {
  period: PeriodType;
  dates: string[];
  project: string[];
  contract: string[];
  role: string[];
  role_type: string[];
  date_info: string[];
  town: string[];
  branch: string[];
  branch_code: string[];
  branch_type: string[];
  work_days: boolean;
};

export type SelectDefaults = {
  period: PeriodType;
  project: string[];
  contract: string[];
  role: string[];
  role_type: string[];
  work_days: boolean;
};

export type ChartSearchParams = {
  period?: string;
  dates?: string;
  project?: string;
  contract?: string;
  role?: string;
  role_type?: string;
  date_info?: string;
  town?: string;
  branch?: string;
  branch_code?: string;
  branch_type?: string;
  work_days?: string;
};

export const DEFAULTS_STORAGE_KEY =
  "ramp.v2.personnel_performance.chart.defaults";

export const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:rgb(var(--accent))]";

export const systemSelectDefaults = (): SelectDefaults => ({
  period: "ماهانه",
  project: [...defaultProjectTypes],
  contract: [...defualtContractTypes],
  role: [...defualtRoles],
  // Match v1 chart context: pass contract types into this helper. It only
  // expands for پرکیس/مشاوره *project* labels, so with ["تمام وقت"] this is [].
  // Empty RoleType ⇒ generateWhereClause skips the column (no over-filter).
  role_type: getDefaultRoleTypesBaseOnContractType([...defualtContractTypes]),
  work_days: false,
});

export function defaultStartDates(): string[] {
  return [moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD")];
}

export function splitCsv(value?: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

export function parsePeriod(value?: string | null): PeriodType {
  if (value === "روزانه" || value === "هفتگی" || value === "ماهانه") {
    return value;
  }
  return "ماهانه";
}

export function parseWorkDays(value?: string | null): boolean {
  return value === "true";
}

export function periodToCalendar(period: PeriodType): CalendarPeriod {
  switch (period) {
    case "روزانه":
      return "daily";
    case "هفتگی":
      return "weekly";
    default:
      return "monthly";
  }
}

export function calendarToPeriod(period: CalendarPeriod): PeriodType {
  switch (period) {
    case "daily":
      return "روزانه";
    case "weekly":
      return "هفتگی";
    default:
      return "ماهانه";
  }
}

export function readSavedDefaults(): SelectDefaults | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEFAULTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SelectDefaults>;
    const system = systemSelectDefaults();
    const roleType = Array.isArray(parsed.role_type)
      ? parsed.role_type
      : system.role_type;
    return {
      period: parsePeriod(parsed.period),
      project: Array.isArray(parsed.project) ? parsed.project : system.project,
      contract: Array.isArray(parsed.contract)
        ? parsed.contract
        : system.contract,
      role: Array.isArray(parsed.role) ? parsed.role : system.role,
      role_type: sameStringArrays(roleType, legacyRoleTypeDefault())
        ? []
        : roleType,
      work_days:
        typeof parsed.work_days === "boolean"
          ? parsed.work_days
          : system.work_days,
    };
  } catch {
    return null;
  }
}

export function writeSavedDefaults(defaults: SelectDefaults) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(defaults));
}

export function clearSavedDefaults() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEFAULTS_STORAGE_KEY);
}

/** Old v2 default that over-filtered vs v1 (پرکیس/مشاوره union). */
export function legacyRoleTypeDefault(): string[] {
  return getDefaultRoleTypesBaseOnContractType(["پرکیس", "مشاوره"]);
}

export function resolveInitialFilters(
  searchParams: ChartSearchParams,
  saved: SelectDefaults | null,
): ChartFilterValues {
  const system = systemSelectDefaults();
  const base = saved ?? system;

  // Prefer explicit URL values; otherwise use saved/system defaults.
  // Missing contract/role/project → v1 defaults. Missing role_type → [] (v1).
  let roleType = searchParams.role_type
    ? splitCsv(searchParams.role_type)
    : [...base.role_type];
  // URLs written by the old v2 whitelist default should behave like v1 (no RoleType filter).
  if (sameStringArrays(roleType, legacyRoleTypeDefault())) {
    roleType = [];
  }

  return {
    period: searchParams.period ? parsePeriod(searchParams.period) : base.period,
    dates: splitCsv(searchParams.dates).length
      ? splitCsv(searchParams.dates)
      : defaultStartDates(),
    project: searchParams.project
      ? splitCsv(searchParams.project)
      : [...base.project],
    contract: searchParams.contract
      ? splitCsv(searchParams.contract)
      : [...base.contract],
    role: searchParams.role ? splitCsv(searchParams.role) : [...base.role],
    role_type: roleType,
    date_info: splitCsv(searchParams.date_info),
    town: splitCsv(searchParams.town),
    branch: splitCsv(searchParams.branch),
    branch_code: splitCsv(searchParams.branch_code),
    branch_type: splitCsv(searchParams.branch_type),
    work_days:
      searchParams.work_days !== undefined
        ? parseWorkDays(searchParams.work_days)
        : base.work_days,
  };
}

function nonEmpty(values: string[] | undefined): string[] | undefined {
  if (!values?.length) return undefined;
  const cleaned = values.filter((value) => Boolean(value?.trim()));
  return cleaned.length ? cleaned : undefined;
}

/**
 * Map UI/URL filter state to the tRPC input shape.
 * Empty arrays become `undefined` so generateWhereClause skips the column
 * ("no filter") instead of `IN ()` / matching nothing.
 * Callers should apply v1-equivalent defaults for ProjectType / Role /
 * ContractType when those keys are absent; RoleType stays omitted when empty
 * (v1 sends whatever is in context, which defaults to []).
 */
export function toApiFilters(filters: ChartFilterValues) {
  return {
    periodType: filters.period,
    filter: {
      Start_Date: nonEmpty(filters.dates),
      ProjectType: nonEmpty(filters.project),
      ContractType: nonEmpty(filters.contract),
      Role: nonEmpty(filters.role),
      RoleType: nonEmpty(filters.role_type),
      DateInfo: nonEmpty(filters.date_info),
      TownName: nonEmpty(filters.town),
      BranchName: nonEmpty(filters.branch),
      BranchCode: nonEmpty(filters.branch_code),
      BranchType: nonEmpty(filters.branch_type),
    },
  };
}

/** v1 query-time fallbacks when a select was omitted / cleared. */
export function withV1QueryDefaults(
  mapped: ReturnType<typeof toApiFilters>,
  dateInfoFallback?: string[] | null,
): ReturnType<typeof toApiFilters> {
  const filter = { ...mapped.filter };

  if (!filter.ProjectType?.length) {
    filter.ProjectType = [...defaultProjectTypes];
  }
  if (!filter.Role?.length) {
    filter.Role = [...defualtRoles];
  }
  if (!filter.ContractType?.length) {
    filter.ContractType = [...defualtContractTypes];
  }
  // Intentionally do NOT default RoleType — empty/absent means no SQL filter (v1).
  // Drop the legacy پرکیس/مشاوره whitelist if it still arrives from an old URL.
  if (
    filter.RoleType?.length &&
    sameStringArrays(filter.RoleType, legacyRoleTypeDefault())
  ) {
    filter.RoleType = undefined;
  }
  if (!filter.DateInfo?.length && dateInfoFallback?.length) {
    filter.DateInfo = [...dateInfoFallback];
  }

  return { periodType: mapped.periodType, filter };
}

export function sameStringArrays(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}
