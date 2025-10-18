export type CityWithPerformanceData = {
  Id: number;
  CityName: string;
  TotalPerformance: number;
  DirectPerFormance: number;
  InDirectPerFormance: number;
  SabtAvalieAsnad: number;
  PazireshVaSabtAvalieAsnad: number;
  ArzyabiAsanadBimarsetaniDirect: number;
  ArzyabiAsnadBimarestaniIndirect: number;
  ArzyabiAsnadDandanVaParaDirect: number;
  ArzyabiAsnadDandanVaParaIndirect: number;
  ArzyabiAsnadDandanDirect: number;
  ArzyabiAsnadDandanIndirect: number;
  ArzyabiAsnadDaroDirect: number;
  ArzyabiAsnadDaroIndirect: number;
  WithScanCount: number;
  WithoutScanInDirectCount: number;
  WithoutScanCount: number;
  ArchiveDirectCount: number;
  ArchiveInDirectCount: number;
  ArzyabiVisitDirectCount: number;
  Start_Date: string;
  DateInfo: string;
  UserCount?: number;
  Users?: any[];
};

// Context Types
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

export interface PersonnelPerformanceChartContextType {
  reportPeriod: PeriodType;
  setReportPeriod: (period: PeriodType) => void;
  filters: FilterType;
  setDataFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  toggleDistinctData: "Distincted" | "Pure";
  setToggleDistinctData: (
    toggle:
      | "Distincted"
      | "Pure"
      | ((prev: "Distincted" | "Pure") => "Distincted" | "Pure"),
  ) => void;
  // filtersWithNoNetworkRequest: any;
  // setFiltersWithNoNetworkRequest: (filters: any) => void;
  // Optimistic filtering state
  isFiltering: boolean;
  setIsFiltering: (isFiltering: boolean) => void;
  optimisticFilters: FilterType;
  setOptimisticFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  // Chart specific states
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  chartView: "cities" | "city-detail";
  setChartView: (view: "cities" | "city-detail") => void;
}

// Component Props Types
export type PersonnelPerformanceChartProps = {
  sessionData: any;
};

export type PersonnelPerformanceChartFiltersProps = {
  getLastDate: any;
  getInitialCities: any;
  defualtDateInfo: any;
};

export type SparkChartData = {
  date: string;
  performance: number;
};

export type ChartDataPoint = {
  name: string;
  value: number;
  color?: string;
};
