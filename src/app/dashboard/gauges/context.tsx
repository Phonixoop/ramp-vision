"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import moment from "jalali-moment";
import { GaugesContextType, FilterType, PeriodType } from "./types";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";

const GaugesContext = createContext<GaugesContextType | undefined>(undefined);

export function GaugesProvider({ children }: { children: ReactNode }) {
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("ماهانه");
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: "ماهانه",
    filter: {
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
      ProjectType: defaultProjectTypes,
      Role: defualtRoles,
      ContractType: defualtContractTypes,
      RoleType: [],
      DateInfo: [],
    },
  });

  const value: GaugesContextType = {
    filters,
    setDataFilters,
    reportPeriod,
    setReportPeriod,
  };

  return (
    <GaugesContext.Provider value={value}>{children}</GaugesContext.Provider>
  );
}

export function useGauges() {
  const context = useContext(GaugesContext);
  if (context === undefined) {
    throw new Error("useGauges must be used within a GaugesProvider");
  }
  return context;
}
