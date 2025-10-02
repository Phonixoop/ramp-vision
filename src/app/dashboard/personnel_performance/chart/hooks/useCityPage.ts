import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { usePersonnelPerformanceChart } from "../context";
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import { distinctPersonnelPerformanceData } from "~/utils/personnel-performance";
import { getPerformanceTextEn } from "~/utils/util";
import moment from "jalali-moment";

type Rating = "Weak" | "Average" | "Good" | "Excellent" | "NeedsReview" | "ALL";

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

export const useCityPage = (
  onWorkDaysChange?: (workDays: number | null) => void,
) => {
  const params = useParams<{ city: string }>();
  const currentCity = React.useMemo(() => {
    if (!params.city) return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params.city]);

  const { filters } = usePersonnelPerformanceChart();
  const { useWorkDays } = useWorkDaysToggle();

  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Prepare months array for work days calculation
  const monthsArray = React.useMemo(() => {
    if (
      !filters?.periodType ||
      filters.periodType !== "ماهانه" ||
      !filters?.filter?.Start_Date ||
      !Array.isArray(filters.filter.Start_Date)
    ) {
      return [];
    }

    const months: { year: number; month: number }[] = [];

    filters.filter.Start_Date.forEach((dateStr) => {
      if (typeof dateStr === "string") {
        try {
          const momentDate = moment(dateStr, "jYYYY/jMM/jDD");
          const year = momentDate.jYear();
          const month = momentDate.jMonth() + 1; // jMonth() returns 0-11, we need 1-12

          months.push({ year, month });
        } catch (error) {
          console.warn("Error parsing date:", dateStr, error);
        }
      }
    });

    return months;
  }, [filters?.periodType, filters?.filter?.Start_Date]);

  // Get total work days for monthly filters
  const { data: workDaysData } = api.monthWorkDays.getTotalWorkDays.useQuery(
    { months: monthsArray },
    {
      enabled: monthsArray.length > 0,
      staleTime: 5 * 60 * 1000,
    },
  );

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

  // Calculate total work days for the selected period
  const getTotalWorkDays = useCallback(() => {
    return workDaysData?.totalWorkDays || null;
  }, [workDaysData]);

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
      useWorkDays ? getTotalWorkDays() : null, // Pass work days only if toggle is enabled
    );
  }, [getAll.data, getTotalWorkDays, useWorkDays]);

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

  // Notify parent component when work days change
  useEffect(() => {
    if (onWorkDaysChange) {
      onWorkDaysChange(getTotalWorkDays());
    }
  }, [getTotalWorkDays, onWorkDaysChange]);

  return {
    // Data
    currentCity,
    selectedPerson,
    displayedList,
    getAll,
    getPersonnels,
    filters,
    getTotalWorkDays,

    // Loading states
    pageLoading,
    ready,

    // Actions
    onFilterByLevel,
    onSelectPerson,
    setSelectedPerson,
  };
};
