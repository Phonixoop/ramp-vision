import { sortDates } from "~/lib/utils";

export type PersonnelRecord = {
  CityName: string;
  NameFamily: string;
  NationalCode: string | number;
  ProjectType: string;
  Role: string;
  ContractType: string;
  RoleType: string;
  DateInfo: string;
};

export type FacetFilters = {
  query: string;
  cities: string[];
  contracts: string[];
  roles: string[];
  projects: string[];
  roleTypes: string[];
};

export type SortKey =
  | "NameFamily"
  | "CityName"
  | "Role"
  | "ContractType"
  | "NationalCode";

export const emptyFilters: FacetFilters = {
  query: "",
  cities: [],
  contracts: [],
  roles: [],
  projects: [],
  roleTypes: [],
};

const MIX_COLORS = [
  "rgb(var(--primbuttn))",
  "rgb(var(--accent))",
  "rgb(var(--primary))",
  "rgb(var(--primary-muted))",
  "rgb(var(--secbuttn))",
];

export function text(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function formatNumber(value: number): string {
  return value.toLocaleString("fa-IR");
}

export function normalizeSearch(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function displayLabel(value: string, fallback: string): string {
  return value || fallback;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "؟";
  if (parts.length === 1 || !last) return first.slice(0, 1);
  return `${first.slice(0, 1)}${last.slice(0, 1)}`;
}

export function toRecord(value: unknown): PersonnelRecord | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const name = text(row.NameFamily);
  const code = row.NationalCode;
  const codeText = text(code);
  if (!name && !codeText) return null;
  return {
    CityName: text(row.CityName),
    NameFamily: name,
    NationalCode: typeof code === "number" ? code : codeText,
    ProjectType: text(row.ProjectType),
    Role: text(row.Role),
    ContractType: text(row.ContractType),
    RoleType: text(row.RoleType),
    DateInfo: text(row.DateInfo),
  };
}

export function readRows(data: unknown): PersonnelRecord[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    const row = toRecord(item);
    return row ? [row] : [];
  });
}

export function readDateOptions(data: unknown, fallback?: string): string[] {
  const dates = new Set<string>();
  if (data && typeof data === "object") {
    const usersInfo = (data as { usersInfo?: unknown }).usersInfo;
    if (Array.isArray(usersInfo)) {
      for (const item of usersInfo) {
        if (!item || typeof item !== "object") continue;
        const date = text((item as { DateInfo?: unknown }).DateInfo);
        if (date) dates.add(date);
      }
    }
  }
  if (fallback) dates.add(fallback);
  return sortDates({ dates: [...dates] })
    .filter((date) => date && date !== "Invalid date")
    .reverse();
}

export function matchesQuery(row: PersonnelRecord, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  return (
    normalizeSearch(row.NameFamily).includes(needle) ||
    normalizeSearch(String(row.NationalCode)).includes(needle)
  );
}

export function matchesFacets(
  row: PersonnelRecord,
  filters: FacetFilters,
  ignore: Array<keyof FacetFilters> = [],
): boolean {
  const skipped = new Set(ignore);
  if (!skipped.has("query") && !matchesQuery(row, filters.query)) return false;
  if (
    !skipped.has("cities") &&
    filters.cities.length > 0 &&
    !filters.cities.includes(row.CityName)
  ) {
    return false;
  }
  if (
    !skipped.has("contracts") &&
    filters.contracts.length > 0 &&
    !filters.contracts.includes(row.ContractType)
  ) {
    return false;
  }
  if (
    !skipped.has("roles") &&
    filters.roles.length > 0 &&
    !filters.roles.includes(row.Role)
  ) {
    return false;
  }
  if (
    !skipped.has("projects") &&
    filters.projects.length > 0 &&
    !filters.projects.includes(row.ProjectType)
  ) {
    return false;
  }
  if (
    !skipped.has("roleTypes") &&
    filters.roleTypes.length > 0 &&
    !filters.roleTypes.includes(row.RoleType)
  ) {
    return false;
  }
  return true;
}

export function countValues(
  rows: PersonnelRecord[],
  pick: (row: PersonnelRecord) => string,
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = pick(row);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort(
      (a, b) => b.count - a.count || a.value.localeCompare(b.value, "fa"),
    );
}

export function uniqueValues(
  rows: PersonnelRecord[],
  pick: (row: PersonnelRecord) => string,
): string[] {
  return [
    ...new Set(rows.map(pick).filter((value) => value.length > 0)),
  ].sort((a, b) => a.localeCompare(b, "fa"));
}

export function compareRows(
  a: PersonnelRecord,
  b: PersonnelRecord,
  key: SortKey,
  direction: "asc" | "desc",
): number {
  const left = String(a[key] ?? "");
  const right = String(b[key] ?? "");
  const result = left.localeCompare(right, "fa", { numeric: true });
  return direction === "asc" ? result : -result;
}

export function contractMix(rows: PersonnelRecord[]) {
  const counts = countValues(rows, (row) => row.ContractType);
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  return counts.map((item, index) => ({
    ...item,
    label: displayLabel(item.value, "بدون قرارداد"),
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    color: MIX_COLORS[index % MIX_COLORS.length] ?? "rgb(var(--primbuttn))",
  }));
}

export function downloadCsv(rows: PersonnelRecord[], date: string) {
  const headers = [
    "نام",
    "کد ملی",
    "استان",
    "سمت",
    "نوع قرارداد",
    "نوع سمت",
    "نوع پروژه",
    "تاریخ گزارش",
  ];
  const keys: (keyof PersonnelRecord)[] = [
    "NameFamily",
    "NationalCode",
    "CityName",
    "Role",
    "ContractType",
    "RoleType",
    "ProjectType",
    "DateInfo",
  ];
  const cell = (value: string) => {
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.map(cell).join(","),
    ...rows.map((row) => keys.map((key) => cell(text(row[key]))).join(",")),
  ];
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `personnels-${date.replaceAll("/", "-") || "report"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function filtersAreActive(filters: FacetFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.cities.length > 0 ||
    filters.contracts.length > 0 ||
    filters.roles.length > 0 ||
    filters.projects.length > 0 ||
    filters.roleTypes.length > 0
  );
}
