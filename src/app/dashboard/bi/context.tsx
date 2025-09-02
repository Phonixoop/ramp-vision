"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import moment from "jalali-moment";
import { BIContextType, FilterType, PeriodType } from "./types";

const BIContext = createContext<BIContextType | undefined>(undefined);

export function BIProvider({ children }: { children: ReactNode }) {
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("ماهانه");
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: "ماهانه",
    filter: {
      DateFa: [moment().locale("fa").subtract(7, "days").format("YYYY/MM/DD")],
    },
  });

  const value: BIContextType = {
    filters,
    setDataFilters,
    reportPeriod,
    setReportPeriod,
  };

  return <BIContext.Provider value={value}>{children}</BIContext.Provider>;
}

export function useBI() {
  const context = useContext(BIContext);
  if (context === undefined) {
    throw new Error("useBI must be used within a BIProvider");
  }
  return context;
}
