"use client";
import { useSession } from "next-auth/react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import moment from "jalali-moment";
import { toast } from "sonner";

import Table from "~/features/table";
import { PersonnelPerformanceTableProps } from "../types";
import {
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";
import { getPersianToEnglishCity } from "~/utils/util";
import {
  CustomColumnDef,
  PersonnelPerformanceColumns,
} from "./PersonnelPerformanceColumns";
import { PersonnelPerformanceFilters } from "./PersonnelPerformanceFilters";
import { PersonnelPerformanceSummary } from "./PersonnelPerformanceSummary";
import { PersonnelPerformanceExport } from "./PersonnelPerformanceExport";
import { ColumnDef } from "@tanstack/react-table";
import { PersonnelPerformanceData } from "../types";
import { usePersonnelPerformance } from "../context";
import { TableFiltersContainerSkeleton } from "./TableFilterSkeleton";

export function PersonnelPerformanceTable({
  sessionData,
}: PersonnelPerformanceTableProps) {
  const {
    toggleDistinctData,
    setToggleDistinctData,
    filters,
    setDataFilters,
    filtersWithNoNetworkRequest,
    setFiltersWithNoNetworkRequest,
    isFiltering,
  } = usePersonnelPerformance();

  // API Queries
  const getInitialCities =
    api.personnelPerformance.getInitialCityNames.useQuery(undefined, {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    });

  const getLastDate = api.personnelPerformance.getLastDate.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });

  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery();

  // State Management
  // const [filters, setDataFilters] = useState<FilterType>({
  //   periodType: reportPeriod,
  //   filter: {
  //     CityName: getInitialCities.data?.Cities,
  //     Start_Date: [
  //       moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
  //     ],
  //   },
  // });

  // const [filtersWithNoNetworkRequest, setFiltersWithNoNetworkRequest] =
  //   useState({
  //     periodType: reportPeriod,
  //     filter: {
  //       ContractType: defualtContractTypes,
  //       RoleTypes: getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
  //     },
  //   });

  // Update filters when last date is available
  useEffect(() => {
    if (getLastDate.data) {
      setDataFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          Start_Date: [getLastDate.data],
        },
      }));
    }
  }, [getLastDate.data]);

  // Update filters when initial cities are available
  useEffect(() => {
    if (getInitialCities.data?.CityNames) {
      setDataFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: getInitialCities.data.CityNames,
        },
      }));
    }
  }, [getInitialCities.data?.CityNames]);

  // Update filters when default date info is available
  useEffect(() => {
    if (defualtDateInfo.data) {
      setDataFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          DateInfo: [defualtDateInfo.data],
        },
      }));
    }
  }, [defualtDateInfo.data]);

  // Update filters when default contract types are available
  useEffect(() => {
    if (defualtContractTypes.length > 0) {
      setFiltersWithNoNetworkRequest((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          ContractType: defualtContractTypes,
          RoleTypes:
            getDefaultRoleTypesBaseOnContractType(defualtContractTypes),
        },
      }));
    }
  }, [defualtContractTypes]);

  // Update filters when report period changes
  useEffect(() => {
    setDataFilters((prev) => ({
      ...prev,
      periodType: filters.periodType,
    }));
    setFiltersWithNoNetworkRequest((prev) => ({
      ...prev,
      periodType: filters.periodType,
    }));
  }, [filters.periodType]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setDataFilters({
        periodType: "روزانه",
        filter: {
          CityName: [],
          Start_Date: [],
        },
      });
      setFiltersWithNoNetworkRequest({
        periodType: "روزانه",
        filter: {
          ContractType: [],
          RoleTypes: [],
        },
      });
    };
  }, []);

  // Initial filters query
  const initialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        DateInfo: filters.filter.DateInfo ?? [defualtDateInfo.data ?? ""],
        ProjectType: filters.filter.ProjectType,
      },
    },
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );

  // Update filters when initial filters are available
  useEffect(() => {
    if (initialFilters.data) {
      setDataFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          ProjectType: initialFilters.data.ProjectType,
        },
      }));
    }
  }, [initialFilters.data]);

  // Deferred filter for performance
  const deferredFilter = useDeferredValue({
    ...filters,
    periodType: filters?.periodType,
    filter: {
      ...filters?.filter,
      // DateInfo: filters.filter.DateInfo ?? [defualtDateInfo.data],
      // ProjectType: filters.filter.ProjectType,
    },
  });

  // Main data query
  const personnelPerformance = api.personnelPerformance.getAll.useQuery(
    deferredFilter,
    {
      enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
      refetchOnWindowFocus: false,
    },
  );
  // console.log(personnelPerformance.data);

  // Derived data
  const distincedData = useMemo(
    () =>
      distinctPersonnelPerformanceData(
        personnelPerformance.data,
        ["NationalCode", "NameFamily", "CityName"],
        [
          "CityName",
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
        ],
        { HasTheDayOff: false },
      ),
    [personnelPerformance.data],
  );

  useEffect(() => {
    // if reportPeriod is monthly, set only one cityname to the SelectColumnFilterOptimized CityName filter if there is more than 1 already
    if (filters?.periodType === "ماهانه") {
      const cityNames = getInitialCities.data?.CityNames?.slice(0, 1);
      setDataFilters?.((prev: any) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: cityNames,
        },
      }));
    }
  }, [filters?.periodType, getInitialCities.data?.CityNames, setDataFilters]);

  // Table columns configuration
  const columns = useMemo<CustomColumnDef<PersonnelPerformanceData, any>[]>(
    () =>
      PersonnelPerformanceColumns({
        personnelPerformance: personnelPerformance.data,
        initialFilters: initialFilters.data,
        filters,
        filtersWithNoNetworkRequest,
        setDataFilters,
        setFiltersWithNoNetworkRequest,
        reportPeriod: filters?.periodType,
        getLastDate,
      }),
    [
      personnelPerformance.data,
      filtersWithNoNetworkRequest,
      filters,
      initialFilters.data,
      filters?.periodType,
      getLastDate,
    ],
  );

  // Handle row click
  const handleRowClick = (row: any) => {
    const original = row;

    toast.info(original.NameFamily, {
      description: `عملکرد : ${Math.round(
        original.TotalPerformance,
      )} | ${getPerformanceMetric(original.TotalPerformance)?.tooltip.text}`,
      action: {
        label: "باشه",
        onClick: () => {},
      },
    });
  };

  // Toggle data view
  const toggleDataView = () => {
    setToggleDistinctData((prev) =>
      prev === "Distincted" ? "Pure" : "Distincted",
    );
  };

  const tableData =
    toggleDistinctData === "Distincted"
      ? distincedData
      : personnelPerformance?.data?.result;

  const toSelectionSet = (data, { lowerCaseKeys = true } = {}) => {
    const norm = (k) =>
      lowerCaseKeys ? k.charAt(0).toLowerCase() + k.slice(1) : k;

    const render = (x) => {
      if (Array.isArray(x)) return render(x[0] ?? {});
      if (x && typeof x === "object") {
        const fields = Object.keys(x).map((k) => {
          const v = x[k];
          const key = norm(k);
          if (v && typeof v === "object") return `${key} ${render(v)}`;
          return key;
        });
        return `{${fields.join(", ")}}`;
      }
      return ""; // primitives produce no inner shape
    };

    return render(data);
  };

  // const shape = toSelectionSet(tableData);

  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-5 text-primary"
      dir="rtl"
    >
      <h1 className="py-5 text-right text-2xl text-primary underline underline-offset-[12px]">
        جزئیات عملکرد پرسنل شعب (جدول)
      </h1>

      <div className="relative flex w-full items-center justify-center rounded-lg py-5 text-center">
        <Table<PersonnelPerformanceData>
          hasClickAction
          onClick={handleRowClick}
          isLoading={personnelPerformance.isLoading}
          isFiltering={isFiltering}
          data={tableData}
          columns={columns as ColumnDef<PersonnelPerformanceData>[]}
          renderInFilterView={() => (
            <PersonnelPerformanceFilters getLastDate={getLastDate} />
          )}
          renderAfterFilterView={(flatRows) => (
            <PersonnelPerformanceExport
              flatRows={flatRows}
              columns={columns as ColumnDef<PersonnelPerformanceData>[]}
              personnelPerformance={personnelPerformance.data}
              filters={filters}
              toggleDistinctData={toggleDistinctData}
              distincedData={distincedData}
            />
          )}
          renderChild={(flatRows) => (
            <PersonnelPerformanceSummary
              flatRows={flatRows}
              toggleDistinctData={toggleDistinctData}
              onToggleDataView={toggleDataView}
            />
          )}
        />
      </div>
    </div>
  );
}
