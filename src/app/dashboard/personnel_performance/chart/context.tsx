"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import moment from "jalali-moment";
import { toast } from "sonner";
import {
  PersonnelPerformanceChartContextType,
  FilterType,
  PeriodType,
} from "./types";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import {
  clearSavedDefaults,
  readSavedDefaults,
  systemSelectDefaults,
  writeSavedDefaults,
  type ListSortOrder,
  type SelectDefaults,
} from "~/app/v2/dashboard/personnel_performance/chart/model";

const PersonnelPerformanceChartContext = createContext<
  PersonnelPerformanceChartContextType | undefined
>(undefined);

export function usePersonnelPerformanceChart() {
  const context = useContext(PersonnelPerformanceChartContext);
  if (context === undefined) {
    throw new Error(
      "usePersonnelPerformanceChart must be used within a PersonnelPerformanceChartProvider",
    );
  }
  return context;
}

function buildSystemFilters(period: PeriodType = "ماهانه"): FilterType {
  const system = systemSelectDefaults();
  return {
    periodType: period,
    filter: {
      ProjectType: [...system.project],
      ContractType: [...system.contract],
      Role: [...system.role],
      RoleType: [...system.role_type],
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
  };
}

function applySelectDefaultsToFilters(
  prev: FilterType,
  defaults: SelectDefaults,
  options?: { clearExtra?: boolean },
): FilterType {
  return {
    periodType: defaults.period,
    filter: {
      ...prev.filter,
      ProjectType: [...defaults.project],
      ContractType: [...defaults.contract],
      Role: [...defaults.role],
      RoleType: [...defaults.role_type],
      ...(options?.clearExtra
        ? {
            TownName: [],
            BranchName: [],
            BranchCode: [],
            BranchType: [],
          }
        : {}),
    },
  };
}

interface PersonnelPerformanceChartProviderProps {
  children: React.ReactNode;
}

export function PersonnelPerformanceChartProvider({
  children,
}: PersonnelPerformanceChartProviderProps) {
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("ماهانه");
  const [toggleDistinctData, setToggleDistinctData] = useState<
    "Distincted" | "Pure"
  >("Distincted");
  const [filters, setDataFilters] = useState<FilterType>(() =>
    buildSystemFilters("ماهانه"),
  );
  const [savedDefaults, setSavedDefaults] = useState<SelectDefaults | null>(
    null,
  );
  const [citiesSort, setCitiesSort] = useState<ListSortOrder>(
    () => systemSelectDefaults().cities_sort,
  );
  const [personnelSort, setPersonnelSort] = useState<ListSortOrder>(
    () => systemSelectDefaults().personnel_sort,
  );

  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<FilterType>(filters);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"cities" | "city-detail">(
    "cities",
  );

  // Hydrate saved defaults once on the client (same storage key as v2).
  useEffect(() => {
    const saved = readSavedDefaults();
    setSavedDefaults(saved);
    if (!saved) return;

    setReportPeriod(saved.period);
    setDataFilters((prev) => applySelectDefaultsToFilters(prev, saved));
    setCitiesSort(saved.cities_sort);
    setPersonnelSort(saved.personnel_sort);
  }, []);

  useEffect(() => {
    setDataFilters((prev) => ({
      ...prev,
      periodType: reportPeriod,
    }));
  }, [reportPeriod]);

  const saveCurrentAsDefaults = useCallback(
    (workDays: boolean) => {
      const next: SelectDefaults = {
        period: reportPeriod,
        project: filters.filter.ProjectType ?? [...defaultProjectTypes],
        contract: filters.filter.ContractType ?? [...defualtContractTypes],
        role: filters.filter.Role ?? [...defualtRoles],
        role_type:
          filters.filter.RoleType ??
          getDefaultRoleTypesBaseOnContractType([
            ...(filters.filter.ContractType ?? defualtContractTypes),
          ]),
        work_days: workDays,
        cities_sort: citiesSort,
        personnel_sort: personnelSort,
      };
      writeSavedDefaults(next);
      setSavedDefaults(next);
      toast.success("پیش‌فرض فیلترها ذخیره شد");
    },
    [citiesSort, filters, personnelSort, reportPeriod],
  );

  const resetToSystemDefaults = useCallback(
    (setWorkDays: (value: boolean) => void) => {
      clearSavedDefaults();
      setSavedDefaults(null);
      const nextSystem = systemSelectDefaults();
      setReportPeriod(nextSystem.period);
      setDataFilters((prev) =>
        applySelectDefaultsToFilters(prev, nextSystem, { clearExtra: true }),
      );
      setWorkDays(nextSystem.work_days);
      setCitiesSort(nextSystem.cities_sort);
      setPersonnelSort(nextSystem.personnel_sort);
      toast.success("پیش‌فرض‌های سیستم اعمال شد");
    },
    [],
  );

  const applySavedOrSystemDefaults = useCallback(
    (setWorkDays: (value: boolean) => void) => {
      const defaults = savedDefaults ?? systemSelectDefaults();
      setReportPeriod(defaults.period);
      setDataFilters((prev) => applySelectDefaultsToFilters(prev, defaults));
      setWorkDays(defaults.work_days);
      setCitiesSort(defaults.cities_sort);
      setPersonnelSort(defaults.personnel_sort);
      toast.success("پیش‌فرض‌ها اعمال شد");
    },
    [savedDefaults],
  );

  const value: PersonnelPerformanceChartContextType = {
    reportPeriod,
    setReportPeriod,
    filters,
    setDataFilters: (newFilters) => {
      if (typeof newFilters === "function") {
        setDataFilters(newFilters);
      } else {
        setDataFilters(newFilters);
      }
    },
    toggleDistinctData,
    setToggleDistinctData: (newToggle) => {
      if (typeof newToggle === "function") {
        setToggleDistinctData(newToggle);
      } else {
        setToggleDistinctData(newToggle);
      }
    },
    isFiltering,
    setIsFiltering,
    optimisticFilters,
    setOptimisticFilters,
    selectedCity,
    setSelectedCity,
    chartView,
    setChartView,
    hasSavedDefaults: Boolean(savedDefaults),
    saveCurrentAsDefaults,
    resetToSystemDefaults,
    applySavedOrSystemDefaults,
    citiesSort,
    setCitiesSort,
    personnelSort,
    setPersonnelSort,
  };

  return (
    <PersonnelPerformanceChartContext.Provider value={value}>
      {children}
    </PersonnelPerformanceChartContext.Provider>
  );
}
