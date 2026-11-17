"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import moment from "jalali-moment";
import { toast } from "sonner";
import {
  PersonnelPerformanceContextType,
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
  type SelectDefaults,
} from "~/app/v2/dashboard/personnel_performance/chart/model";

const PersonnelPerformanceContext = createContext<
  PersonnelPerformanceContextType | undefined
>(undefined);

export function usePersonnelPerformance() {
  const context = useContext(PersonnelPerformanceContext);
  if (context === undefined) {
    throw new Error(
      "usePersonnelPerformance must be used within a PersonnelPerformanceProvider",
    );
  }
  return context;
}

function buildSystemFilters(period: PeriodType = "روزانه"): FilterType {
  const system = systemSelectDefaults();
  return {
    periodType: period,
    filter: {
      ProjectType: [...system.project],
      Role: [...system.role],
      ContractType: [...system.contract],
      RoleType: [...system.role_type],
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
  };
}

function buildNoNetworkFilters(defaults: SelectDefaults, period: PeriodType) {
  return {
    periodType: period,
    filter: {
      ContractType: [...defaults.contract],
      Role: [...defaults.role],
      RoleType: [...defaults.role_type],
    },
  };
}

function applySelectDefaults(
  prev: FilterType,
  defaults: SelectDefaults,
): FilterType {
  return {
    periodType: defaults.period,
    filter: {
      ...prev.filter,
      ProjectType: [...defaults.project],
      ContractType: [...defaults.contract],
      Role: [...defaults.role],
      RoleType: [...defaults.role_type],
    },
  };
}

interface PersonnelPerformanceProviderProps {
  children: React.ReactNode;
}

export function PersonnelPerformanceProvider({
  children,
}: PersonnelPerformanceProviderProps) {
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("روزانه");
  const [toggleDistinctData, setToggleDistinctData] = useState<
    "Distincted" | "Pure"
  >("Distincted");

  const [filters, setDataFilters] = useState<FilterType>(() =>
    buildSystemFilters("روزانه"),
  );

  const [filtersWithNoNetworkRequest, setFiltersWithNoNetworkRequest] =
    useState(() =>
      buildNoNetworkFilters(systemSelectDefaults(), "روزانه"),
    );

  const [savedDefaults, setSavedDefaults] = useState<SelectDefaults | null>(
    null,
  );

  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<FilterType>(filters);

  // Hydrate saved defaults once on the client (same storage key as chart/v2).
  useEffect(() => {
    const saved = readSavedDefaults();
    setSavedDefaults(saved);
    if (!saved) return;

    setReportPeriod(saved.period);
    setDataFilters((prev) => applySelectDefaults(prev, saved));
    setFiltersWithNoNetworkRequest(
      buildNoNetworkFilters(saved, saved.period),
    );
  }, []);

  useEffect(() => {
    setDataFilters((prev) => ({
      ...prev,
      periodType: reportPeriod,
    }));
    setFiltersWithNoNetworkRequest((prev) => ({
      ...prev,
      periodType: reportPeriod,
    }));
  }, [reportPeriod]);

  const memoizedSetDataFilters = useCallback((newFilters: any) => {
    if (typeof newFilters === "function") {
      setDataFilters(newFilters);
    } else {
      setDataFilters(newFilters);
    }
  }, []);

  const memoizedSetToggleDistinctData = useCallback((newToggle: any) => {
    if (typeof newToggle === "function") {
      setToggleDistinctData(newToggle);
    } else {
      setToggleDistinctData(newToggle);
    }
  }, []);

  const memoizedSetFiltersWithNoNetworkRequest = useCallback(
    (newFilters: any) => {
      if (typeof newFilters === "function") {
        setFiltersWithNoNetworkRequest(newFilters);
      } else {
        setFiltersWithNoNetworkRequest(newFilters);
      }
    },
    [],
  );

  const saveCurrentAsDefaults = useCallback(
    (workDays: boolean) => {
      const next: SelectDefaults = {
        period: reportPeriod,
        project: filters.filter.ProjectType ?? [...defaultProjectTypes],
        contract:
          filtersWithNoNetworkRequest?.filter?.ContractType ??
          filters.filter.ContractType ??
          [...defualtContractTypes],
        role:
          filtersWithNoNetworkRequest?.filter?.Role ??
          filters.filter.Role ??
          [...defualtRoles],
        role_type:
          filtersWithNoNetworkRequest?.filter?.RoleType ??
          filters.filter.RoleType ??
          getDefaultRoleTypesBaseOnContractType([
            ...(filters.filter.ContractType ?? defualtContractTypes),
          ]),
        work_days: workDays,
      };
      writeSavedDefaults(next);
      setSavedDefaults(next);
      toast.success("پیش‌فرض فیلترها ذخیره شد");
    },
    [filters, filtersWithNoNetworkRequest, reportPeriod],
  );

  const resetToSystemDefaults = useCallback(
    (setWorkDays: (value: boolean) => void) => {
      clearSavedDefaults();
      setSavedDefaults(null);
      const system = systemSelectDefaults();
      setReportPeriod(system.period);
      setDataFilters((prev) => applySelectDefaults(prev, system));
      setFiltersWithNoNetworkRequest(
        buildNoNetworkFilters(system, system.period),
      );
      setWorkDays(system.work_days);
      toast.success("پیش‌فرض‌های سیستم اعمال شد");
    },
    [],
  );

  const applySavedOrSystemDefaults = useCallback(
    (setWorkDays: (value: boolean) => void) => {
      const defaults = savedDefaults ?? systemSelectDefaults();
      setReportPeriod(defaults.period);
      setDataFilters((prev) => applySelectDefaults(prev, defaults));
      setFiltersWithNoNetworkRequest(
        buildNoNetworkFilters(defaults, defaults.period),
      );
      setWorkDays(defaults.work_days);
      toast.success("پیش‌فرض‌ها اعمال شد");
    },
    [savedDefaults],
  );

  const value: PersonnelPerformanceContextType = {
    reportPeriod,
    setReportPeriod,
    filters,
    setDataFilters: memoizedSetDataFilters,
    toggleDistinctData,
    setToggleDistinctData: memoizedSetToggleDistinctData,
    filtersWithNoNetworkRequest,
    setFiltersWithNoNetworkRequest: memoizedSetFiltersWithNoNetworkRequest,
    isFiltering,
    setIsFiltering,
    optimisticFilters,
    setOptimisticFilters,
    hasSavedDefaults: Boolean(savedDefaults),
    saveCurrentAsDefaults,
    resetToSystemDefaults,
    applySavedOrSystemDefaults,
  };

  return (
    <PersonnelPerformanceContext.Provider value={value}>
      {children}
    </PersonnelPerformanceContext.Provider>
  );
}
