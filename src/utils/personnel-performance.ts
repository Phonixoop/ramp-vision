import moment from "jalali-moment";
import {
  Indicators,
  Performance_Levels_Gauge,
} from "~/constants/personnel-performance";
import {
  TEHRAN_RELATED_CITIES,
  TEHRAN_SUB_CITIES,
} from "~/constants";
import { PeriodType } from "~/context/personnel-filter.context";
import { CityWithPerformanceData } from "~/types";
import { getMonthName, getWeekOfMonth } from "~/utils/date-utils";
import {
  dedupeRowsByFields,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
  processDataForChart,
} from "~/utils/util";

/** Fields sourced from users_info that differ per role row after the SQL join. */
export const USERS_INFO_FIELDS = [
  "NameFamily",
  "Role",
  "RoleType",
  "ContractType",
  "ProjectType",
  "DateInfo",
] as const;

/** Identity of a personnel_performance record (excludes users_info role fields). */
export const PERSONNEL_PERFORMANCE_DEDUPE_BY = [
  "NationalCode",
  "CityName",
  "Start_Date",
  "TownName",
  "BranchCode",
  "BranchName",
  "BranchType",
  "HasTheDayOff",
] as const;

export function normalizeCityName(cityName: string | null | undefined): string {
  if (!cityName) return "";
  return getPersianToEnglishCity(cityName);
}

export function isTehranRelatedCity(
  cityName: string | null | undefined,
): cityName is (typeof TEHRAN_RELATED_CITIES)[number] {
  const normalizedCity = normalizeCityName(cityName);
  return TEHRAN_RELATED_CITIES.includes(
    normalizedCity as (typeof TEHRAN_RELATED_CITIES)[number],
  );
}

export function isTehranSubCity(
  cityName: string | null | undefined,
): cityName is (typeof TEHRAN_SUB_CITIES)[number] {
  const normalizedCity = normalizeCityName(cityName);
  return TEHRAN_SUB_CITIES.includes(
    normalizedCity as (typeof TEHRAN_SUB_CITIES)[number],
  );
}

export function isTehranCityMatch(
  performanceCity: string | null | undefined,
  realCity: string | null | undefined,
): boolean {
  const normalizedPerformanceCity = normalizeCityName(performanceCity);
  const normalizedRealCity = normalizeCityName(realCity);

  if (!normalizedPerformanceCity || !normalizedRealCity) return false;
  if (normalizedPerformanceCity === normalizedRealCity) return true;

  return normalizedRealCity === "Tehran" && isTehranRelatedCity(performanceCity);
}

export function expandTehranPerformanceCities(cityNames: string[]): string[] {
  if (!cityNames.length) return cityNames;

  const expandedCities = new Set<string>();
  for (const cityName of cityNames) {
    const normalizedCity = normalizeCityName(cityName);
    if (normalizedCity === "Tehran") {
      for (const tehranCity of TEHRAN_RELATED_CITIES) {
        expandedCities.add(tehranCity);
      }
      continue;
    }

    expandedCities.add(normalizedCity || cityName);
  }

  return [...expandedCities];
}

export function normalizeCityForCityList(
  cityName: string | null | undefined,
): string {
  if (isTehranRelatedCity(cityName)) return "Tehran";
  return normalizeCityName(cityName);
}

export type TehranSubCity = (typeof TEHRAN_SUB_CITIES)[number];

export const TEHRAN_SUB_CITY_LABELS: Record<TehranSubCity, string> = {
  "Tehran Jobran": "جبران",
  "Tehran Not Jobran": "غیر جبران",
  "Tehran InDirect": "غیر مستقیم",
};

