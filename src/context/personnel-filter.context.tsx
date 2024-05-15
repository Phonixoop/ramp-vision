import { User } from "@prisma/client";
import moment from "jalali-moment";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";
export type FilterType = {
  periodType: PeriodType;
  filter: {
    CityName?: string[];
    Start_Date: string[];
    ProjectType?: string[];
    ContractType?: string[];
    Role?: string[];
    RoleType?: string[];
    DateInfo?: string[];
    TownName?: string[];
    BranchName?: string[];
    BranchCode?: string[];
    BranchType?: string[];
  };
};

type TPersonnelFilterContext = {
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;

  filters: FilterType;
  setFilters: (filter: FilterType) => any;

  selectedCity: any;
  setSelectedCity: (city: any) => void;

  selectedPerson: any;
  setSelectedPerson: (person: any) => void;

  reportPeriod: string;
  setReportPeriod: (reportPeriod: PeriodType) => void;
};

type PersonnelFilterProviderProps = {
  children: ReactNode;
};
const PersonnelFilterContext = createContext({} as TPersonnelFilterContext);

export function usePersonnelFilter() {
  return useContext(PersonnelFilterContext);
}

export function PersonnelFilterProvider({
  children,
}: PersonnelFilterProviderProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([
    moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
  ]);

  const [reportPeriod, setReportPeriod] = useState<PeriodType>("ماهانه");

  const [filters, setFilters] = useState<FilterType>({
    periodType: "ماهانه",
    filter: {
      Start_Date: selectedDates,
    },
  });

  const [selectedCity, setSelectedCity] = useState<string>(undefined);
  const [selectedPerson, setSelectedPerson] = useState<string>(undefined);

  return (
    <PersonnelFilterContext.Provider
      value={{
        filters,
        setFilters,
        selectedCity,
        setSelectedCity,
        selectedPerson,
        setSelectedPerson,
        reportPeriod,
        setReportPeriod,

        selectedDates,
        setSelectedDates,
      }}
    >
      {children}
    </PersonnelFilterContext.Provider>
  );
}
