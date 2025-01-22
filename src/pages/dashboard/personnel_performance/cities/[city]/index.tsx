import { AreaChart, BarChart, SparkAreaChart } from "@tremor/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import moment, { Moment } from "jalali-moment";
import {
  Contact2Icon,
  MinusIcon,
  MinusSquareIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { InferGetStaticPropsType, NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { use, useEffect, useMemo, useState } from "react";
import { ResponsiveContainer } from "recharts";
import SuperJSON from "superjson";
import { twMerge } from "tailwind-merge";
import PerformanceBadges from "~/components/main/performance-badges";
import { CITIES } from "~/constants";
import {
  PersonnelPerformanceIcons,
  PersonnelPerformanceTranslate,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import { usePersonnelFilter } from "~/context/personnel-filter.context";

import AdvancedList from "~/features/advanced-list";
import Calender from "~/features/calender";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import Gauge from "~/features/gauge";
import ToolTipSimple from "~/features/tooltip-simple-use";
import { TrendDecider } from "~/features/trend-decider";
import UseUserManager from "~/hooks/userManager";
import { uniqueArray } from "~/lib/utils";

import CitiesPage from "~/pages/dashboard/personnel_performance/cities";
import { appRouter } from "~/server/api/root";
import { CityWithPerformanceData, Permission } from "~/types";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import H2 from "~/ui/heading/h2";
import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";
import withConfirmation from "~/ui/with-confirmation";

import { api } from "~/utils/api";
import { getMonthNumber } from "~/utils/date-utils";
import {
  distinctPersonnelPerformanceData,
  getMonthNamesFromJOINED_date_strings,
  getPerformanceMetric,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";
import {
  DistinctData,
  analyzePerformanceTrend,
  commify,
  getEnglishToPersianCity,
  getPerformanceText,
  getPersianToEnglishCity,
  processDataForChart,
} from "~/utils/util";

const ButtonWithConfirmation = withConfirmation(Button);

export default function CityPage({ children, city }) {
  const { session, hasManagePersonnelAccess } = UseUserManager();
  const utils = api.useContext();

  const router = useRouter();
  const {
    filters,
    setFilters,
    reportPeriod,
    setReportPeriod,
    selectedDates,
    setSelectedDates,
    selectedPerson,
    setSelectedPerson,
    setSelectedCity,
  } = usePersonnelFilter();
  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery();
  const getPersonnls = api.personnel.getAll.useQuery(
    {
      filter: {
        CityName: [city],

        DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo.data],
      },
    },
    {
      onSuccess: (data) => {},
      refetchOnWindowFocus: false,
    },
  );
  const getAll = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [city],
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
    },
    {
      enabled: !!defualtDateInfo.data,
      onSuccess: (data) => {
        setSelectedPerson(undefined);

        const result = distinctPersonnelPerformanceData(
          data ?? [],
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

        setUpdatedList(result);

        if (!selectedPerson) return;

        // const sparkData = sparkChartForPersonnel(
        //   result,
        //   "NameFamily",
        //   selectedPerson.NameFamily,
        // );
        // setSelectedPerson({
        //   ...selectedPerson,
        //   sparkData,
        // });
      },
      refetchOnWindowFocus: false,
    },
  );

  const [updatedList, setUpdatedList] = useState([]);

  const numericItems = Object.entries(selectedPerson ?? []).filter(
    ([key, value]) => typeof value === "number",
  );
  //console.log({ selectedPerson });
  const noneNumericItems = Object.entries(selectedPerson ?? []).filter(
    ([key, value]) => typeof value === "string",
  );

  const translateKeys = Object.keys(PersonnelPerformanceTranslate);

  // Sort the numericItems based on the order in translateKeys
  numericItems.sort(
    (a, b) => translateKeys.indexOf(a[0]) - translateKeys.indexOf(b[0]),
  );

  // const fullData = useMemo(
  //   () =>
  //     distinctPersonnelPerformanceData(getAll?.data ?? [], ["Start_Date"]).map(
  //       (d) => {
  //         // d.TotalPerformance = calculatePerformance(d, getAll?.data?.dateLength);
  //         const translatedData = {};
  //         for (const key in d) {
  //           if (PersonnelPerformanceTranslate[key]) {
  //             translatedData[PersonnelPerformanceTranslate[key]] = d[key];
  //           } else {
  //             translatedData[key] = d[key];
  //           }
  //         }

  //         return translatedData;
  //       },
  //     ),
  //   [getAll?.data?.result],
  // );

  useEffect(() => {
    setSelectedPerson(undefined);
  }, [router]);

  function getUpdatedListByAddindPersonnelList(list) {
    if (!getPersonnls.data || !list) return [];
    // Create a Set of NationalCodes from prev for efficient look-up
    const prevNationalCodes = new Set(list.map((b) => b.NationalCode));

    // Filter getPersonnls.data to exclude items with NationalCodes already in prev
    const filteredData = getPersonnls.data
      .filter((a) => !prevNationalCodes.has(a.NationalCode))
      .map((a) => {
        return {
          ...a,
          TotalPerformance: 0,
          key: {
            CityName: a.CityName,
            NameFamily: a.NameFamily,
            NationalCode: a.NationalCode,
          },
        };
      });
    // console.log({ list, filteredData });
    // Concatenate prev and the filtered data to create the updated list
    return [...list, ...filteredData];
  }

  return (
    <CitiesPage>
      <AdvancedList
        title={
          <span className="flex items-center justify-center gap-2  text-primary  ">
            پرسنل
            <Contact2Icon
              className={!!!updatedList ? "animate-bounce duration-75" : ""}
            />
          </span>
        }
        isLoading={getAll.isLoading}
        disabled={!!!updatedList}
        list={() => getUpdatedListByAddindPersonnelList(updatedList)}
        filteredList={
          !getAll.isLoading
            ? getUpdatedListByAddindPersonnelList(updatedList)
            : [...new Array(10).map((a) => [undefined, a])]
        }
        selectProperty={"NameFamily"}
        downloadFileName={`${getEnglishToPersianCity(
          router.query.city as string,
        )} عملکرد پرسنل شهر ${
          reportPeriod === "ماهانه" && filters.filter.Start_Date.length == 1
            ? moment(filters.filter.Start_Date[0], "jYYYY,jMM,jDD")
                .locale("fa")
                .format("YYYY jMMMM")
            : filters.filter.Start_Date.join(",")
        }`}
        headers={[
          { label: "عملکرد", key: "TotalPerformance" },
          { label: "پرسنل", key: "NameFamily" },
        ]}
        dataToDownload={getUpdatedListByAddindPersonnelList(updatedList)}
        onChange={(updatedList) => {
          setUpdatedList(() =>
            getUpdatedListByAddindPersonnelList(updatedList),
          );
        }}
        renderItem={(user, i) => {
          if (!user?.NationalCode)
            return (
              <div
                key={i}
                className=" flex  w-full animate-pulse flex-row-reverse items-center justify-between gap-2 rounded-xl bg-secondary/60 p-3 text-right text-primary"
              >
                <span className="h-5 w-10 rounded-lg bg-secbuttn" />

                <div className="flex w-full items-center justify-start px-2">
                  <span className=" w-40 rounded-lg bg-secbuttn py-5" />
                </div>
                <span className="h-5 w-10 rounded-lg bg-secbuttn" />
                <span className="h-4 w-4 rounded-lg bg-secbuttn" />
              </div>
            );
          const isActive =
            user.NationalCode === selectedPerson?.NationalCode &&
            user?.Id === selectedPerson?.Id;
          const userPerformances = getAll?.data?.result
            .filter((x) => x.NameFamily === user.NameFamily)
            .map((m) => {
              return m.TotalPerformance;
            });

          // ||
          // user.NationalCode === router.query.personnel;

          const sparkData = sparkChartForPersonnel(
            getAll?.data?.result,
            "NameFamily",
            user.NameFamily,
          );

          return (
            <>
              <Button
                key={i}
                //  disabled={!user.Start_Date}
                className={twMerge(
                  "rounded-xl disabled:bg-secbuttn ",
                  isActive
                    ? "sticky top-24 z-10 bg-primary text-secondary "
                    : " bg-secondary  text-primary",
                )}
                onClick={() => {
                  // router.push(
                  //   `/dashboard/personnel_performance/cities/${city}/?personnel=${user.NationalCode}`,
                  //   undefined,
                  //   {
                  //     shallow: true,
                  //   },
                  // );
                  setSelectedPerson({
                    ...user,
                    sparkData: sparkChartForPersonnel(
                      getAll?.data?.result,
                      "NameFamily",
                      user.NameFamily,
                    ),
                  });
                }}
              >
                <div className=" flex w-full flex-row-reverse items-center justify-between gap-2  px-2 text-right ">
                  {user.Start_Date && (
                    <>
                      <div className=" w-10">
                        {isActive ? (
                          <BarChart3Loading />
                        ) : (
                          <>
                            <ChevronLeftIcon className="h-4 w-4 fill-none stroke-primary" />
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex flex-col items-center justify-center">
                    <TrendDecider values={userPerformances} />
                    {user.TotalPerformance.toFixed(0)}
                    {"%"}
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
                        " dash-a h-10 w-36  cursor-pointer",
                        isActive
                          ? "animate-path animate-[move_100s_linear_infinite]"
                          : "",
                      )}
                    />
                  </div>
                  <span className="w-full text-sm ">{user.NameFamily}</span>
                </div>
              </Button>
            </>
          );
        }}
      />

      <div className="flex  w-full flex-col items-center justify-center gap-5  rounded-2xl bg-secbuttn p-1">
        {selectedPerson && (
          <>
            <div className="flex w-full flex-col items-start justify-center gap-5 xl:flex-row">
              <div
                className="grid grid-cols-1  divide-x-[1px] divide-y-[1px] divide-dashed divide-primbuttn rounded-xl bg-secondary  p-2 lg:grid-cols-2 "
                dir="rtl"
              >
                {numericItems.map(([key, value], index, array) => {
                  const isLastItem = index === array.length - 1;

                  if (!PersonnelPerformanceIcons[key]) return;
                  return (
                    <>
                      <div
                        key={key}
                        className={twMerge(
                          "group flex flex-col justify-center gap-2  p-2 last:bg-primary/80 hover:opacity-100  md:col-span-1 ",
                          (value as number) <= 0 ? "opacity-50" : "bg-secbuttn",
                          // isLastItem ? " md:col-span-2" : "md:col-span-1",
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-between  gap-4 rounded-xl  p-2">
                          <span
                            className={twMerge(
                              (value as number) > 0
                                ? "animate-path animate-[move_200s_linear_infinite]"
                                : "",
                            )}
                          >
                            {PersonnelPerformanceIcons[key]}
                          </span>
                          <span
                            className={twMerge(
                              "  text-primary group-last:text-secondary",
                              (value as number) > 0 ? "font-bold" : "text-sm",
                            )}
                          >
                            {PersonnelPerformanceTranslate[key]}
                          </span>
                          <span
                            className={twMerge(
                              "  text-primary group-last:text-secondary",
                              (value as number) > 0 ? "font-bold" : "text-sm",
                            )}
                          >
                            {commify(
                              Number.isInteger(value)
                                ? value
                                : (value as number).toFixed(2),
                            )}
                          </span>
                        </div>
                      </div>
                      {numericItems.length % 2 != 0 && isLastItem && (
                        <div className="cross_hatch_pattern hidden w-full max-w-sm rounded-xl sm:block" />
                      )}
                    </>
                  );
                })}
              </div>
              <div className="grid gap-4 " dir="rtl">
                {noneNumericItems.map(([key, value], index, array) => {
                  if (!value) return;
                  const isLastItem = index === array.length - 1;
                  let _value = value;
                  if (key === "Id") return;
                  if (key === "Start_Date")
                    _value = getMonthNamesFromJOINED_date_strings(
                      value as string,
                      getAll?.data?.periodType,
                    );
                  return (
                    <>
                      <ToolTipSimple
                        className="cursor-auto  bg-secondary"
                        tooltip={
                          <span className="text-base text-primary ">
                            {PersonnelPerformanceTranslate[key] ?? key}
                          </span>
                        }
                      >
                        <div
                          key={key}
                          className={twMerge(
                            "flex  min-w-[150px] cursor-auto  items-center justify-center  gap-2 rounded-2xl bg-secondary p-2",
                            isLastItem || index === 0
                              ? " md:col-span-2"
                              : "col-span-1",
                          )}
                        >
                          <span className="max-w-[250px] select-text break-words text-center font-bold text-accent">
                            {_value as string}
                          </span>
                        </div>
                      </ToolTipSimple>
                    </>
                  );
                })}

                <div className="relative col-span-2 w-full overflow-hidden rounded-xl bg-accent/10  p-1">
                  {selectedPerson.sparkData.length > 0 ? (
                    <Calender
                      withMonthMenu
                      collapsedUi
                      listOfDates={uniqueArray(
                        selectedPerson.sparkData.map((a) =>
                          moment(a.Start_Date, "jYYYY/jMM/jDD")
                            .format("jYYYY/jMM")
                            .slice(0, 7),
                        ),
                      ).map((a) => moment(a, "jYYYY/jMM "))}
                      year={parseInt(
                        selectedPerson.sparkData[0].Start_Date.split("/")[0],
                      )}
                      defaultMonth={getMonthNumber(
                        selectedPerson.sparkData[0].Start_Date,
                      )}
                      onDate={(date, monthNumber) => {
                        const userCalData = selectedPerson.sparkData.find(
                          (d) => d.Start_Date === date.format("YYYY/MM/DD"),
                        );
                        const userMetric = getPerformanceMetric(
                          userCalData?.TotalPerformance,
                        );

                        const hasTheDayOff = getAll?.data?.result.find(
                          (a) =>
                            a.Start_Date === date.format("YYYY/MM/DD") &&
                            a.NationalCode === selectedPerson.key.NationalCode,
                        )?.HasTheDayOff;

                        return (
                          <>
                            {parseInt(date.format("M")) !== monthNumber + 1 ? (
                              <div className="flex h-full w-full items-center justify-center">
                                <span
                                  className={twMerge(
                                    "flex items-center justify-center  text-xs text-primary/50 ",

                                    `h-6 w-6 rounded-full `,
                                  )}
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
                              <>
                                <ToolTipSimple
                                  className="cursor-default bg-secondary"
                                  tooltip={
                                    <span
                                      style={{
                                        color: userCalData
                                          ? userMetric.color
                                          : undefined,
                                      }}
                                      className="text-base text-primary "
                                    >
                                      {hasTheDayOff
                                        ? "مرخصی"
                                        : userCalData?.TotalPerformance.toFixed(
                                            2,
                                          )}
                                    </span>
                                  }
                                >
                                  {/* {hasTheDayOff ? "yes" : "no"} */}
                                  {hasManagePersonnelAccess ? (
                                    // <TogglePersonelDayOffButton
                                    //   hasTheDayOff={hasTheDayOff}
                                    //   selectedPerson={selectedPerson}
                                    //   date={date}
                                    //   userCalData={userCalData}
                                    //   userMetric={userMetric}
                                    // />
                                    <>
                                      <Button
                                        className={twMerge(
                                          " p-2",
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
                                              getAll?.data ?? [],
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
                                                "ArzyabiAsnadDandanVaParaDirect",
                                                "ArzyabiAsnadDandanVaParaIndirect",
                                                "ArzyabiAsnadDaroDirect",
                                                "ArzyabiAsnadDaroIndirect",
                                                "WithScanCount",
                                                "WithoutScanCount",
                                                "WithoutScanInDirectCount",
                                                "ArchiveDirectCount",
                                                "ArchiveInDirectCount",
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
                                              (a) =>
                                                a.key.NationalCode ===
                                                selectedPerson.key.NationalCode,
                                            );
                                          setSelectedPerson({
                                            ...selectedPerson,
                                            ...result,
                                          });
                                        }}
                                      >
                                        <SingleDayView date={date} />
                                      </Button>
                                    </>
                                  ) : (
                                    <div
                                      className={twMerge(
                                        "flex w-max  cursor-default items-center justify-center rounded-lg p-2",
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
                              </>
                            )}
                          </>
                        );
                      }}
                    />
                  ) : (
                    <div className=" w-full  text-center text-accent">
                      بدون داده
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              <PerformanceBadges />
              <div className="flex flex-col items-center justify-center lg:flex-row">
                <div className="col-span-2  flex  w-full flex-col items-center justify-center">
                  <H2>عملکرد کلی</H2>

                  <Gauge value={selectedPerson?.TotalPerformance} />
                  <p className="text-accent">
                    {getPerformanceText(selectedPerson?.TotalPerformance)}
                  </p>
                </div>
                <div className="col-span-2  flex  w-full flex-col items-center justify-center">
                  <H2>عملکرد مستقیم</H2>

                  <Gauge value={selectedPerson?.DirectPerFormance} />
                  <p className="text-accent">
                    {getPerformanceText(selectedPerson?.DirectPerFormance)}
                  </p>
                </div>
                <div className="col-span-2  flex  w-full flex-col items-center justify-center">
                  <H2>عملکرد غیر مستقیم</H2>

                  <Gauge value={selectedPerson?.InDirectPerFormance} />
                  <p className="text-accent">
                    {getPerformanceText(selectedPerson?.InDirectPerFormance)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        {/* <div
          className={twMerge(
            "flex w-full  flex-col items-center justify-center gap-2  rounded-xl  p-5",
            selectedPerson ? "bg-secondary" : "",
          )}
        >
          <H2>نمای کلی شهر {getEnglishToPersianCity(city)}</H2>
          <ResponsiveContainer width="99%" height={"100%"}>
            <AreaChart
              data={fullData.map((item) => {
                return {
                  ...item,
                  Start_Date: item.key.Start_Date.split("/")[2],
                };
              })}
              dir="rtl"
              index="Start_Date"
              categories={[
                "ثبت اولیه اسناد",
                "پذیرش و ثبت اولیه اسناد",
                "ارزیابی اسناد بیمارستانی مستقیم",
                "ارزیابی اسناد بیمارستانی غیر مستقیم",
                "ارزیابی اسناد دندان و پارا مستقیم",
                "ارزیابی اسناد دندان و پارا غیر مستقیم",
                "ارزیابی اسناد دارو مستقیم",
                "ارزیابی اسناد دارو غیر مستقیم",
                "ثبت ارزیابی با اسکن مدارک",
                "ثبت ارزیابی بدون اسکن مدارک",
                "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
                "عملکرد",
              ]}
            />
          </ResponsiveContainer>
        </div> */}

        <div
          dir="rtl"
          className={twMerge(
            "flex w-full  flex-col items-center justify-center gap-2  rounded-xl  p-5",
            selectedPerson ? "" : "",
          )}
        >
          <ResponsiveContainer width="99%" height="auto">
            <CitiesWithDatesPerformanceBarChart
              filters={{
                ...filters,
                filter: {
                  ...filters.filter,
                  CityName: [router.query.city as string],
                },
              }}
            />
          </ResponsiveContainer>
        </div>
      </div>
    </CitiesPage>
  );
}

type TogglePersonelDayOffButton = {
  hasTheDayOff: boolean;
  selectedPerson: {
    cityName: string;
    nationalCode: string;
    nameFamily: string;
  };
  date: Moment;
  userCalData: any;
  userMetric: {
    limit: number;
    color: string;
    tooltip: {
      text: string;
    };
  };
};
export function TogglePersonelDayOffButton({
  hasTheDayOff,
  selectedPerson,
  date,
  userCalData,
  userMetric,
}: TogglePersonelDayOffButton) {
  const utils = api.useContext();

  const togglePersonnelDayOffMutation =
    api.personnelPerformance.togglePersonnelDayOff.useMutation();

  const textForDayOff = `آیا میخواهید این روز را مرخصی رد کنید؟`;
  const textForDayOn = `آیا میخواهید این روز را مرخصی بودن خارج کنید؟`;
  return (
    <>
      <ButtonWithConfirmation
        title={hasTheDayOff ? textForDayOn : textForDayOff}
        confirmText="بله"
        cancelText="خیر"
        className={twMerge(
          " p-2",
          hasTheDayOff === true ? "bg-white text-secondary" : "bg-secondary",
        )}
        style={{
          backgroundColor: userCalData ? userMetric.color : undefined,
        }}
        onConfirm={async () => {
          togglePersonnelDayOffMutation.mutate({
            date: date.format("YYYY/MM/DD"),
            nationalCode: selectedPerson.nationalCode,
            cityName: getPersianToEnglishCity(selectedPerson.cityName),
            nameFamily: selectedPerson.nameFamily,
          });
          //  const person = selectedPerson;
          await utils.personnelPerformance.getAll.invalidate();
          //   const getAll = utils.personnelPerformance.getAll.getData();
          //  console.log({ selectedPerson });
          // setSelectedPerson({
          //   ...selectedPerson.user,
          //   sparkData: sparkChartForPersonnel(
          //     getAll?.data?.result,
          //     "NameFamily",
          //     selectedPerson.user.NameFamily,
          //   ),
          // });
        }}
      >
        <SingleDayView date={date} />
      </ButtonWithConfirmation>
    </>
  );
}

function SingleDayView({ date }: { date: Moment }) {
  return (
    <span
      className={twMerge(
        "flex items-center justify-center bg-secondary text-xs text-primary",

        `h-6 w-6 rounded-full `,
      )}
    >
      {date.format("D")}
    </span>
  );
}

export async function getServerSideProps(ctx) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx,
    transformer: SuperJSON,
  });

  const city = ctx.params?.city;

  if (typeof city !== "string") throw new Error("no slug");

  await helpers.personnelPerformance.getAll.prefetch({
    filter: {
      CityName: [city.toString()],
      Start_Date: [
        moment().locale("fa").subtract(3, "days").format("YYYY/MM/DD"),
      ],
    },
    periodType: "روزانه",
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      city,
    },
  };
}

// export async function getStaticPaths() {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// }