/** Collapse Tehran-related cities to a single "تهران" for city filter UI lists. */
export function collapseCitiesForFilterList(cityNames: string[]): string[] {
  const collapsed = new Set<string>();
  let hasTehran = false;

  for (const cityName of cityNames) {
    if (isTehranRelatedCity(cityName)) {
      hasTehran = true;
      continue;
    }
    const normalized = normalizeCityName(cityName);
    collapsed.add(getEnglishToPersianCity(normalized) || cityName);
  }

  if (hasTehran) {
    collapsed.add(getEnglishToPersianCity("Tehran"));
  }

  return [...collapsed];
}

/**
 * Expand a collapsed city-filter selection into English CityName values for the API.
 * When Tehran is selected with no sub-cities, includes all TEHRAN_RELATED_CITIES.
 */
export function expandCityFilterSelection(
  selectedDisplayCities: string[],
  tehranSubCities: readonly string[] = [],
): string[] {
  const expanded = new Set<string>();

  for (const cityName of selectedDisplayCities) {
    const normalized = normalizeCityName(cityName);
    if (normalized === "Tehran" || isTehranRelatedCity(normalized)) {
      if (tehranSubCities.length > 0) {
        for (const sub of tehranSubCities) {
          expanded.add(normalizeCityName(sub));
        }
      } else {
        for (const tehranCity of TEHRAN_RELATED_CITIES) {
          expanded.add(tehranCity);
        }
      }
      continue;
    }
    if (normalized) expanded.add(normalized);
  }

  return [...expanded];
}

/** Distinct city count after collapsing Tehran variants (monthly single-city rules). */
export function countCollapsedCities(
  cityNames: string[] | undefined | null,
): number {
  if (!cityNames?.length) return 0;
  return collapseCitiesForFilterList(cityNames).length;
}

/** Active Tehran sub-city chips implied by an expanded CityName filter. */
export function deriveTehranSubCitiesFromFilter(
  cityNames: string[] | undefined | null,
): TehranSubCity[] {
  if (!cityNames?.length) return [];

  const normalized = cityNames.map(normalizeCityName);
  if (!normalized.some(isTehranRelatedCity)) return [];

  const selectedSubs = TEHRAN_SUB_CITIES.filter((city) =>
    normalized.includes(city),
  );
  const relatedSelected = TEHRAN_RELATED_CITIES.filter((city) =>
    normalized.includes(city),
  );

  if (relatedSelected.length === TEHRAN_RELATED_CITIES.length) return [];
  if (relatedSelected.length === 1 && relatedSelected[0] === "Tehran") return [];
  if (selectedSubs.length === 0) return [];

  return [...selectedSubs];
}

export function isPersonnelCityMismatch(
  performanceCity: string | null | undefined,
  realCity: string | null | undefined,
): boolean {
  if (!performanceCity || !realCity) return false;
  return !isTehranCityMatch(performanceCity, realCity);
}

export function getPersonnelDisplayName(
  nameFamily: string,
  performanceCity?: string | null,
  realCity?: string | null,
): string {
  if (!isPersonnelCityMismatch(performanceCity, realCity)) return nameFamily;
  const realCityFa = getEnglishToPersianCity(normalizeCityName(realCity!));
  return `${nameFamily} (${realCityFa})`;
}

export function filterRowsForCityPerformanceAggregate<
  T extends { CityName?: string; RealCityName?: string | null },
>(rows: T[]): T[] {
  return rows.filter(
    (row) => !isPersonnelCityMismatch(row.CityName, row.RealCityName),
  );
}

export function dedupePersonnelPerformanceRows<
  T extends Record<string, unknown>,
>(rows: T[]): T[] {
  return dedupeRowsByFields(rows, [...PERSONNEL_PERFORMANCE_DEDUPE_BY]);
}

/** SQL bit / boolean — 0 and false mean working day; 1 and true mean day off. */
export function isPersonnelWorkingDay(hasTheDayOff: unknown): boolean {
  return hasTheDayOff !== true && hasTheDayOff !== 1;
}

