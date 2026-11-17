"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { keepPreviousData } from "@tanstack/react-query";
import moment from "jalali-moment";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useUrlParams } from "~/hooks/use-url-params";
import { sortDates } from "~/lib/utils";
import {
  calendarToPeriod,
  clearSavedDefaults,
  legacyRoleTypeDefault,
  periodToCalendar,
  readSavedDefaults,
  resolveInitialFilters,
  sameStringArrays,
  systemSelectDefaults,
  toApiFilters,
  withV1QueryDefaults,
  writeSavedDefaults,
  type CalendarPeriod,
  type ChartFilterValues,
  type ChartSearchParams,
  type ListSortOrder,
  type PeriodType,
  type SelectDefaults,
} from "./model";

type FiltersContextValue = {
  filters: ChartFilterValues;
  apiFilters: ReturnType<typeof toApiFilters>;
  canFetch: boolean;
  period: PeriodType;
  calendarPeriod: CalendarPeriod;
  useWorkDays: boolean;
  totalWorkDays: number | null;
  optionLists: {
    projectTypes: string[];
    roles: string[];
    contractTypes: string[];
    roleTypes: string[];
    dateInfos: string[];
    townNames: string[];
    branchNames: string[];
    branchCodes: string[];
    branchTypes: string[];
  };
  isOptionsLoading: boolean;
  isCitiesLoading: boolean;
  isCitiesFetching: boolean;
  citiesQuery: {
    data: unknown;
    isLoading: boolean;
    isFetching: boolean;
  };
  updateFilter: <K extends keyof ChartFilterValues>(
    key: K,
    value: ChartFilterValues[K],
  ) => void;
  updateFilters: (patch: Partial<ChartFilterValues>) => void;
  handleCalendarSubmit: (params: {
    reportPeriod: CalendarPeriod;
    selectedDates: string[];
  }) => void;
  saveCurrentAsDefaults: () => void;
  resetToSystemDefaults: () => void;
  applySavedOrSystemDefaults: () => void;
  hasSavedDefaults: boolean;
  citiesSort: ListSortOrder;
  setCitiesSort: (order: ListSortOrder) => void;
  personnelSort: ListSortOrder;
  setPersonnelSort: (order: ListSortOrder) => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function useChartFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useChartFilters must be used within ChartFiltersProvider");
  }
  return context;
}

function searchParamsToChartParams(
  searchParams: URLSearchParams,
): ChartSearchParams {
  return {
    period: searchParams.get("period") ?? undefined,
    dates: searchParams.get("dates") ?? undefined,
    project: searchParams.get("project") ?? undefined,
    contract: searchParams.get("contract") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    role_type: searchParams.get("role_type") ?? undefined,
    date_info: searchParams.get("date_info") ?? undefined,
    town: searchParams.get("town") ?? undefined,
    branch: searchParams.get("branch") ?? undefined,
    branch_code: searchParams.get("branch_code") ?? undefined,
    branch_type: searchParams.get("branch_type") ?? undefined,
    work_days: searchParams.get("work_days") ?? undefined,
  };
}

