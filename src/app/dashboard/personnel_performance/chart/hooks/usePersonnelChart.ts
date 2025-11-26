import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { usePersonnelPerformanceChart } from "../context";
import { PeriodType } from "../types";
import { CityWithPerformanceData } from "~/types";
import { distinctDataAndCalculatePerformance } from "~/utils/personnel-performance";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";
import moment from "jalali-moment";

export const usePersonnelChart = () => {
  const {
    filters,
    setDataFilters: setFilters,
    reportPeriod,
    setReportPeriod,
  } = usePersonnelPerformanceChart();

  const { useWorkDays } = useWorkDaysToggle();

  const router = useRouter();
  const params = useParams<{ city?: string }>();

  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery();

  const getInitialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        ProjectType: filters?.filter?.ProjectType,
        DateInfo: filters?.filter?.DateInfo,
      },
    },
  );

  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: filters?.periodType ?? "ماهانه",
        filter: {
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
          Role: filters?.filter?.Role ?? defualtRoles,
          ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
          RoleType: filters?.filter?.RoleType,
          DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo?.data],
          TownName: filters?.filter?.TownName,
          BranchName: filters?.filter?.BranchName,
          BranchCode: filters?.filter?.BranchCode,
          BranchType: filters?.filter?.BranchType,
        },
      },
      { refetchOnWindowFocus: false },
    );

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

    filters.filter.Start_Date.forEach((dateStr, index) => {
      if (typeof dateStr === "string") {
        try {
          const momentDate = moment(dateStr, "jYYYY/jMM/jDD");
          const year = momentDate.jYear();
          const month = momentDate.jMonth() + 1; // jMonth() returns 0-11, we need 1-12

          console.log(`✅ Parsed date ${index}:`, { year, month });
          months.push({ year, month });
        } catch (error) {
          console.warn("Error parsing date:", dateStr, error);
        }
      } else {
        console.log(`⚠️ Date ${index} is not a string:`, dateStr);
      }
    });

    console.log("🎯 Final months array:", months);
    return months;
  }, [filters?.periodType, filters?.filter?.Start_Date]);

  // Fetch total work days from tRPC
  const {
    data: workDaysData,
    isLoading: workDaysLoading,
    error: workDaysError,
  } = api.monthWorkDays.getTotalWorkDays.useQuery(
    { months: monthsArray },
    {
      enabled: monthsArray.length > 0, // Always fetch when months are selected, regardless of toggle state
      staleTime: 5 * 60 * 1000,
    },
  );

  const totalWorkDays = workDaysData?.totalWorkDays || null;

  // Debug logging
  // console.log("🔍 usePersonnelChart work days query:");
  // console.log("filters?.filter?.Start_Date:", filters?.filter?.Start_Date);
  // console.log("monthsArray:", monthsArray);
  // console.log("monthsArray.length:", monthsArray.length);
  // console.log("workDaysLoading:", workDaysLoading);
  // console.log("workDaysError:", workDaysError);
  // console.log("workDaysData:", workDaysData);
  // console.log("totalWorkDays:", totalWorkDays);

  const distincedData: CityWithPerformanceData[] = useMemo(
    () =>
      distinctDataAndCalculatePerformance(
        getCitiesWithPerformance?.data,
        ["CityName"],
        [
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
          "COUNT",
          "TotalPerformance",
          "DirectPerFormance",
          "InDirectPerFormance",
        ],
        {},
        useWorkDays ? totalWorkDays : null, // Pass work days if toggle is enabled
      ) ?? [],
    [getCitiesWithPerformance?.data, useWorkDays, totalWorkDays],
  );

  const [listView, setListView] = useState<CityWithPerformanceData[]>(
    distincedData ?? [],
  );
  const [navigatingToCity, setNavigatingToCity] = useState<string | null>(null);

  useEffect(() => {
    setListView(distincedData ?? []);
  }, [distincedData]);

  const activeCity = React.useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  // Reset navigation state when route changes
  useEffect(() => {
    setNavigatingToCity(null);
  }, [activeCity]);

  // Safety check to prevent rendering if context is not properly initialized
  if (!filters || !setFilters || !reportPeriod || !setReportPeriod) {
    return {
      isLoading: true,
      error: "Context not initialized",
    };
  }

  // Convert period type to calendar period type
  const getCalendarPeriodType = (
    period: PeriodType,
  ): "daily" | "weekly" | "monthly" => {
    switch (period) {
      case "روزانه":
        return "daily";
      case "هفتگی":
        return "weekly";
      case "ماهانه":
        return "monthly";
      default:
        return "daily";
    }
  };

  // Convert calendar period type to PeriodType
  const getPeriodType = (
    periodType: "daily" | "weekly" | "monthly",
  ): PeriodType => {
    switch (periodType) {
      case "daily":
        return "روزانه";
      case "weekly":
        return "هفتگی";
      case "monthly":
        return "ماهانه";
      default:
        return "روزانه";
    }
  };

  // Handle calendar submit
  const handleCalendarSubmit = ({
    reportPeriod,
    selectedDates,
  }: {
    reportPeriod: "daily" | "weekly" | "monthly";
    selectedDates: string[];
  }) => {
    // Convert reportPeriod to PeriodType
    const newPeriodType = getPeriodType(reportPeriod);
    setReportPeriod(newPeriodType);

    // Update filters with the selected dates array and period type
    if (selectedDates.length > 0) {
      setFilters({
        periodType: newPeriodType,
        filter: {
          ...filters?.filter,
          Start_Date: selectedDates,
        },
      });
    }
  };

  const updateFilters = (patch: any) => {
    // Filter out empty strings from array values
    const cleanedPatch = Object.entries(patch).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.filter(
          (item: any) => item && String(item).trim() !== "",
        );
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    setFilters({
      periodType: reportPeriod as any,
      filter: { ...filters?.filter, ...cleanedPatch },
    });
  };

  const handleCityNavigation = (cityName: string) => {
    setNavigatingToCity(cityName);

    // If clicking on the same city, reset navigation state after a short delay
    if (activeCity === cityName) {
      setTimeout(() => {
        setNavigatingToCity(null);
      }, 100);
      return;
    }

    router.push(`/dashboard/personnel_performance/chart/${cityName}`, {
      scroll: false,
    });
  };

  return {
    // Data
    filters,
    reportPeriod,
    distincedData,
    listView,
    activeCity,
    navigatingToCity,
    getInitialFilters,
    getCitiesWithPerformance,
    totalWorkDays,

    // Loading states
    isLoading: getCitiesWithPerformance.isLoading,

    // Actions
    handleCalendarSubmit,
    updateFilters,
    handleCityNavigation,
    setListView,
    getCalendarPeriodType,
  };
};