function matchesPersonnelSparkFilter(
  row: Record<string, unknown>,
  key: string,
  value: unknown,
): boolean {
  if (value == null || value === "") return true;
  const rowValue = row[key];
  if (rowValue == null || rowValue === "") return false;

  if (key === "NationalCode") {
    return String(rowValue) === String(value);
  }

  if (key === "CityName") {
    const a = String(rowValue);
    const b = String(value);
    if (a === b) return true;
    const aFa = getEnglishToPersianCity(a) ?? a;
    const bFa = getEnglishToPersianCity(b) ?? b;
    return aFa === bFa;
  }

  return rowValue === value;
}

/** Direct activity fields used by C# CalculateDirectPerformance / Indicators. */
export const DIRECT_PERFORMANCE_FIELDS = [
  "SabtAvalieAsnad",
  "PazireshVaSabtAvalieAsnad",
  "ArzyabiAsanadBimarsetaniDirect",
  "ArzyabiAsnadDandanVaParaDirect",
  "ArzyabiAsnadDandanDirect",
  "ArzyabiAsnadDaroDirect",
  "WithScanCount",
  "WithoutScanCount",
] as const;

/** Indirect activity fields used by C# CalculateInDirectPerformance / Indicators. */
export const INDIRECT_PERFORMANCE_FIELDS = [
  "ArzyabiAsnadBimarestaniIndirect",
  "ArzyabiAsnadDandanVaParaIndirect",
  "ArzyabiAsnadDandanIndirect",
  "ArzyabiAsnadDaroIndirect",
  "WithoutScanInDirectCount",
] as const;

function performanceContribution(
  item: Record<string, unknown>,
  field: keyof typeof Indicators,
  dateLength: number,
  divideBy: number,
): number {
  const count = Number(item[field]) || 0;
  const indicator = Indicators[field];
  if (!indicator || !dateLength) return 0;
  return count / ((dateLength * indicator) / divideBy);
}

function sumPerformanceFields(
  item: Record<string, unknown>,
  fields: readonly (keyof typeof Indicators)[],
  dateLength: number,
  divideBy: number,
): number {
  const safeDateLength = dateLength > 0 ? dateLength : 1;
  return (
    fields.reduce(
      (sum, field) =>
        sum + performanceContribution(item, field, safeDateLength, divideBy),
      0,
    ) * 100
  );
}

/** Matches C# CalculateDirectPerformance (Indicators; divideBy kept for legacy, default 1). */
export function calculateDirectPerformance(
  item: any,
  dateLength: number,
  divideBy: number = 1,
): number {
  return sumPerformanceFields(
    item,
    DIRECT_PERFORMANCE_FIELDS,
    dateLength,
    divideBy,
  );
}

/** Matches C# CalculateInDirectPerformance (Indicators; divideBy kept for legacy, default 1). */
export function calculateInDirectPerformance(
  item: any,
  dateLength: number,
  divideBy: number = 1,
): number {
  return sumPerformanceFields(
    item,
    INDIRECT_PERFORMANCE_FIELDS,
    dateLength,
    divideBy,
  );
}

export function calculatePerformance(
  item: any,
  dateLenght: number,
  devideBy: number = 1,
): number {
  return (
    calculateDirectPerformance(item, dateLenght, devideBy) +
    calculateInDirectPerformance(item, dateLenght, devideBy)
  );
}

/** Iranian national codes are 10 digits; pad when SQL returns a numeric form. */
const NATIONAL_CODE_LENGTH = 10;

/** Normalize national-code values so number/string forms compare equal. */
export function normalizeNationalCode(value: unknown): string {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw) && raw.length < NATIONAL_CODE_LENGTH) {
    return raw.padStart(NATIONAL_CODE_LENGTH, "0");
  }
  return raw;
}

/** Match search text against a national code (supports missing leading zeros). */
export function nationalCodeMatchesQuery(
  value: unknown,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const code = normalizeNationalCode(value).toLowerCase();
  if (!code) return false;
  if (code.includes(q)) return true;
  const codeNorm = code.replace(/^0+/, "") || "0";
  const qNorm = q.replace(/^0+/, "") || "0";
  return codeNorm.includes(qNorm) || qNorm.includes(codeNorm);
}