export function ChartFiltersProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [savedDefaults, setSavedDefaults] = useState<SelectDefaults | null>(
    null,
  );
  const [citiesSort, setCitiesSort] = useState<ListSortOrder>(
    () => systemSelectDefaults().cities_sort,
  );
  const [personnelSort, setPersonnelSort] = useState<ListSortOrder>(
    () => systemSelectDefaults().personnel_sort,
  );
  const [hydratedDefaults, setHydratedDefaults] = useState(false);
  const appliedDateInfoDefault = useRef(false);
  const seededFromUrl = useRef(false);

  const chartSearchParams = useMemo(
    () => searchParamsToChartParams(searchParams),
    [searchParams],
  );

  useEffect(() => {
    const saved = readSavedDefaults();
    setSavedDefaults(saved);
    if (saved) {
      setCitiesSort(saved.cities_sort);
      setPersonnelSort(saved.personnel_sort);
    }
    setHydratedDefaults(true);
  }, []);

  const initialFilters = useMemo(
    () => resolveInitialFilters(chartSearchParams, null),
    // Seed once from the first URL snapshot; later updates go through useUrlParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { params, updateParam, updateParams } =
    useUrlParams<ChartFilterValues>(initialFilters, { debounceMs: 0 });

  useEffect(() => {
    if (!hydratedDefaults || seededFromUrl.current) return;
    seededFromUrl.current = true;

    const urlHasSelects =
      Boolean(chartSearchParams.project) ||
      Boolean(chartSearchParams.contract) ||
      Boolean(chartSearchParams.role) ||
      Boolean(chartSearchParams.role_type) ||
      Boolean(chartSearchParams.period) ||
      chartSearchParams.work_days !== undefined;

    if (urlHasSelects) return;

    const saved = savedDefaults;
    if (!saved) return;

    updateParams({
      period: saved.period,
      project: saved.project,
      contract: saved.contract,
      role: saved.role,
      role_type: saved.role_type,
      work_days: saved.work_days,
    });
  }, [hydratedDefaults, savedDefaults, chartSearchParams, updateParams]);

  const defaultDateQuery = api.personnel.getDefualtDateInfo.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const optionsDateInfo = useMemo(() => {
    if (params.date_info.length) return params.date_info;
    if (typeof defaultDateQuery.data === "string") {
      return [defaultDateQuery.data];
    }
    return undefined;
  }, [params.date_info, defaultDateQuery.data]);

  const optionsQuery = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        ProjectType: params.project.length ? params.project : undefined,
        DateInfo: optionsDateInfo,
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    },
  );

  const optionLists = useMemo(() => {
    const data = optionsQuery.data;
    const dateInfos = sortDates({
      dates: [
        ...new Set(
          (data?.DateInfos ?? [])
            .map((row: { DateInfo?: string | null }) => row.DateInfo)
            .filter((value): value is string => Boolean(value)),
        ),
      ],
    });

    const usersInfo = (data?.usersInfo ?? []) as Array<{
      Role?: string | null;
      ContractType?: string | null;
      RoleType?: string | null;
    }>;

    return {
      projectTypes: ((data?.ProjectTypes ?? []) as string[]).filter(
        (type) => type && type.trim() !== "",
      ),
      roles: [
        ...new Set(
          usersInfo
            .map((row) => row.Role)
            .filter((value): value is string => Boolean(value?.trim())),
        ),
      ] as string[],
      contractTypes: [
        ...new Set(
          usersInfo
            .map((row) => row.ContractType)
            .filter((value): value is string => Boolean(value)),
        ),
      ] as string[],
      roleTypes: [
        ...new Set(
          usersInfo
            .map((row) => row.RoleType)
            .filter((value): value is string => Boolean(value)),
        ),
      ] as string[],
      dateInfos,
      townNames: (data?.TownNames ?? []) as string[],
      branchNames: (data?.BranchNames ?? []) as string[],
      branchCodes: (data?.BranchCodes ?? []) as string[],
      branchTypes: (data?.BranchTypes ?? []) as string[],
    };
  }, [optionsQuery.data]);

  useEffect(() => {
    if (appliedDateInfoDefault.current) return;
    if (params.date_info.length > 0) {
      appliedDateInfoDefault.current = true;
      return;
    }
    // Prefer the dedicated default-date endpoint (faster) before options list.
    const fallback =
      typeof defaultDateQuery.data === "string"
        ? defaultDateQuery.data
        : undefined;
    const latest = optionLists.dateInfos[optionLists.dateInfos.length - 1];
    const next = fallback ?? latest;
    if (!next) return;
    appliedDateInfoDefault.current = true;
    updateParam("date_info", [next]);
  }, [
    optionLists.dateInfos,
    params.date_info.length,
    defaultDateQuery.data,
    updateParam,
  ]);

  const resolvedDateInfo = useMemo(() => {
    if (params.date_info.length > 0) return params.date_info;
    if (typeof defaultDateQuery.data === "string") {
      return [defaultDateQuery.data];
    }
    const latest = optionLists.dateInfos[optionLists.dateInfos.length - 1];
    return latest ? [latest] : [];
  }, [params.date_info, defaultDateQuery.data, optionLists.dateInfos]);

  // v1 usePersonnelChart always enables getCitiesWithPerformance once context has
  // Start_Date; DateInfo is `filters.DateInfo ?? [defualtDateInfo.data]` and may
  // briefly be undefined (generateWhereClause skips empty/nullish arrays).
  // Requiring resolvedDateInfo here left the UI stuck on "در انتظار فیلترها" when
  // the default-date query was slow/empty — match v1 and fetch on dates alone.
  const canFetch = params.dates.length > 0;

  // Drop legacy v2 RoleType whitelist from URL/state (v1 had no RoleType filter).
  useEffect(() => {
    if (!params.role_type.length) return;
    if (!sameStringArrays(params.role_type, legacyRoleTypeDefault())) return;
    updateParam("role_type", []);
  }, [params.role_type, updateParam]);

  const apiFilters = useMemo(
    () => withV1QueryDefaults(toApiFilters(params), resolvedDateInfo),
    [params, resolvedDateInfo],
  );

  const monthsArray = useMemo(() => {
    if (params.period !== "ماهانه" || !params.dates.length) return [];
    const months: { year: number; month: number }[] = [];
    for (const dateStr of params.dates) {
      try {
        const momentDate = moment(dateStr, "jYYYY/jMM/jDD");
        months.push({
          year: momentDate.jYear(),
          month: momentDate.jMonth() + 1,
        });
      } catch {
        // ignore invalid date
      }
    }
    return months;
  }, [params.period, params.dates]);

  const workDaysQuery = api.monthWorkDays.getTotalWorkDays.useQuery(
    { months: monthsArray },
    {
      enabled: monthsArray.length > 0,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  const citiesQuery =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: apiFilters.periodType,
        filter: apiFilters.filter,
      },
      {
        enabled: canFetch,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
      },
    );

  const updateFilter = useCallback(
    <K extends keyof ChartFilterValues>(
      key: K,
      value: ChartFilterValues[K],
    ) => {
      updateParam(key, value);
    },
    [updateParam],
  );

  const handleCalendarSubmit = useCallback(
    ({
      reportPeriod,
      selectedDates,
    }: {
      reportPeriod: CalendarPeriod;
      selectedDates: string[];
    }) => {
      updateParams({
        period: calendarToPeriod(reportPeriod),
        dates: selectedDates,
      });
    },
    [updateParams],
  );

  const saveCurrentAsDefaults = useCallback(() => {
    const next: SelectDefaults = {
      period: params.period,
      project: params.project,
      contract: params.contract,
      role: params.role,
      role_type: params.role_type,
      work_days: params.work_days,
      cities_sort: citiesSort,
      personnel_sort: personnelSort,
    };
    writeSavedDefaults(next);
    setSavedDefaults(next);
    toast.success("پیش‌فرض فیلترها ذخیره شد");
  }, [citiesSort, params, personnelSort]);

  const resetToSystemDefaults = useCallback(() => {
    clearSavedDefaults();
    setSavedDefaults(null);
    const system = systemSelectDefaults();
    updateParams({
      period: system.period,
      project: system.project,
      contract: system.contract,
      role: system.role,
      role_type: system.role_type,
      work_days: system.work_days,
      dates: params.dates,
      date_info: params.date_info,
      town: [],
      branch: [],
      branch_code: [],
      branch_type: [],
    });
    setCitiesSort(system.cities_sort);
    setPersonnelSort(system.personnel_sort);
    toast.success("پیش‌فرض‌های سیستم اعمال شد");
  }, [params.dates, params.date_info, updateParams]);

  const applySavedOrSystemDefaults = useCallback(() => {
    const defaults = savedDefaults ?? systemSelectDefaults();
    updateParams({
      period: defaults.period,
      project: defaults.project,
      contract: defaults.contract,
      role: defaults.role,
      role_type: defaults.role_type,
      work_days: defaults.work_days,
      dates: params.dates,
      date_info: params.date_info,
    });
    setCitiesSort(defaults.cities_sort);
    setPersonnelSort(defaults.personnel_sort);
    toast.success("پیش‌فرض‌ها اعمال شد");
  }, [savedDefaults, params.dates, params.date_info, updateParams]);

  const value = useMemo<FiltersContextValue>(
    () => ({
      filters: params,
      apiFilters,
      canFetch,
      period: params.period,
      calendarPeriod: periodToCalendar(params.period),
      useWorkDays: params.work_days,
      totalWorkDays: workDaysQuery.data?.totalWorkDays ?? null,
      optionLists,
      isOptionsLoading: optionsQuery.isLoading && !optionsQuery.data,
      isCitiesLoading:
        canFetch && citiesQuery.isLoading && !citiesQuery.data,
      isCitiesFetching: canFetch && citiesQuery.isFetching,
      citiesQuery,
      updateFilter,
      updateFilters: updateParams,
      handleCalendarSubmit,
      saveCurrentAsDefaults,
      resetToSystemDefaults,
      applySavedOrSystemDefaults,
      hasSavedDefaults: Boolean(savedDefaults),
      citiesSort,
      setCitiesSort,
      personnelSort,
      setPersonnelSort,
    }),
    [
      params,
      apiFilters,
      canFetch,
      workDaysQuery.data?.totalWorkDays,
      optionLists,
      optionsQuery.isLoading,
      optionsQuery.data,
      citiesQuery,
      updateFilter,
      updateParams,
      handleCalendarSubmit,
      saveCurrentAsDefaults,
      resetToSystemDefaults,
      applySavedOrSystemDefaults,
      savedDefaults,
      citiesSort,
      personnelSort,
    ],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}
