import { RouterOutputs } from "~/trpc/react";

export type GaugesData =
  RouterOutputs["personnelPerformance"]["getCitiesWithPerformance"][number];

export type GaugesTableProps = {
  sessionData: any;
};

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";

export type FilterType = {
  periodType: PeriodType;
  filter: {
    Start_Date: string[];
    ProjectType: string[];
    Role: string[];
    ContractType: string[];
    RoleType?: string[];
    DateInfo?: any[];
  };
};

export type GaugesContextType = {
  filters: FilterType;
  setDataFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  reportPeriod: PeriodType;
  setReportPeriod: (period: PeriodType) => void;
};
