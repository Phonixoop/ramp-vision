"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { PishkhanContextType, FilterType } from "./types";
import moment from "jalali-moment";

const PishkhanContext = createContext<PishkhanContextType | undefined>(
  undefined,
);

export function usePishkhan() {
  const context = useContext(PishkhanContext);
  if (context === undefined) {
    throw new Error("usePishkhan must be used within a PishkhanProvider");
  }
  return context;
}

interface PishkhanProviderProps {
  children: React.ReactNode;
}

export function PishkhanProvider({ children }: PishkhanProviderProps) {
  const [filters, setFilters] = useState<FilterType>({
    periodType: "روزانه",
    filter: {
      CityName: [],
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
      End_Date: [],
      DateInfo: [],
      ProjectType: [],
      Role: [],
      ContractType: [],
      RoleType: [],
    },
  });

  const [reportPeriod, setReportPeriod] = useState<
    "روزانه" | "هفتگی" | "ماهانه"
  >("روزانه");
  const [toggleDistinctData, setToggleDistinctData] = useState<
    "Distincted" | "Pure"
  >("Distincted");
  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticFilters, setOptimisticFilters] =
    useState<FilterType>(filters);

  // Memoized setters for better performance
  const memoizedSetFilters = useCallback(
    (newFilters: FilterType | ((prev: FilterType) => FilterType)) => {
      setFilters(newFilters);
    },
    [],
  );

  const memoizedSetReportPeriod = useCallback(
    (period: "روزانه" | "هفتگی" | "ماهانه") => {
      setReportPeriod(period);
    },
    [],
  );

  const memoizedSetToggleDistinctData = useCallback(
    (value: "Distincted" | "Pure") => {
      setToggleDistinctData(value);
    },
    [],
  );

  const memoizedSetIsFiltering = useCallback((value: boolean) => {
    setIsFiltering(value);
  }, []);

  const memoizedSetOptimisticFilters = useCallback((filters: FilterType) => {
    setOptimisticFilters(filters);
  }, []);

  // Sync reportPeriod with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      periodType: reportPeriod,
    }));
  }, [reportPeriod]);

  const value: PishkhanContextType = {
    filters,
    setFilters: memoizedSetFilters,
    reportPeriod,
    setReportPeriod: memoizedSetReportPeriod,
    toggleDistinctData,
    setToggleDistinctData: memoizedSetToggleDistinctData,
    isFiltering,
    setIsFiltering: memoizedSetIsFiltering,
    optimisticFilters,
    setOptimisticFilters: memoizedSetOptimisticFilters,
  };

  return (
    <PishkhanContext.Provider value={value}>
      {children}
    </PishkhanContext.Provider>
  );
}
