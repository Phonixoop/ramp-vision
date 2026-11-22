"use client";
import { useSession } from "next-auth/react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import moment from "jalali-moment";
import { toast } from "sonner";

import Table from "~/features/table";
import { PersonnelPerformanceTableProps } from "../types";
import {
  collapseCitiesForFilterList,
  countCollapsedCities,
  deriveTehranSubCitiesFromFilter,
  distinctPersonnelPerformanceData,
  expandCityFilterSelection,
  getPerformanceMetric,
  mergeMissingPersonnelsIntoPerformance,
} from "~/utils/personnel-performance";
import { PersonnelPerformanceColumns } from "./PersonnelPerformanceColumns";
import { PersonnelPerformanceFilters } from "./PersonnelPerformanceFilters";
import { PersonnelPerformanceSummary } from "./PersonnelPerformanceSummary";
import { PersonnelPerformanceExport } from "./PersonnelPerformanceExport";
import { ColumnDef } from "@tanstack/react-table";
import { PersonnelPerformanceData } from "../types";
import { usePersonnelPerformance } from "../context";
import { TableFiltersContainerSkeleton } from "./TableFilterSkeleton";
import { CustomColumnDef } from "~/types/table";
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";
import WorkDaysToggle from "~/features/work-days-toggle";
import { readSavedDefaults } from "~/app/v2/dashboard/personnel_performance/chart/model";

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

  const { useWorkDays, setUseWorkDays } = useWorkDaysToggle();

  // Apply saved work-days preference once after mount (filters hydrate in context).
  useEffect(() => {
    const saved = readSavedDefaults();
    if (saved) setUseWorkDays(saved.work_days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Update filters when initial cities are available (only if no cities are already selected)
  useEffect(() => {
    if (
      getInitialCities.data?.CityNames &&
      !filters?.filter?.CityName?.length
    ) {
      setDataFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: getInitialCities.data.CityNames,
        },
      }));
    }
  }, [getInitialCities.data?.CityNames, filters?.filter?.CityName]);

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

  // Initial filters query
  const initialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        ProjectType: filters.filter.ProjectType,
        DateInfo: filters.filter.DateInfo ?? [defualtDateInfo.data ?? ""],
      },
    },
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );

  // Deferred filter for performance
  const deferredFilter = useDeferredValue(filters);

  // Main data query
  const personnelPerformance = api.personnelPerformance.getAll.useQuery(
    deferredFilter,
    {
      enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
      refetchOnWindowFocus: false,
      staleTime: 0, // Force refetch on every change
    },
  );

  // Same as chart city page: users_info roster (no Role/Contract filters) so
  // people without performance rows for the period remain searchable.
  const hasDateInfo = Boolean(
    filters?.filter?.DateInfo?.length || defualtDateInfo.data,
  );
  const getPersonnels = api.personnel.getAll.useQuery(
    {
      filter: {
        CityName: filters?.filter?.CityName ?? [],
        DateInfo: filters?.filter?.DateInfo ?? [
          defualtDateInfo.data ?? "",
        ],
      },
    },
    {
      enabled: sessionData?.user !== undefined && hasDateInfo,
      refetchOnWindowFocus: false,
    },
  );
  // Debug logging
  console.log("🔍 Current filters:", filters);
  console.log("🔍 Deferred filter:", deferredFilter);
  console.log(
    "🔍 Query enabled:",
    sessionData?.user !== undefined && !initialFilters.isLoading,
  );
  console.log("🔍 Query status:", {
    isLoading: personnelPerformance.isLoading,
    isFetching: personnelPerformance.isFetching,
    isError: personnelPerformance.isError,
    error: personnelPerformance.error,
    dataLength: personnelPerformance.data?.result?.length || 0,
  });

  // Prepare months array for work days calculation
  const monthsArray = useMemo(() => {
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

  // Fetch total work days from tRPC
  const { data: workDaysData } = api.monthWorkDays.getTotalWorkDays.useQuery(
    { months: monthsArray },
    {
      enabled: monthsArray.length > 0,
      staleTime: 5 * 60 * 1000,
    },
  );

  const totalWorkDays = workDaysData?.totalWorkDays || null;

  // Debug the data before processing
  console.log("🔍 Raw personnel data:", personnelPerformance.data);

  // Derived data
  const distincedData = useMemo(() => {
    console.log("🔍 Processing data with:", {
      data: personnelPerformance.data,
      hasData: !!personnelPerformance.data,
      dataResult: personnelPerformance.data?.result,
      dataResultLength: personnelPerformance.data?.result?.length,
    });

    const distinct = distinctPersonnelPerformanceData(
      personnelPerformance.data,
      ["NationalCode", "NameFamily", "CityName"],
      [
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
        "PersonnelCode",
        "TotalPerformance",
        "DirectPerFormance",
        "InDirectPerFormance",
        "Start_Date",
        "DateInfo",
        "HasTheDayOff",
        "RealCityName",
        "NationalCode",
      ],
      { HasTheDayOff: false },
      useWorkDays ? totalWorkDays : null, // Pass work days if toggle is enabled
    );

    return mergeMissingPersonnelsIntoPerformance(
      distinct,
      getPersonnels.data,
    );
  }, [
    personnelPerformance.data,
    getPersonnels.data,
    useWorkDays,
    totalWorkDays,
  ]);

  const pureMergedData = useMemo(
    () =>
      mergeMissingPersonnelsIntoPerformance(
        personnelPerformance?.data?.result,
        getPersonnels.data,
      ),
    [personnelPerformance?.data?.result, getPersonnels.data],
  );

  // Roster + performance rows for personnel filter / search (includes zero-perf people).
  const personnelFilterSource = useMemo(
    () => ({
      ...(personnelPerformance.data ?? {}),
      result: pureMergedData,
    }),
    [personnelPerformance.data, pureMergedData],
  );

  // Debug the processed data
  console.log("🔍 Processed distinct data:", distincedData);

  useEffect(() => {
    // Monthly allows a single logical city; Tehran variants count as one (expand under the hood).
    if (
      filters?.periodType === "ماهانه" &&
      countCollapsedCities(filters?.filter?.CityName) > 1
    ) {
      const collapsed = collapseCitiesForFilterList(
        filters.filter.CityName ?? [],
      ).slice(0, 1);
      const tehranSubs = deriveTehranSubCitiesFromFilter(
        filters.filter.CityName,
      );
      const cityNames = expandCityFilterSelection(collapsed, tehranSubs);
      setDataFilters?.((prev: any) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: cityNames,
        },
      }));
    }
  }, [filters?.periodType, filters?.filter?.CityName, setDataFilters]);

  // Table columns configuration - use a more stable approach
  const columns = useMemo<CustomColumnDef<PersonnelPerformanceData, any>[]>(
    () =>
      PersonnelPerformanceColumns({
        personnelPerformance: personnelFilterSource,
        initialFilters: initialFilters.data,
        filters,
        filtersWithNoNetworkRequest,
        setDataFilters,
        setFiltersWithNoNetworkRequest,
        reportPeriod: filters?.periodType,
        getLastDate,
      }),
    [
      personnelFilterSource,
      initialFilters.data,
      getLastDate,
      setDataFilters,
      setFiltersWithNoNetworkRequest,
      filters?.periodType,
      filters?.filter?.CityName?.length,
      filters?.filter?.ProjectType?.join(","),
      filtersWithNoNetworkRequest?.filter?.ContractType?.join(","),
      filtersWithNoNetworkRequest?.filter?.Role?.join(","),
      filtersWithNoNetworkRequest?.filter?.RoleType?.join(","),
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
    toggleDistinctData === "Distincted" ? distincedData : pureMergedData;

  // Debug table data
  console.log("🔍 Table data:", {
    toggleDistinctData,
    distincedDataLength: distincedData?.length || 0,
    rawDataLength: personnelPerformance?.data?.result?.length || 0,
    tableDataLength: tableData?.length || 0,
    tableData: tableData,
  });

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

      {/* Work Days Toggle */}
      <div className="flex justify-center py-2">
        <WorkDaysToggle
          isEnabled={useWorkDays}
          onToggle={setUseWorkDays}
          totalWorkDays={totalWorkDays}
          className="rounded-lg bg-primary/5 px-4 py-2"
        />
      </div>

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
