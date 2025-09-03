"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import moment from "jalali-moment";
import { HavaleKhesaratContextType, FilterType, PeriodType } from "./types";

const HavaleKhesaratContext = createContext<
  HavaleKhesaratContextType | undefined
>(undefined);

export function HavaleKhesaratProvider({ children }: { children: ReactNode }) {
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("ماهانه");
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: "ماهانه",
    filter: {
      CityName: [],
      Start_Date: [moment().locale("fa").subtract(1, "M").format("YYYY/MM/DD")],
      Memtaz: [],
      DarajeYek: [],
      DarajeDo: [],
      ServiceName: [],
      HavaleType: [],
    },
  });

  const value: HavaleKhesaratContextType = {
    filters,
    setDataFilters,
    reportPeriod,
    setReportPeriod,
  };

  return (
    <HavaleKhesaratContext.Provider value={value}>
      {children}
    </HavaleKhesaratContext.Provider>
  );
}

export function useHavaleKhesarat() {
  const context = useContext(HavaleKhesaratContext);
  if (context === undefined) {
    throw new Error(
      "useHavaleKhesarat must be used within a HavaleKhesaratProvider",
    );
  }
  return context;
}
