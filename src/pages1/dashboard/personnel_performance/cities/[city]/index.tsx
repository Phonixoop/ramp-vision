import { SparkAreaChart } from "@tremor/react";
import dynamic from "next/dynamic";
import { createServerSideHelpers } from "@trpc/react-query/server";
import moment, { type Moment } from "jalali-moment";
import { Contact2Icon } from "lucide-react";
import { useRouter } from "next/router";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  startTransition,
} from "react";
import { ResponsiveContainer } from "recharts";
import SuperJSON from "superjson";
import { twMerge } from "tailwind-merge";
import PerformanceBadgesLazy from "~/components/main/performance-badges";
import {
  PersonnelPerformanceIcons,
  PersonnelPerformanceTranslate,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  performanceLevels,
} from "~/constants/personnel-performance";
import { usePersonnelFilter } from "~/context/personnel-filter.context";

import AdvancedList from "~/features/advanced-list/indexm";
const Calender = dynamic(() => import("~/features/calender"), { ssr: false });
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
const Gauge = dynamic(() => import("~/features/gauge"), { ssr: false });
import ToolTipSimple from "~/features/tooltip-simple-use";
import { TrendDecider } from "~/features/trend-decider";
import UseUserManager from "~/hooks/userManager";
import { cn, uniqueArray } from "~/lib/utils";

import CitiesPage from "~/pages/dashboard/personnel_performance/cities";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { ButtonWithModal } from "~/ui/button-with-modal";
import Button from "~/ui/buttons";
import H2 from "~/ui/heading/h2";
import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";
import withConfirmation from "~/ui/with-confirmation";

