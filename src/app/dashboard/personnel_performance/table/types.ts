export type PersonnelPerformanceData = {
  Id: number;
  CityName: string;
  NameFamily: string;
  ProjectType: string;
  ContractType: string;
  Role: string;
  RoleType: string;
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

export interface PersonnelPerformanceContextType {
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
  filtersWithNoNetworkRequest: any;
  setFiltersWithNoNetworkRequest: (filters: any) => void;
  // Optimistic filtering state
  isFiltering: boolean;
  setIsFiltering: (isFiltering: boolean) => void;
  optimisticFilters: FilterType;
  setOptimisticFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
}

// Component Props Types
export type PersonnelPerformanceTableProps = {
  sessionData: any;
};

export type PersonnelPerformanceFiltersProps = {
  getLastDate: any;
  getInitialCities: any;
  defualtDateInfo: any;
};
