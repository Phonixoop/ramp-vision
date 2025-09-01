import { RouterOutputs } from "~/trpc/react";

export type DepoData = RouterOutputs["depo"]["getAll"][number];

export type DepoTableProps = {
  sessionData: any;
};

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";

export type FilterType = {
  periodType: PeriodType;
  filter: {
    CityName?: string[];
    DocumentType?: string[];
    ServiceName?: string[];
    Start_Date: string[];
  };
};

export type DepoContextType = {
  filters: FilterType;
  setDataFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  reportPeriod: string;
  setReportPeriod: (period: string) => void;
};
