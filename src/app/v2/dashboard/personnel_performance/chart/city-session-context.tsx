"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TEHRAN_SUB_CITIES } from "~/constants";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import { api } from "~/trpc/react";
import {
  distinctPersonnelPerformanceData,
  expandTehranPerformanceCities,
  isSamePersonnelRecord,
  isSingleDayPersonnelSelection,
  normalizeCityName,
} from "~/utils/personnel-performance";
import { getPerformanceTextEn } from "~/utils/util";
import { useChartFilters } from "./filters-context";

export type Rating =
  | "Weak"
  | "Average"
  | "Good"
  | "Excellent"
  | "NeedsReview"
  | "ALL";
export type TehranSubCity = (typeof TEHRAN_SUB_CITIES)[number];
export type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  Role?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  periodType?: string;
  CityName?: string;
};

const PERFORMANCE_KEYS = [
  "TownName",
  "BranchCode",
  "BranchName",
  "BranchType",
  "SabtAvalieAsnad",
  "PazireshVaSabtAvalieAsnad",
  "ArzyabiAsanadBimarsetaniDirect",
  "ArzyabiAsnadBimarestaniIndirect",
  "ArzyabiAsnadDandanVaParaDirect",
  "ArzyabiAsnadDandanVaParaIndirect",
  "ArzyabiAsnadDandanDirect",
  "ArzyabiAsnadDandanIndirect",
  "ArzyabiAsnadDaroDirect",
  "ArzyabiAsnadDaroIndirect",
  "WithScanCount",
  "WithoutScanCount",
  "WithoutScanInDirectCount",
  "ArchiveDirectCount",
  "ArchiveInDirectCount",
  "ArzyabiVisitDirectCount",
  "ArzyabiVisitInDirectCount",
  "Role",
  "RoleType",
  "ContractType",
  "ProjectType",
  "TotalPerformance",
  "DirectPerFormance",
  "InDirectPerFormance",
  "Start_Date",
  "DateInfo",
  "HasTheDayOff",
  "RealCityName",
  "COUNT",
];

type CitySessionContextValue = {
  currentCity: string;
  isTehran: boolean;
  selectedPerson: PersonRecord | null;
  setSelectedPerson: (person: PersonRecord | null) => void;
  levelFilter: Rating;
  setLevelFilter: (rating: Rating) => void;
  tehranSubCities: TehranSubCity[];
  displayedList: PersonRecord[];
  pageLoading: boolean;
  getAll: ReturnType<typeof api.personnelPerformance.getAll.useQuery>;
  onFilterByLevel: (rating: Rating) => void;
  onTehranSubCityChange: (city: TehranSubCity) => void;
  setTehranSubCities: (cities: TehranSubCity[]) => void;
  onSelectPerson: (
    person: PersonRecord,
    sparkData?: any[],
    StartDate?: string,
    periodType?: string,
  ) => void;
  ready: boolean;
};

const CitySessionContext = createContext<CitySessionContextValue | null>(null);

export function useCitySession() {
  const context = useContext(CitySessionContext);
  if (!context) {
    throw new Error("useCitySession must be used within CitySessionProvider");
  }
  return context;
}

