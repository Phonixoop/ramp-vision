"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { PersonnelsContextType, FilterType } from "./types";
import {
  defualtContractTypes,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import moment from "jalali-moment";

const PersonnelsContext = createContext<PersonnelsContextType | undefined>(
  undefined,
);

export function usePersonnels() {
  const context = useContext(PersonnelsContext);
  if (context === undefined) {
    throw new Error("usePersonnels must be used within a PersonnelsProvider");
  }
  return context;
}

interface PersonnelsProviderProps {
  children: React.ReactNode;
}

export function PersonnelsProvider({ children }: PersonnelsProviderProps) {
  const [filters, setFilters] = useState<FilterType>({
    filter: {
      CityName: [],
      ProjectType: [],
      Role: [],
      ContractType: [],
      RoleType: [],
      DateInfo: [],
    },
  });

  const [filtersWithNoNetworkRequest, setFiltersWithNoNetworkRequest] =
    useState({
      filter: {
        ContractType: defualtContractTypes,
        RoleType: getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
      },
    });

  // Additional state properties to match Personnel Performance table
  const [reportPeriod, setReportPeriod] = useState({
    Start_Date: [moment().locale("fa").add(-1, "month").format("YYYY/MM/DD")],
    End_Date: [moment().locale("fa").format("YYYY/MM/DD")],
  });

  const [toggleDistinctData, setToggleDistinctData] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<FilterType>(filters);

  // Memoized setters for better performance
  const memoizedSetDataFilters = useCallback(
    (newFilters: FilterType | ((prev: FilterType) => FilterType)) => {
      setFilters(newFilters);
    },
    [],
  );

  const memoizedSetToggleDistinctData = useCallback((value: boolean) => {
    setToggleDistinctData(value);
  }, []);

  const memoizedSetFiltersWithNoNetworkRequest = useCallback(
    (newFilters: any | ((prev: any) => any)) => {
      setFiltersWithNoNetworkRequest(newFilters);
    },
    [],
  );

  // Sync reportPeriod with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        Start_Date: reportPeriod.Start_Date,
        End_Date: reportPeriod.End_Date,
      },
    }));
  }, [reportPeriod]);

  const value: PersonnelsContextType = {
    filters,
    setFilters: memoizedSetDataFilters,
    filtersWithNoNetworkRequest,
    setFiltersWithNoNetworkRequest: memoizedSetFiltersWithNoNetworkRequest,
    reportPeriod,
    setReportPeriod,
    toggleDistinctData,
    setToggleDistinctData: memoizedSetToggleDistinctData,
    isFiltering,
    setIsFiltering,
    optimisticFilters,
    setOptimisticFilters,
  };

  return (
    <PersonnelsContext.Provider value={value}>
      {children}
    </PersonnelsContext.Provider>
  );
}
