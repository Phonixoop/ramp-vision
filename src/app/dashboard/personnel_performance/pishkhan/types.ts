export type FilterType = {
  periodType: "روزانه" | "هفتگی" | "ماهانه";
  filter: {
    CityName?: string[];
    Start_Date?: string[];
    End_Date?: string[];
    DateInfo?: string[];
    ProjectType?: string[];
    Role?: string[];
    ContractType?: string[];
    RoleType?: string[];
  };
};

export type PishkhanContextType = {
  filters: FilterType;
  setFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  reportPeriod: "روزانه" | "هفتگی" | "ماهانه";
  setReportPeriod: (period: "روزانه" | "هفتگی" | "ماهانه") => void;
  toggleDistinctData: "Distincted" | "Pure";
  setToggleDistinctData: (value: "Distincted" | "Pure") => void;
  isFiltering: boolean;
  setIsFiltering: (value: boolean) => void;
  optimisticFilters: FilterType;
  setOptimisticFilters: (filters: FilterType) => void;
};

// Component Props Types
export type PishkhanTableProps = {
  sessionData: any;
};

export type PishkhanData = {
  Id: number;
  CityName: string;
  NameFamily: string;
  TownName: string;
  BranchCode: string;
  BranchName: string;
  BranchType: string;
  TotalPerformance: number;
  DirectPerFormance: number;
  InDirectPerFormance: number;
  Role: string;
  RoleType: string;
  ContractType: string;
  ProjectType: string;
  Start_Date: string;
  DateInfo: string;
  HasTheDayOff: boolean;
  SabtAvalieAsnad: number;
  PazireshVaSabtAvalieAsnad: number;
  ArzyabiAsanadBimarsetaniDirect: number;
  ArzyabiAsnadBimarestaniIndirect: number;
  ArzyabiAsnadDandanVaParaDirect: number;
  ArzyabiAsnadDandanVaParaIndirect: number;
  ArzyabiAsnadDaroDirect: number;
  ArzyabiAsnadDaroIndirect: number;
  WithScanCount: number;
  WithoutScanCount: number;
  WithoutScanInDirectCount: number;
  ArchiveDirectCount: number;
  ArchiveInDirectCount: number;
  ArzyabiVisitDirectCount: number;
};
