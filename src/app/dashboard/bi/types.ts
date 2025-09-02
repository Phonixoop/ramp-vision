import { RouterOutputs } from "~/trpc/react";

export type BIData = RouterOutputs["bi"]["getReports"]["result"][number];

export type BITableProps = {
  sessionData: any;
};

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";

export type FilterType = {
  periodType: PeriodType;
  filter: {
    DateFa: string[];
  };
};

export type BIContextType = {
  filters: FilterType;
  setDataFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  reportPeriod: PeriodType;
  setReportPeriod: (period: PeriodType) => void;
};
