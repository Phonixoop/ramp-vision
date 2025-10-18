"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import moment from "jalali-moment";
import {
  PersonnelPerformanceContextType,
  FilterType,
  PeriodType,
} from "./types";
import {
  defaultProjectTypes,
  defualtContractTypes,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";

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

interface PersonnelPerformanceProviderProps {
  children: React.ReactNode;
}

export function PersonnelPerformanceProvider({
  children,
}: PersonnelPerformanceProviderProps) {
  // Report period state
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("روزانه");

  // Toggle state for distinct data
  const [toggleDistinctData, setToggleDistinctData] = useState<
    "Distincted" | "Pure"
  >("Distincted");

  // Filters state
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: reportPeriod,
    filter: {
      ProjectType: defaultProjectTypes,
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
  });

  // Filters without network request
  const [filtersWithNoNetworkRequest, setFiltersWithNoNetworkRequest] =
    useState({
      periodType: reportPeriod,
      filter: {
        ContractType: defualtContractTypes,
        RoleTypes: getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
      },
    });

  // Optimistic filtering state
  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<FilterType>(filters);

  // Update report period in filters when it changes
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

  const value: PersonnelPerformanceContextType = {
    reportPeriod,
    setReportPeriod,
    filters,
    setDataFilters: memoizedSetDataFilters,
    toggleDistinctData,
    setToggleDistinctData: memoizedSetToggleDistinctData,
    filtersWithNoNetworkRequest,
    setFiltersWithNoNetworkRequest: memoizedSetFiltersWithNoNetworkRequest,
    // Optimistic filtering state
    isFiltering,
    setIsFiltering,
    optimisticFilters,
    setOptimisticFilters,
  };

  return (
    <PersonnelPerformanceContext.Provider value={value}>
      {children}
    </PersonnelPerformanceContext.Provider>
  );
}