import { api } from "~/trpc/react";
import { api as serverApi } from "~/trpc/server";
import { getMonthNumber } from "~/utils/date-utils";
import {
  distinctPersonnelPerformanceData,
  getMonthNamesFromJOINED_date_strings,
  getPerformanceMetric,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";
import {
  commify,
  getEnglishToPersianCity,
  getPerformanceText,
  getPerformanceTextEn,
  getPersianToEnglishCity,
} from "~/utils/util";

const ButtonWithConfirmation = withConfirmation(Button);

/** Types **/
type Rating = "Weak" | "Average" | "Good" | "Excellent" | "NeedsReview" | "ALL";

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

export default function CityPage({ city: cityFromSSR }: { city: string }) {
  const router = useRouter();

  // Single source of truth for city
  const currentCity =
    typeof router.query.city === "string" ? router.query.city : cityFromSSR;

  /** Queries **/
  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { hasManagePersonnelAccess } = UseUserManager();

  const { filters, reportPeriod, setSelectedPerson, selectedPerson } =
    usePersonnelFilter();

  // gate heavy queries; hooks still run, but queries won't
  const ready = router.isReady && !!currentCity && !!defualtDateInfo.data;
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
      periodType: filters.periodType,
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

  const { data: getAll, isSuccess } = api.personnelPerformance.getAll.useQuery(
    queryInput,
    {
      enabled: ready,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );

  // Mimic previous onSuccess behavior without using the option
  useEffect(() => {
    if (ready && isSuccess) {
      setSelectedPerson(undefined);
    }
  }, [ready, isSuccess]);
  const defaultListRef = useRef<PersonRecord[]>([]);
  const [levelFilter, setLevelFilter] = useState<Rating>("ALL");
  const [updatedList, setUpdatedList] = useState<PersonRecord[]>([]);

  /** Derived data — hooks always run (safe defaults when not ready) **/
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

  const mergedList: PersonRecord[] = useMemo(() => {
    if (!getPersonnels.data || !updatedList) return updatedList ?? [];
    const presentCodes = new Set(updatedList.map((b: any) => b.NationalCode));
    const missing = getPersonnels.data
      .filter((a: any) => !presentCodes.has(a.NationalCode))
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

  const translateKeys = useMemo(
    () => Object.keys(PersonnelPerformanceTranslate),
    [],
  );

  const numericItems = useMemo(() => {
    if (!selectedPerson) return [] as [string, number][];
    const pairs = Object.entries(selectedPerson).filter(
      ([_, v]) => typeof v === "number",
    ) as [string, number][];
    return [...pairs].sort(
      (a, b) => translateKeys.indexOf(a[0]) - translateKeys.indexOf(b[0]),
    );
  }, [selectedPerson, translateKeys]);

  const nonNumericItems = useMemo(() => {
    if (!selectedPerson) return [] as [string, string][];
    return Object.entries(selectedPerson).filter(
      ([_, v]) => typeof v === "string",
    ) as [string, string][];
  }, [selectedPerson]);

  /** Handlers **/
  const onFilterByLevel = useCallback((rating: Rating) => {
    startTransition(() => {
      setLevelFilter((prev) => (prev === rating ? "ALL" : rating));
    });
  }, []);

  const onListChange = useCallback((list: PersonRecord[]) => {
    setUpdatedList(list);
  }, []);

  /** Render **/
  return (
    <CitiesPage>
      <p className="text-primary">{currentCity}</p>
      <p className="text-accent">
        {pageLoading || getAll.isFetching ? "loading" : ""}
      </p>

      <AdvancedList
        title={
          <span className="flex items-center justify-center gap-2 text-primary">
            پرسنل
            <Contact2Icon
              className={
                !displayedList?.length ? "animate-bounce duration-75" : ""
              }
            />
          </span>
        }
        isLoading={pageLoading || getAll.isLoading}
        disabled={pageLoading || !displayedList?.length}
        list={() => displayedList}
        filteredList={
          !(pageLoading || getAll.isLoading)
            ? displayedList
            : Array.from({ length: 10 }, () => undefined as any)
        }
        selectProperty={"NameFamily"}
        downloadFileName={`${getEnglishToPersianCity(
          currentCity,
        )} عملکرد پرسنل شهر ${
          reportPeriod === "ماهانه" &&
          (filters.filter.Start_Date?.length ?? 0) === 1
            ? moment(filters.filter.Start_Date![0]!, "jYYYY,jMM,jDD")
                .locale("fa")
                .format("YYYY jMMMM")
            : (filters.filter.Start_Date ?? []).join(",")
        }`}
        headers={[
          { label: "عملکرد", key: "TotalPerformance" },
          { label: "پرسنل", key: "NameFamily" },
        ]}
        dataToDownload={displayedList}
        onChange={onListChange}
        renderUnderButtons={() => (
          <div
            dir="rtl"
            className="flex w-full items-center justify-center gap-2 py-2"
          >
            {performanceLevels.map((level) => {
              const isSelected = levelFilter === (level.enText as Rating);
              return (
                <Button
                  key={level.enText}
                  onClick={() => onFilterByLevel(level.enText as Rating)}
                  className={cn(
                    "rounded-full px-2 py-1 text-sm",
                    isSelected ? "text-white" : "text-primary",
                  )}
                  style={{
                    backgroundColor: isSelected ? level.color : "transparent",
                    borderColor: level.color,
                    borderWidth: "1px",
                  }}
                >
                  {level.text}
                </Button>
              );
            })}
          </div>
        )}
        renderItem={(user: PersonRecord) => (
          <PersonnelRow
            key={user?.NationalCode ?? user?.NameFamily}
            user={user}
            activeKey={{
              nc: selectedPerson?.NationalCode,
              id: (selectedPerson as any)?.Id,
            }}
            getAllData={getAll.data?.result ?? []}
            onSelect={(sparkData) => setSelectedPerson({ ...user, sparkData })}
          />
        )}
      />

      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn p-1">
        {!!selectedPerson && (
          <>
            <div className="flex w-full flex-col items-start justify-center gap-5 xl:flex-row">
              {/* Metrics grid */}
              <div
                className="grid grid-cols-1 divide-x-[1px] divide-y-[1px] divide-dashed divide-primbuttn rounded-xl bg-secondary p-2 lg:grid-cols-2"
                dir="rtl"
              >
                {numericItems.map(([key, value], index) => {
                  if (!PersonnelPerformanceIcons[key]) return null;
                  const isLastItem = index === numericItems.length - 1;
                  const isZero = (value as number) <= 0;
                  return (
                    <React.Fragment key={key}>
                      <div
                        className={twMerge(
                          "group flex flex-col justify-center gap-2 p-2 last:bg-primary/80 hover:opacity-100 md:col-span-1",
                          isZero ? "opacity-50" : "bg-secbuttn",
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-between gap-4 rounded-xl p-2">
                          <span
                            className={twMerge(
                              !isZero
                                ? "animate-path animate-[move_200s_linear_infinite]"
                                : "",
                            )}
                          >
                            {PersonnelPerformanceIcons[key]}
                          </span>
                          <span
                            className={twMerge(
                              "text-primary group-last:text-secondary",
                              !isZero ? "font-bold" : "text-sm",
                            )}
                          >
                            {PersonnelPerformanceTranslate[key]}
                          </span>
                          <span
                            className={twMerge(
                              "text-primary group-last:text-secondary",
                              !isZero ? "font-bold" : "text-sm",
                            )}
                          >
                            {commify(
                              Number.isInteger(value)
                                ? value
                                : ((value as number).toFixed(2) as any),
                            )}
                          </span>
                        </div>
                      </div>
                      {numericItems.length % 2 !== 0 && isLastItem && (
                        <div className="cross_hatch_pattern hidden w-full max-w-sm rounded-xl sm:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Details & Roles */}
              <div className="grid gap-4" dir="rtl">
                {nonNumericItems.map(([key, value], index) => {
                  if (!value || key === "Id") return null;
                  const isLastItem = index === nonNumericItems.length - 1;
                  let displayValue: string = value as string;
                  if (key === "Start_Date") {
                    displayValue = getMonthNamesFromJOINED_date_strings(
                      value as string,
                      getAll.data?.periodType,
                    );
                  }
                  return (
                    <ToolTipSimple
                      key={key}
                      className="cursor-auto bg-secondary"
                      tooltip={
                        <span className="text-base text-primary">
                          {PersonnelPerformanceTranslate[key] ?? key}
                        </span>
                      }
                    >
                      <div
                        className={twMerge(
                          "flex min-w-[150px] cursor-auto items-center justify-center gap-2 rounded-2xl bg-secondary p-2",
                          isLastItem || index === 0
                            ? "md:col-span-2"
                            : "col-span-1",
                        )}
                      >
                        <span className="max-w-[250px] select-text break-words text-center font-bold text-accent">
                          {displayValue}
                        </span>
                      </div>
                    </ToolTipSimple>
                  );
                })}

                <RolesByBranchModal selectedPerson={selectedPerson as any} />

                {/* Calendar */}
                <div className="relative col-span-2 w-full overflow-hidden rounded-xl bg-accent/10 p-1">
                  {(selectedPerson as any)?.sparkData?.length > 0 ? (
                    <Calender
                      withMonthMenu
                      collapsedUi
                      listOfDates={uniqueArray(
                        (selectedPerson as any).sparkData.map((a: any) =>
                          moment(a.Start_Date, "jYYYY/jMM/jDD")
                            .format("jYYYY/jMM")
                            .slice(0, 7),
                        ),
                      ).map((a) => moment(a, "jYYYY/jMM "))}
                      year={Number.parseInt(
                        (selectedPerson as any).sparkData[0].Start_Date.split(
                          "/",
                        )[0],
                      )}
                      defaultMonth={getMonthNumber(
                        (selectedPerson as any).sparkData[0].Start_Date,
                      )}
                      onDate={(date, monthNumber) => {
                        const userCalData = (
                          selectedPerson as any
                        ).sparkData.find(
                          (d: any) =>
                            d.Start_Date === date.format("YYYY/MM/DD"),
                        );
                        const userMetric = getPerformanceMetric(
                          userCalData?.TotalPerformance,
                        );
                        const hasTheDayOff = getAll.data?.result?.find(
                          (a: any) =>
                            a.Start_Date === date.format("YYYY/MM/DD") &&
                            a.NationalCode ===
                              (selectedPerson as any).key.NationalCode,
                        )?.HasTheDayOff;

                        return Number.parseInt(date.format("M")) !==
                          monthNumber + 1 ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-primary/50"
                              style={{
                                backgroundColor: userCalData
                                  ? userMetric.color
                                  : undefined,
                              }}
                            >
                              {date.format("D")}
                            </span>
                          </div>
                        ) : (
                          <ToolTipSimple
                            className="cursor-default bg-secondary"
                            tooltip={
                              <span
                                style={{
                                  color: userCalData
                                    ? userMetric.color
                                    : undefined,
                                }}
                                className="text-base text-primary"
                              >
                                {hasTheDayOff
                                  ? "مرخصی"
                                  : userCalData?.TotalPerformance?.toFixed(2)}
                              </span>
                            }
                          >
                            {hasManagePersonnelAccess ? (
                              <Button
                                className={twMerge(
                                  "p-2",
                                  hasTheDayOff === true
                                    ? "bg-white text-secondary"
                                    : "bg-secondary",
                                )}
                                style={{
                                  backgroundColor: userCalData
                                    ? userMetric.color
                                    : undefined,
                                }}
                                onClick={() => {
                                  const result =
                                    distinctPersonnelPerformanceData(
                                      getAll.data ?? [],
                                      [
                                        "NationalCode",
                                        "NameFamily",
                                        "CityName",
                                      ],
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
                                        "HasTheDayOff",
                                      ],
                                      {
                                        HasTheDayOff: false,
                                        Start_Date:
                                          date.format("jYYYY/jMM/jDD"),
                                      },
                                    ).find(
                                      (a: any) =>
                                        a.key.NationalCode ===
                                        (selectedPerson as any).key
                                          .NationalCode,
                                    );
                                  setSelectedPerson({
                                    ...(selectedPerson as any),
                                    ...(result as any),
                                  });
                                }}
                              >
                                <SingleDayView date={date} />
                              </Button>
                            ) : (
                              <div
                                className={twMerge(
                                  "flex w-max cursor-default items-center justify-center rounded-lg p-2",
                                  hasTheDayOff === true
                                    ? "bg-white text-secondary"
                                    : "bg-secondary",
                                )}
                                style={{
                                  backgroundColor: userCalData
                                    ? userMetric.color
                                    : undefined,
                                }}
                              >
                                <SingleDayView date={date} />
                              </div>
                            )}
                          </ToolTipSimple>
                        );
                      }}
                    />
                  ) : (
                    <div className="w-full text-center text-accent">
                      بدون داده
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gauges */}
            <div className="flex w-full flex-col items-center justify-center">
              <PerformanceBadgesLazy />
              <div className="flex flex-col items-center justify-center lg:flex-row">
                <div className="col-span-2 flex w-full flex-col items-center justify-center">
                  <H2>عملکرد کلی</H2>
                  <Gauge value={(selectedPerson as any)?.TotalPerformance} />
                  <p className="text-accent">
                    {getPerformanceText(
                      (selectedPerson as any)?.TotalPerformance,
                    )}
                  </p>
                </div>
                <div className="col-span-2 flex w-full flex-col items-center justify-center">
                  <H2>عملکرد مستقیم</H2>
                  <Gauge value={(selectedPerson as any)?.DirectPerFormance} />
                  <p className="text-accent">
                    {getPerformanceText(
                      (selectedPerson as any)?.DirectPerFormance,
                    )}
                  </p>
                </div>
                <div className="col-span-2 flex w-full flex-col items-center justify-center">
                  <H2>عملکرد غیر مستقیم</H2>
                  <Gauge value={(selectedPerson as any)?.InDirectPerFormance} />
                  <p className="text-accent">
                    {getPerformanceText(
                      (selectedPerson as any)?.InDirectPerFormance,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {/* City overview */}
        <div
          dir="rtl"
          className={twMerge(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl p-5",
            selectedPerson ? "" : "",
          )}
        >
          <ResponsiveContainer width="99%" height="auto">
            <CitiesWithDatesPerformanceBarChart
              filters={{
                ...filters,
                filter: { ...filters.filter, CityName: [currentCity] },
              }}
            />
          </ResponsiveContainer>
        </div>
      </div>
    </CitiesPage>
  );
}

/** Personnel Row **/
const PersonnelRow = React.memo(
  function PersonnelRow({
    user,
    activeKey,
    getAllData,
    onSelect,
  }: {
    user: PersonRecord;
    activeKey: { nc?: string; id?: string | number };
    getAllData: any[];
    onSelect: (sparkData: any[]) => void;
  }) {
    const userPerformances = useMemo(() => {
      return (getAllData || [])
        .filter((x: any) => x.NameFamily === user.NameFamily)
        .map((m: any) => m.TotalPerformance);
    }, [getAllData, user.NameFamily]);

    const sparkData = useMemo(() => {
      return sparkChartForPersonnel(getAllData, "NameFamily", user.NameFamily, [
        "BranchName",
        "Role",
      ]);
    }, [getAllData, user.NameFamily]);

    if (!user?.NationalCode) {
      return (
        <div className="flex w-full animate-pulse flex-row-reverse items-center justify-between gap-2 rounded-xl bg-secondary/60 p-3 text-right text-primary">
          <span className="h-5 w-10 rounded-lg bg-secbuttn" />
          <div className="flex w-full items-center justify-start px-2">
            <span className="w-40 rounded-lg bg-secbuttn py-5" />
          </div>
          <span className="h-5 w-10 rounded-lg bg-secbuttn" />
          <span className="h-4 w-4 rounded-lg bg-secbuttn" />
        </div>
      );
    }

    const isActive =
      user.NationalCode === activeKey?.nc &&
      (user as any)?.Id === activeKey?.id;

    return (
      <Button
        className={twMerge(
          "rounded-xl disabled:bg-secbuttn",
          isActive
            ? "sticky top-24 z-10 bg-primary text-secondary"
            : "bg-secondary text-primary",
        )}
        onClick={() => onSelect(sparkData)}
      >
        <div className="flex w-full flex-row-reverse items-center justify-between gap-2 px-2 text-right">
          {user.Start_Date && (
            <div className="w-10">
              {isActive ? (
                <BarChart3Loading />
              ) : (
                <ChevronLeftIcon className="h-4 w-4 fill-none stroke-primary" />
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-center">
            <TrendDecider values={userPerformances} />
            {user.TotalPerformance?.toFixed?.(0)}%
          </div>

          <div className="flex w-full items-center justify-center">
            <SparkAreaChart
              data={sparkData}
              categories={[
                "TotalPerformance",
                "Benchmark",
                "Benchmark2",
                "Benchmark3",
              ]}
              noDataText="بدون داده"
              index={"Start_Date"}
              colors={["purple", "rose", "cyan"]}
              className={twMerge(
                "dash-a h-10 w-36 cursor-pointer",
                isActive
                  ? "animate-path animate-[move_100s_linear_infinite]"
                  : "",
              )}
            />
          </div>

          <span className="w-full text-sm">{user.NameFamily}</span>
        </div>
      </Button>
    );
  },
  (prev, next) => {
    return (
      prev.user.NationalCode === next.user.NationalCode &&
      prev.user.TotalPerformance === next.user.TotalPerformance &&
      prev.activeKey.nc === next.activeKey.nc &&
      prev.activeKey.id === next.activeKey.id &&
      prev.getAllData === next.getAllData
    );
  },
);

/** Roles modal **/
function RolesByBranchModal({ selectedPerson }: { selectedPerson: any }) {
  const grouped = useMemo(() => {
    if (!selectedPerson?.sparkData)
      return [] as {
        key: string;
        branch: string;
        role: string;
        startDates: string[];
      }[];
    const map = new Map<
      string,
      { branch: string; role: string; startDates: string[] }
    >();
    for (const day of selectedPerson.sparkData) {
      const k = `${day.BranchName}-${day.Role}`;
      if (!map.has(k))
        map.set(k, { branch: day.BranchName, role: day.Role, startDates: [] });
      map.get(k)!.startDates.push(day.Start_Date);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
  }, [selectedPerson?.sparkData]);

  return (
    <ButtonWithModal
      buttonProps={{ className: "w-full rounded-xl bg-primary text-secondary" }}
      buttonChildren={<span className="text-contrast">واحد پذیرش</span>}
      modalProps={{
        title: `نقش های ${selectedPerson?.NameFamily ?? ""}`,
        size: "sm",
        center: true,
        className: "bg-secondary",
      }}
    >
      {() => (
        <div className="flex flex-col gap-2 p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/20">
                <th className="p-2 text-right text-primary">شعبه</th>
                <th className="p-2 text-right text-primary">نقش</th>
                <th className="p-2 text-right text-primary">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => (
                <tr key={row.key} className="border-b border-accent/10">
                  <td className="p-2 text-accent">{row.branch || "نامشخص"}</td>
                  <td className="p-2 text-accent">{row.role || "نامشخص"}</td>
                  <td className="p-2 text-accent">
                    {row.startDates.length > 1 ? (
                      <ButtonWithModal
                        buttonProps={{
                          className:
                            "text-accent hover:text-primary bg-accent/10",
                        }}
                        buttonChildren={
                          <span className="text-contrast">تاریخ ها</span>
                        }
                        modalProps={{
                          title: "تاریخ",
                          size: "sm",
                          center: true,
                          className: "bg-secondary",
                        }}
                      >
                        {() => (
                          <div className="flex flex-col gap-2 p-4">
                            {row.startDates.slice(1).map((date, i) => (
                              <div key={i} className="text-accent">
                                {date}
                              </div>
                            ))}
                          </div>
                        )}
                      </ButtonWithModal>
                    ) : row.startDates.length > 0 ? (
                      row.startDates[0]
                    ) : (
                      "نامشخص"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ButtonWithModal>
  );
}

/** Day off toggle (unchanged API; kept for reference) **/
export function TogglePersonelDayOffButton({
  hasTheDayOff,
  selectedPerson,
  date,
  userCalData,
  userMetric,
}: {
  hasTheDayOff: boolean;
  selectedPerson: {
    cityName: string;
    nationalCode: string;
    nameFamily: string;
  };
  date: Moment;
  userCalData: any;
  userMetric: { limit: number; color: string; tooltip: { text: string } };
}) {
  const utils = api.useContext();
  const togglePersonnelDayOffMutation =
    api.personnelPerformance.togglePersonnelDayOff.useMutation();

  const textForDayOff = `آیا میخواهید این روز را مرخصی رد کنید؟`;
  const textForDayOn = `آیا میخواهید این روز را مرخصی بودن خارج کنید؟`;

  return (
    <ButtonWithConfirmation
      title={hasTheDayOff ? textForDayOn : textForDayOff}
      confirmText="بله"
      cancelText="خیر"
      className={twMerge(
        "p-2",
        hasTheDayOff === true ? "bg-white text-secondary" : "bg-secondary",
      )}
      style={{ backgroundColor: userCalData ? userMetric.color : undefined }}
      onConfirm={async () => {
        togglePersonnelDayOffMutation.mutate({
          date: date.format("YYYY/MM/DD"),
          nationalCode: selectedPerson.nationalCode,
          cityName: getPersianToEnglishCity(selectedPerson.cityName),
          nameFamily: selectedPerson.nameFamily,
        });
        await utils.personnelPerformance.getAll.invalidate();
      }}
    >
      <SingleDayView date={date} />
    </ButtonWithConfirmation>
  );
}

function SingleDayView({ date }: { date: Moment }) {
  return (
    <span
      className={twMerge(
        "flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs text-primary",
      )}
    >
      {date.format("D")}
    </span>
  );
}

export async function getServerSideProps(ctx: any) {
  const city = ctx.params?.city;
  if (typeof city !== "string") throw new Error("no slug");

  await serverApi.personnelPerformance.getAll.prefetch({
    filter: {
      CityName: [city.toString()],
      Start_Date: [
        moment().locale("fa").subtract(3, "days").format("YYYY/MM/DD"),
      ],
    },
    periodType: "روزانه",
  });

  return { props: { city } };
}
