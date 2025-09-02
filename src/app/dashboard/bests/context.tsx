"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import moment from "jalali-moment";
import { BestsContextType, FilterType, PeriodType } from "./types";

const BestsContext = createContext<BestsContextType | undefined>(undefined);

export function BestsProvider({ children }: { children: ReactNode }) {
  const [reportPeriod, setReportPeriod] = useState<string>("ماهانه");
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: "ماهانه" as PeriodType,
    filter: {
      CityName: [],
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
    },
  });

  const value: BestsContextType = {
    filters,
    setDataFilters,
    reportPeriod,
    setReportPeriod,
  };

  return (
    <BestsContext.Provider value={value}>{children}</BestsContext.Provider>
  );
}

export function useBests() {
  const context = useContext(BestsContext);
  if (context === undefined) {
    throw new Error("useBests must be used within a BestsProvider");
  }
  return context;
}