export function CitySessionProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ city?: string }>();
  const { filters, apiFilters, useWorkDays, totalWorkDays, canFetch } =
    useChartFilters();

  const currentCity = useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  const isTehran = normalizeCityName(currentCity) === "Tehran";
  const performanceCityFilter = useMemo(
    () => expandTehranPerformanceCities([currentCity]),
    [currentCity],
  );

  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(
    null,
  );
  const [levelFilter, setLevelFilter] = useState<Rating>("ALL");
  const [tehranSubCities, setTehranSubCities] = useState<TehranSubCity[]>([]);
  const [updatedList, setUpdatedList] = useState<PersonRecord[]>([]);
  const defaultListRef = useRef<PersonRecord[]>([]);

  useEffect(() => {
    setSelectedPerson(null);
    setLevelFilter("ALL");
    setTehranSubCities([]);
  }, [currentCity]);

  const ready = Boolean(currentCity) && canFetch;

  const getPersonnels = api.personnel.getAll.useQuery(
    {
      filter: {
        CityName: [currentCity],
        DateInfo: apiFilters.filter.DateInfo ?? [],
      },
    },
    {
      enabled: ready,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    },
  );

  const getAll = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: performanceCityFilter,
        Start_Date: apiFilters.filter.Start_Date,
        ProjectType: apiFilters.filter.ProjectType ?? defaultProjectTypes,
        Role: apiFilters.filter.Role ?? defualtRoles,
        ContractType: apiFilters.filter.ContractType ?? defualtContractTypes,
        RoleType: apiFilters.filter.RoleType,
        DateInfo: apiFilters.filter.DateInfo,
        TownName: apiFilters.filter.TownName,
        BranchName: apiFilters.filter.BranchName,
        BranchCode: apiFilters.filter.BranchCode,
        BranchType: apiFilters.filter.BranchType,
      },
      periodType: apiFilters.periodType,
    },
    {
      enabled: ready,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    },
  );

  const baseList: PersonRecord[] = useMemo(() => {
    const data = getAll.data as any;
    if (!data?.result || !Array.isArray(data.result)) return [];
    return distinctPersonnelPerformanceData(
      data,
      ["NationalCode", "NameFamily", "CityName"],
      PERFORMANCE_KEYS,
      { HasTheDayOff: false },
      useWorkDays ? totalWorkDays : null,
    );
  }, [getAll.data, totalWorkDays, useWorkDays]);

  useEffect(() => {
    defaultListRef.current = baseList;
    setUpdatedList(baseList);
  }, [baseList]);

  // Keep details panel in sync when work-days toggle / aggregation rebuilds the list
  useEffect(() => {
    setSelectedPerson((prev) => {
      if (!prev) return null;
      // Day drill-down ignores work-days divisor; leave that snapshot alone
      if (isSingleDayPersonnelSelection(prev)) return prev;

      const match = baseList.find((row) => isSamePersonnelRecord(row, prev));
      if (!match) return prev;
      if (
        match.TotalPerformance === prev.TotalPerformance &&
        match.DirectPerFormance === prev.DirectPerFormance &&
        match.InDirectPerFormance === prev.InDirectPerFormance &&
        match.SabtAvalieAsnad === prev.SabtAvalieAsnad &&
        match.WithScanCount === prev.WithScanCount &&
        match.WithoutScanCount === prev.WithoutScanCount
      ) {
        return prev;
      }

      return {
        ...match,
        sparkData: (prev as any).sparkData,
        Start_Date: prev.Start_Date,
        periodType: prev.periodType,
      };
    });
  }, [baseList]);

  const mergedList: PersonRecord[] = useMemo(() => {
    if (!getPersonnels.data || !updatedList) return updatedList ?? [];
    const present = new Set(updatedList.map((row) => row.NationalCode));
    const missing = getPersonnels.data
      .filter((row: any) => !present.has(row.NationalCode))
      .map((row: any) => ({
        ...row,
        TotalPerformance: 0,
        key: {
          CityName: row.CityName,
          NameFamily: row.NameFamily,
          NationalCode: row.NationalCode,
        },
      }));
    return [...updatedList, ...missing];
  }, [getPersonnels.data, updatedList]);

  const displayedList = useMemo(() => {
    let next = mergedList;
    if (isTehran && tehranSubCities.length > 0) {
      next = next.filter((row) =>
        tehranSubCities.includes(
          normalizeCityName(row.CityName) as TehranSubCity,
        ),
      );
    }
    if (levelFilter === "ALL") return next;
    return next.filter(
      (row) => getPerformanceTextEn(row.TotalPerformance) === levelFilter,
    );
  }, [mergedList, isTehran, tehranSubCities, levelFilter]);

  const onFilterByLevel = useCallback((rating: Rating) => {
    setLevelFilter((prev) => (prev === rating ? "ALL" : rating));
  }, []);

  const onTehranSubCityChange = useCallback((city: TehranSubCity) => {
    setTehranSubCities((prev) =>
      prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city],
    );
  }, []);

  const onSelectPerson = useCallback(
    (
      person: PersonRecord,
      sparkData?: any[],
      StartDate?: string,
      periodType?: string,
    ) => {
      setSelectedPerson({
        ...person,
        sparkData,
        Start_Date: StartDate ? StartDate : person.Start_Date,
        periodType: periodType ? periodType : filters.period,
      });
    },
    [filters.period],
  );

  const pageLoading =
    ready &&
    ((getAll.isLoading && !getAll.data) ||
      (getPersonnels.isLoading && !getPersonnels.data));

  const value = useMemo<CitySessionContextValue>(
    () => ({
      currentCity,
      isTehran,
      selectedPerson,
      setSelectedPerson,
      levelFilter,
      setLevelFilter,
      tehranSubCities,
      displayedList,
      pageLoading,
      getAll,
      onFilterByLevel,
      onTehranSubCityChange,
      setTehranSubCities,
      onSelectPerson,
      ready,
    }),
    [
      currentCity,
      isTehran,
      selectedPerson,
      levelFilter,
      tehranSubCities,
      displayedList,
      pageLoading,
      getAll,
      onFilterByLevel,
      onTehranSubCityChange,
      onSelectPerson,
      ready,
    ],
  );

  return (
    <CitySessionContext.Provider value={value}>
      {children}
    </CitySessionContext.Provider>
  );
}