/**
 * Chart city pages merge users_info people who are missing from performance
 * results (day-off, no activity for the period, etc.) so they remain searchable.
 * Table uses the same merge for parity.
 */
export function mergeMissingPersonnelsIntoPerformance<
  T extends { NationalCode?: unknown },
  P extends {
    NationalCode?: unknown;
    NameFamily?: unknown;
    CityName?: unknown;
    Role?: unknown;
    RoleType?: unknown;
    ContractType?: unknown;
    ProjectType?: unknown;
    DateInfo?: unknown;
  },
>(performanceRows: T[] | undefined | null, personnelRows: P[] | undefined | null): T[] {
  const base = Array.isArray(performanceRows) ? performanceRows : [];
  if (!Array.isArray(personnelRows) || personnelRows.length === 0) return base;

  const present = new Set(
    base
      .map((row) => normalizeNationalCode(row.NationalCode))
      .filter(Boolean),
  );

  const missing = personnelRows
    .filter((row) => {
      const code = normalizeNationalCode(row.NationalCode);
      return Boolean(code) && !present.has(code);
    })
    .map((row) => ({
      ...row,
      NationalCode: normalizeNationalCode(row.NationalCode),
      TotalPerformance: 0,
      DirectPerFormance: 0,
      InDirectPerFormance: 0,
      SabtAvalieAsnad: 0,
      PazireshVaSabtAvalieAsnad: 0,
      ArzyabiAsanadBimarsetaniDirect: 0,
      ArzyabiAsnadBimarestaniIndirect: 0,
      ArzyabiAsnadDandanVaParaDirect: 0,
      ArzyabiAsnadDandanVaParaIndirect: 0,
      ArzyabiAsnadDandanDirect: 0,
      ArzyabiAsnadDandanIndirect: 0,
      ArzyabiAsnadDaroDirect: 0,
      ArzyabiAsnadDaroIndirect: 0,
      WithScanCount: 0,
      WithoutScanCount: 0,
      WithoutScanInDirectCount: 0,
      ArchiveDirectCount: 0,
      ArchiveInDirectCount: 0,
      ArzyabiVisitDirectCount: 0,
      ArzyabiVisitInDirectCount: 0,
      HasTheDayOff: false,
      key: {
        CityName: row.CityName,
        NameFamily: row.NameFamily,
        NationalCode: normalizeNationalCode(row.NationalCode),
      },
    })) as unknown as T[];

  return [...base, ...missing];
}

/** Identity match for refreshing selectedPerson after list re-aggregation. */
export function isSamePersonnelRecord(
  a: {
    NationalCode?: unknown;
    NameFamily?: unknown;
    CityName?: unknown;
    Role?: unknown;
    key?: {
      NationalCode?: unknown;
      NameFamily?: unknown;
      CityName?: unknown;
    };
  } | null | undefined,
  b: {
    NationalCode?: unknown;
    NameFamily?: unknown;
    CityName?: unknown;
    Role?: unknown;
    key?: {
      NationalCode?: unknown;
      NameFamily?: unknown;
      CityName?: unknown;
    };
  } | null | undefined,
): boolean {
  if (!a || !b) return false;
  const codeA = String(a.NationalCode ?? a.key?.NationalCode ?? "");
  const codeB = String(b.NationalCode ?? b.key?.NationalCode ?? "");
  if (!codeA || codeA !== codeB) return false;

  return (
    String(a.NameFamily ?? a.key?.NameFamily ?? "") ===
      String(b.NameFamily ?? b.key?.NameFamily ?? "") &&
    String(a.CityName ?? a.key?.CityName ?? "") ===
      String(b.CityName ?? b.key?.CityName ?? "") &&
    String(a.Role ?? "") === String(b.Role ?? "")
  );
}

