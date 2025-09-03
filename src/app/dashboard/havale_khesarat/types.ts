import { RouterOutputs } from "~/trpc/react";

export type HavaleKhesaratData =
  RouterOutputs["havaleKhesarat"]["getAll"][number];

export type HavaleKhesaratTableProps = {
  sessionData: any;
};

export type PeriodType = "روزانه" | "هفتگی" | "ماهانه";

export type FilterType = {
  periodType: PeriodType;
  filter: {
    CityName: string[];
    Start_Date: string[];
    Memtaz: string[];
    DarajeYek: string[];
    DarajeDo: string[];
    ServiceName: string[];
    HavaleType: string[];
  };
};

export type HavaleKhesaratContextType = {
  filters: FilterType;
  setDataFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  reportPeriod: PeriodType;
  setReportPeriod: (period: PeriodType) => void;
};
