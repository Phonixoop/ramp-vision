import { RouterOutputs } from "~/trpc/react";

export type PersonnelsData = RouterOutputs["personnel"]["getAll"][number];

export type PersonnelsTableProps = {
  sessionData: any;
};

export type FilterType = {
  filter: {
    CityName: string[];
    ProjectType: string[];
    Role: string[];
    ContractType: string[];
    RoleType: string[];
    DateInfo: string[];
    Start_Date?: string[];
    End_Date?: string[];
  };
};

export type PersonnelsContextType = {
  filters: FilterType;
  setFilters: (
    filters: FilterType | ((prev: FilterType) => FilterType),
  ) => void;
  filtersWithNoNetworkRequest: {
    filter: {
      ContractType: string[];
      RoleType: string[];
    };
  };
  setFiltersWithNoNetworkRequest: (filters: any | ((prev: any) => any)) => void;
  // Additional properties to match Personnel Performance table
  reportPeriod: {
    Start_Date: string[];
    End_Date: string[];
  };
  setReportPeriod: (period: {
    Start_Date: string[];
    End_Date: string[];
  }) => void;
  toggleDistinctData: boolean;
  setToggleDistinctData: (value: boolean) => void;
  isFiltering: boolean;
  setIsFiltering: (value: boolean) => void;
  optimisticFilters: FilterType;
  setOptimisticFilters: (filters: FilterType) => void;
};

// Component Props Types
export type PersonnelsFiltersProps = {
  getLastDate: any;
  getInitialCities: any;
  defualtDateInfo: any;
};