/** True when details panel drilled into a single calendar day. */
export function isSingleDayPersonnelSelection(
  person: { periodType?: string; Start_Date?: string } | null | undefined,
): boolean {
  if (!person?.Start_Date) return false;
  if (person.periodType && person.periodType !== "روزانه") return false;
  return /^\d{4}\/\d{2}\/\d{2}$/.test(person.Start_Date);
}

export function distinctDataAndCalculatePerformance(
  data,
  groupBy = ["CityName"],
  values = [
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
    "COUNT",
    "TotalPerformance",
    "DirectPerFormance",
    "InDirectPerFormance",
  ],
  where = {},
  workDays?: number | null,
) {
  // const dataWithThurdsdayEdit = data?.result?.map((item) => {
  //   const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;
  //   // const count = item.COUNT > 0 ? item.COUNT : 1;
  //   return {
  //     ...item,
  //     TotalPerformance: isThursday
  //       ? calculatePerformance(item, 1, 2)
  //       : item.TotalPerformance,
  //   };
  // });

  const citiesWithPerformanceData = processDataForChart({
    rawData: data?.result ?? [],
    groupBy,
    values,
    where,
    options: {
      max: ["COUNT"],
      dedupeBy: [...PERSONNEL_PERFORMANCE_DEDUPE_BY],
    },
  });
  console.log({ citiesWithPerformanceData });
  const r = mapToCitiesWithPerformance({
    dateLengthPerCity: data?.dateLength,
    result: citiesWithPerformanceData,
    workDays,
  });
  return r;
}

/** True when aggregating a single calendar day — work-days divisor must not apply. */
export function isDayLevelPerformanceQuery(
  groupBy: string | string[],
  where: Record<string, unknown> = {},
): boolean {
  const groupByKeys = Array.isArray(groupBy) ? groupBy : [groupBy];
  if (groupByKeys.includes("Start_Date")) return true;

  const startDateFilter = where.Start_Date;
  if (startDateFilter == null || startDateFilter === "") return false;
  if (typeof startDateFilter === "string") return true;
  if (Array.isArray(startDateFilter) && startDateFilter.length === 1) return true;

  return false;
}

export function distinctPersonnelPerformanceData(
  data = {
    periodType: "",
    dateLength: {},
    result: [],
  },
  groupBy = ["CityName"],
  values = [
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
    "TotalPerformance",
    "RealCityName",
  ],
  where = {},
  workDays?: number | null,
) {
  // const dataWithThurdsdayEdit = data?.result?.map((item) => {
  //   const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

  //   // const count = item.COUNT > 0 ? item.COUNT : 1;
  //   return {
  //     ...item,

  //     TotalPerformance: 5,
  //   };
  // });
  return processDataForChart({
    rawData: data?.result ?? [],
    groupBy,
    values,
    where,
    options: {
      dedupeBy: [...PERSONNEL_PERFORMANCE_DEDUPE_BY],
    },
  }).map((item) => {
    // Work-days divisor applies only to period-level aggregation, not single-day views
    const divisor =
      workDays && !isDayLevelPerformanceQuery(groupBy, where)
        ? workDays
        : item.key.rowCount;

    // Derive performance from visible aggregated counts so UI always matches formula(counts)
    const dateLength = divisor > 0 ? divisor : 1;
    const DirectPerFormance = calculateDirectPerformance(item, dateLength);
    const InDirectPerFormance = calculateInDirectPerformance(item, dateLength);

    return {
      ...item,
      ...item.key, // groupBy identity (NationalCode, NameFamily, …) must win over aggregated values
      DirectPerFormance,
      InDirectPerFormance,
      TotalPerformance: DirectPerFormance + InDirectPerFormance,
    };
  });
}
function mapToCitiesWithPerformance({
  dateLengthPerCity,
  result,
  workDays,
}: {
  dateLengthPerCity: any;
  result: any[];
  workDays?: number | null;
}): CityWithPerformanceData[] {
  return result.map((item) => {
    // const personnelCount = result.find(
    //   (a) => a.key.CityName === item.key.CityName,
    // ).COUNT;
    // console.log({ item });
    // const maxCount = Math.max(
    //   result.filter((a) => a.CityName === item.key).map((a) => a.COUNT),
    // );
    // Use work days if provided, otherwise use COUNT
    // this count is max count of people who has shown up to work for that city
    let workDaysCountForCities = workDays ? workDays * item.COUNT : null;

    const divisor = workDaysCountForCities || item.COUNTTotal;

    return {
      CityName_En: item.key.CityName,
      CityName_Fa: getEnglishToPersianCity(item.key.CityName),
      TotalPerformance: item.TotalPerformance / divisor,
      DirectPerFormance: item.DirectPerFormance / divisor,
      InDirectPerFormance: item.InDirectPerFormance / divisor,
      // calculatePerformance(item, data?.dateLength) /
      // Math.max(
      //   ...data?.result
      //     .filter((a) => a.CityName === item.key)
      //     .map((a) => a.COUNT),
      // ),
    };
  });
}

