"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import moment from "jalali-moment";
import { DepoContextType, FilterType, PeriodType } from "./types";

const DepoContext = createContext<DepoContextType | undefined>(undefined);

export function DepoProvider({ children }: { children: ReactNode }) {
  const [reportPeriod, setReportPeriod] = useState<string>("ماهانه");
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: "ماهانه" as PeriodType,
    filter: {
      CityName: [],
      DocumentType: [],
      ServiceName: [],
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
    },
  });

  const value: DepoContextType = {
    filters,
    setDataFilters,
    reportPeriod,
    setReportPeriod,
  };

  return <DepoContext.Provider value={value}>{children}</DepoContext.Provider>;
}

export function useDepo() {
  const context = useContext(DepoContext);
  if (context === undefined) {
    throw new Error("useDepo must be used within a DepoProvider");
  }
  return context;
}
