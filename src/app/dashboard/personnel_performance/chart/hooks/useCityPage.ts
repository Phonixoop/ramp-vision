import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { usePersonnelPerformanceChart } from "../context";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import { distinctPersonnelPerformanceData } from "~/utils/personnel-performance";
import { getPerformanceTextEn } from "~/utils/util";

type Rating = "Weak" | "Average" | "Good" | "Excellent" | "NeedsReview" | "ALL";

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

export const useCityPage = () => {
  const params = useParams<{ city: string }>();
  const currentCity = params.city;

  const { filters } = usePersonnelPerformanceChart();

  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // gate heavy queries; hooks still run, but queries won't
  const ready = !!currentCity && !!defualtDateInfo.data;
  const pageLoading = !ready;

  const getPersonnels = api.personnel.getAll.useQuery(
    {
      filter: {
        CityName: [currentCity],
        DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo.data ?? ""],
      },
    },
    {
      enabled: ready,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );

  const queryInput = useMemo(
    () => ({
      filter: {
        CityName: [currentCity],
        Start_Date: filters?.filter?.Start_Date,
        ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
        Role: filters?.filter?.Role ?? defualtRoles,
        ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
        RoleType: filters?.filter?.RoleType,
        DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo.data],
        TownName: filters?.filter?.TownName,
        BranchName: filters?.filter?.BranchName,
        BranchCode: filters?.filter?.BranchCode,
        BranchType: filters?.filter?.BranchType,
      },
      periodType: filters?.periodType,
    }),
    [
      currentCity,
      filters?.filter?.Start_Date,
      filters?.filter?.ProjectType,
      filters?.filter?.Role,
      filters?.filter?.ContractType,
      filters?.filter?.RoleType,
      filters?.filter?.DateInfo,
      filters?.filter?.TownName,
      filters?.filter?.BranchName,
      filters?.filter?.BranchCode,
      filters?.filter?.BranchType,
      filters?.periodType,
      defualtDateInfo.data,
      defaultProjectTypes,
      defualtRoles,
      defualtContractTypes,
    ],
  );

  const getAll = api.personnelPerformance.getAll.useQuery(queryInput, {
    enabled: ready,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  // State management
  const defaultListRef = useRef<PersonRecord[]>([]);
  const [levelFilter, setLevelFilter] = useState<Rating>("ALL");
  const [updatedList, setUpdatedList] = useState<PersonRecord[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(
    null,
  );

  // Derived data
  const baseList: PersonRecord[] = useMemo(() => {
    const data = getAll.data as any;
    if (!data || !data.result) return [];
    return distinctPersonnelPerformanceData(
      data,
      ["NationalCode", "NameFamily", "CityName"],
      [
        "NationalCode",
        "NameFamily",
        "TownName",
        "BranchCode",
        "BranchName",
        "BranchType",
        "SabtAvalieAsnad",
        "PazireshVaSabtAvalieAsnad",
        "ArzyabiAsanadBimarsetaniDirect",
        "ArzyabiAsnadBimarestaniIndirect",
        "ArzyabiAsanadDandanVaParaDirect",
        "ArzyabiAsanadDandanVaParaIndirect",
        "ArzyabiAsnadDaroDirect",
        "ArzyabiAsnadDaroIndirect",
        "WithScanCount",
        "WithoutScanCount",
        "WithoutScanInDirectCount",
        "ArchiveDirectCount",
        "ArchiveInDirectCount",
        "ArzyabiVisitDirectCount",
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
        "COUNT",
      ],
      { HasTheDayOff: false },
    );
  }, [getAll.data]);

  useEffect(() => {
    defaultListRef.current = baseList;
    setUpdatedList(baseList);
  }, [baseList]);

  // Mimic previous onSuccess behavior
  useEffect(() => {
    if (ready && getAll.isSuccess) {
      setSelectedPerson(null);
    }
  }, [ready, getAll.isSuccess]);

  const mergedList: PersonRecord[] = useMemo(() => {
    if (!getPersonnels.data || !updatedList) return updatedList ?? [];

    // Create a more unique identifier to avoid duplicates
    const presentIdentifiers = new Set(
      updatedList.map(
        (b: any) =>
          `${b.NationalCode || "unknown"}-${b.NameFamily || "unknown"}-${
            b.Role || "unknown"
          }-${b.BranchName || "unknown"}`,
      ),
    );

    const missing = getPersonnels.data
      .filter((a: any) => {
        const identifier = `${a.NationalCode || "unknown"}-${
          a.NameFamily || "unknown"
        }-${a.Role || "unknown"}-${a.BranchName || "unknown"}`;
        return !presentIdentifiers.has(identifier);
      })
      .map((a: any) => ({
        ...a,
        TotalPerformance: 0,
        key: {
          CityName: a.CityName,
          NameFamily: a.NameFamily,
          NationalCode: a.NationalCode,
        },
      }));
    return [...updatedList, ...missing];
  }, [getPersonnels.data, updatedList]);

  const displayedList: PersonRecord[] = useMemo(() => {
    if (levelFilter === "ALL") return mergedList;
    return mergedList.filter(
      (u: any) => getPerformanceTextEn(u.TotalPerformance) === levelFilter,
    );
  }, [mergedList, levelFilter]);

  // Handlers
  const onFilterByLevel = useCallback((rating: Rating) => {
    setLevelFilter((prev) => (prev === rating ? "ALL" : rating));
  }, []);

  const onSelectPerson = useCallback(
    (person: PersonRecord, sparkData?: any[]) => {
      setSelectedPerson({ ...person, sparkData });
    },
    [],
  );

  return {
    // Data
    currentCity,
    selectedPerson,
    displayedList,
    getAll,
    getPersonnels,
    filters,

    // Loading states
    pageLoading,
    ready,

    // Actions
    onFilterByLevel,
    onSelectPerson,
    setSelectedPerson,
  };
};