export function sparkChartForPersonnel(
  data = [],
  propertyToCheck,
  valueToCheck,
  selectExtraProperty = [],
  additionalFilters?: Record<string, any>, // Add optional additional filters to match aggregation grouping
) {
  const filtered = (data ?? []).filter((a: any) => {
    if (!matchesPersonnelSparkFilter(a, propertyToCheck, valueToCheck)) {
      return false;
    }

    if (!isPersonnelWorkingDay(a.HasTheDayOff)) {
      return false;
    }

    if (additionalFilters) {
      return Object.entries(additionalFilters).every(([key, value]) =>
        matchesPersonnelSparkFilter(a, key, value),
      );
    }

    return true;
  });

  // Dedupe only this person's rows (removes users_info role duplicates per day/branch)
  const dedupedData = dedupePersonnelPerformanceRows(filtered);

  return dedupedData.map((item: any) => {
    const DirectPerFormance = calculateDirectPerformance(item, 1);
    const InDirectPerFormance = calculateInDirectPerformance(item, 1);
    const TotalPerformance = DirectPerFormance + InDirectPerFormance;

    return {
      TotalPerformance,
      DirectPerFormance,
      InDirectPerFormance,
      Start_Date: item.Start_Date,
      Benchmark: 75,
      Benchmark2: 120,
      ...selectExtraProperty.reduce((acc: any, curr) => {
        acc[curr] = item[curr];
        return acc;
      }, {}),
    };
  });
}

export function sparkChartForCity(
  data = [],
  propertyToCheck,
  valueToCheck,
  relatedCities?: string[],
) {
  const normalizedTarget = normalizeCityName(valueToCheck);
  const relatedCitySet =
    relatedCities && relatedCities.length > 0
      ? new Set(relatedCities.map((city) => normalizeCityName(city)))
      : null;

  const filteredData = data?.filter((item: any) => {
    const rowValue = normalizeCityName(item?.[propertyToCheck]);
    if (relatedCitySet) return relatedCitySet.has(rowValue);
    return rowValue === normalizedTarget;
  });

  if (!relatedCitySet) {
    return filteredData?.map((item: any) => ({
      TotalPerformance: item.TotalPerformance,
      Start_Date: item.Start_Date,
      Benchmark: 75,
      Benchmark2: 120,
    }));
  }

  const totalsByDate = filteredData.reduce((acc: Record<string, number>, item: any) => {
    const startDate = item?.Start_Date;
    if (!startDate) return acc;
    acc[startDate] = (acc[startDate] || 0) + (item?.TotalPerformance || 0);
    return acc;
  }, {});

  return Object.entries(totalsByDate).map(([Start_Date, TotalPerformance]) => ({
    TotalPerformance,
    Start_Date,
    Benchmark: 75,
    Benchmark2: 120,
  }));
}

