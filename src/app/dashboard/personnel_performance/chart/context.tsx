"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import moment from "jalali-moment";
import {
  PersonnelPerformanceChartContextType,
  FilterType,
  PeriodType,
} from "./types";
import {
  defaultProjectTypes,
  defualtContractTypes,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";

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

interface PersonnelPerformanceChartProviderProps {
  children: React.ReactNode;
}

export function PersonnelPerformanceChartProvider({
  children,
}: PersonnelPerformanceChartProviderProps) {
  // Report period state
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("ماهانه");

  // Toggle state for distinct data
  const [toggleDistinctData, setToggleDistinctData] = useState<
    "Distincted" | "Pure"
  >("Distincted");

  // Filters state
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: reportPeriod,
    filter: {
      ProjectType: defaultProjectTypes,
      ContractType: defualtContractTypes,
      RoleType: getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
  });

  // Filters without network request
  // const [filtersWithNoNetworkRequest, setFiltersWithNoNetworkRequest] =
  //   useState({
  //     periodType: reportPeriod,
  //     filter: {
  //       ContractType: defualtContractTypes,
  //       RoleTypes: getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
  //     },
  //   });

  // Optimistic filtering state
  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<FilterType>(filters);

  // Chart specific states
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"cities" | "city-detail">(
    "cities",
  );

  // Update report period in filters when it changes
  useEffect(() => {
    setDataFilters((prev) => ({
      ...prev,
      periodType: reportPeriod,
    }));
    // setFiltersWithNoNetworkRequest((prev) => ({
    //   ...prev,
    //   periodType: reportPeriod,
    // }));
  }, [reportPeriod]);

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
    // filtersWithNoNetworkRequest,
    // setFiltersWithNoNetworkRequest: (newFilters) => {
    //   if (typeof newFilters === "function") {
    //     setFiltersWithNoNetworkRequest(newFilters);
    //   } else {
    //     setFiltersWithNoNetworkRequest(newFilters);
    //   }
    // },
    // Optimistic filtering state
    isFiltering,
    setIsFiltering,
    optimisticFilters,
    setOptimisticFilters,
    // Chart specific states
    selectedCity,
    setSelectedCity,
    chartView,
    setChartView,
  };

  return (
    <PersonnelPerformanceChartContext.Provider value={value}>
      {children}
    </PersonnelPerformanceChartContext.Provider>
  );
}
