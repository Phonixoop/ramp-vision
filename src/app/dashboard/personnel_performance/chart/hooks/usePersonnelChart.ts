import { useEffect, useMemo, useState } from "react";
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

export const usePersonnelChart = () => {
  const {
    filters,
    setDataFilters: setFilters,
    reportPeriod,
    setReportPeriod,
  } = usePersonnelPerformanceChart();

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

  const distincedData: CityWithPerformanceData[] = useMemo(
    () =>
      distinctDataAndCalculatePerformance(getCitiesWithPerformance?.data) ?? [],
    [getCitiesWithPerformance?.data],
  );

  const [listView, setListView] = useState<CityWithPerformanceData[]>(
    distincedData ?? [],
  );
  const [navigatingToCity, setNavigatingToCity] = useState<string | null>(null);

  useEffect(() => {
    setListView(distincedData ?? []);
  }, [distincedData]);

  const activeCity = typeof params?.city === "string" ? params.city : "";

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
    setFilters({
      periodType: reportPeriod as any,
      filter: { ...filters?.filter, ...patch },
    });
  };

  const handleCityNavigation = (cityName: string) => {
    setNavigatingToCity(cityName);
    router.push(`/dashboard/personnel_performance/chart/${cityName}`);
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
