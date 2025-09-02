import { RouterOutputs } from "~/trpc/react";

export type BestsData =
  RouterOutputs["personnelPerformance"]["getBestPersonnel"][number];

export type BestsTableProps = {
  sessionData: any;
};

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";

export type FilterType = {
  periodType: PeriodType;
  filter: {
    CityName?: string[];
    Start_Date: string[];
  };
};

export type BestsContextType = {
  filters: FilterType;
  setDataFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  reportPeriod: string;
  setReportPeriod: (period: string) => void;
};