/**
 * Debug function to compare sparkData TotalPerformance sum with aggregated total
 * Call this in the browser console with the selectedPerson object
 */
export function debugTotalPerformanceMismatch(selectedPerson: any) {
  if (!selectedPerson) {
    console.warn("selectedPerson is not provided");
    return;
  }

  const sparkDataSum =
    selectedPerson.sparkData?.reduce(
      (sum: number, item: any) => sum + (item.TotalPerformance || 0),
      0,
    ) || 0;

  const aggregatedTotal = selectedPerson.total || 0;
  const aggregatedAverage = selectedPerson.TotalPerformance || 0;
  const rowCount = selectedPerson.key?.rowCount || selectedPerson.rowCount || 0;

  console.group("🔍 TotalPerformance Debug");
  console.log("Person:", {
    NameFamily: selectedPerson.NameFamily,
    NationalCode: selectedPerson.NationalCode,
    CityName: selectedPerson.CityName,
  });
  console.log("📊 SparkData:", {
    itemCount: selectedPerson.sparkData?.length || 0,
    sum: sparkDataSum,
    items: selectedPerson.sparkData?.map((item: any) => ({
      Start_Date: item.Start_Date,
      TotalPerformance: item.TotalPerformance,
    })),
  });
  console.log("📈 Aggregated Data:", {
    total: aggregatedTotal,
    average: aggregatedAverage,
    rowCount: rowCount,
    expectedAverage: rowCount > 0 ? aggregatedTotal / rowCount : 0,
  });
  console.log("🔢 Difference:", {
    absolute: Math.abs(aggregatedTotal - sparkDataSum),
    percentage:
      aggregatedTotal > 0
        ? (
            (Math.abs(aggregatedTotal - sparkDataSum) / aggregatedTotal) *
            100
          ).toFixed(2) + "%"
        : "N/A",
  });

  if (Math.abs(aggregatedTotal - sparkDataSum) > 0.01) {
    console.warn("⚠️ MISMATCH DETECTED!");
    console.log("Possible causes:");
    console.log("1. Different data sources (getAll.data vs aggregated data)");
    console.log(
      "2. Records with HasTheDayOff=true included in aggregation but not in sparkData",
    );
    console.log("3. Multiple records per day being summed in aggregation");
    console.log(
      "4. Data filtering differences between processDataForChart and sparkChartForPersonnel",
    );
  } else {
    console.log("✅ Values match!");
  }
  console.groupEnd();

  return {
    sparkDataSum,
    aggregatedTotal,
    difference: Math.abs(aggregatedTotal - sparkDataSum),
    rowCount,
  };
}

export const getPerformanceMetric = (limit) => {
  // Find the first metric that matches the condition
  const selectedMetric = Performance_Levels_Gauge.find(
    (metric) => limit <= metric.limit,
  );

  // If nothing is found, return the last metric
  return (
    selectedMetric ||
    Performance_Levels_Gauge[Performance_Levels_Gauge.length - 1]
  );
};

export function getMonthNamesFromJOINED_date_strings(
  dates: string,
  reportPeriod: PeriodType,
) {
  if (!dates || typeof dates !== "string" || dates.trim() === "") return "";

  if (reportPeriod === "هفتگی") {
    const datesSplitted = dates.split(",");
    // if (datesSplitted.length >= 2)
    //   return `${datesSplitted[0]} ~ ${datesSplitted[datesSplitted.length - 1]}`;
    // return dates;
    const date = datesSplitted[datesSplitted.length - 1] ?? "";

    const weekNumber = getWeekOfMonth(date);
    const weekName = `هفته ${weekNumber} ${getMonthName(date)}`;

    return weekName;
  } else if (reportPeriod === "ماهانه") {
    const resultArray = dates.split(",").map(getMonthName);

    return [...new Set(resultArray)].join(",");
  } else return dates;
}
