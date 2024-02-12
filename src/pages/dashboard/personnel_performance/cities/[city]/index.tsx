import { AreaChart, BarChart, SparkAreaChart } from "@tremor/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import moment from "jalali-moment";
import {
  Contact2Icon,
  MinusIcon,
  MinusSquareIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { InferGetStaticPropsType, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { use, useEffect, useMemo, useState } from "react";
import { ResponsiveContainer } from "recharts";
import SuperJSON from "superjson";
import { twMerge } from "tailwind-merge";
import { CITIES } from "~/constants";
import {
  PersonnelPerformanceIcons,
  PersonnelPerformanceTranslate,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  defualtDateInfos,
} from "~/constants/personnel-performance";
import { usePersonnelFilter } from "~/context/personnel-filter.context";

import AdvancedList from "~/features/advanced-list";
import Calender from "~/features/calender";
import {
  CitiesPerformanceBarChart,
  CityPerformanceWithUsersChart,
} from "~/features/cities-performance-chart/cities-performance-bar-chart";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import Gauge from "~/features/gauge";
import ToolTipSimple from "~/features/tooltip-simple-use";
import { TrendDecider } from "~/features/trend-decider";

import CitiesPage from "~/pages/dashboard/personnel_performance/cities";
import { appRouter } from "~/server/api/root";
import { CityWithPerformanceData } from "~/types";
import Button from "~/ui/buttons";
import H2 from "~/ui/heading/h2";
import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";

import { api } from "~/utils/api";
import { getMonthNumber } from "~/utils/date-utils";
import {
  distinctPersonnelPerformanceData,
  getMonthNamesFromJOINED_date_strings,
  getPerformanceMetric,
  sparkChartForPersonnelAndCity,
} from "~/utils/personnel-performance";
import {
  DistinctData,
  analyzePerformanceTrend,
  commify,
  getEnglishToPersianCity,
  getPerformanceText,
  processDataForChart,
} from "~/utils/util";

export default function CityPage({ children, city }) {
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

  const getAll = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [city],
        Start_Date: filters?.filter?.Start_Date,
        ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
        Role: filters?.filter?.Role ?? defualtRoles,
        ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
        RoleType: filters?.filter?.RoleType,
        DateInfo: filters?.filter?.DateInfo ?? defualtDateInfos,
      },
      periodType: filters.periodType,
    },
    {
      onSuccess: (data) => {
        setSelectedPerson(undefined);

        setUpdatedList(
          distinctPersonnelPerformanceData(
            data ?? [],
            ["NationalCode", "NameFamily"],
            [
              "NationalCode",
              "NameFamily",
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
              "Role",
              "RoleType",
              "ContractType",
              "ProjectType",
              "TotalPerformance",
              "Start_Date",
            ],
          ),
        );
      },
      refetchOnWindowFocus: false,
    },
  );
  const [updatedList, setUpdatedList] = useState([]);

  const numericItems = Object.entries(selectedPerson ?? []).filter(
    ([key, value]) => typeof value === "number",
  );

  const noneNumericItems = Object.entries(selectedPerson ?? []).filter(
    ([key, value]) => typeof value === "string",
  );

  const translateKeys = Object.keys(PersonnelPerformanceTranslate);

  // Sort the numericItems based on the order in translateKeys
  numericItems.sort(
    (a, b) => translateKeys.indexOf(a[0]) - translateKeys.indexOf(b[0]),
  );

  const fullData = useMemo(
    () =>
      distinctPersonnelPerformanceData(getAll?.data ?? [], ["Start_Date"]).map(
        (d) => {
          // d.TotalPerformance = calculatePerformance(d, getAll?.data?.dateLength);
          const translatedData = {};
          for (const key in d) {
            if (PersonnelPerformanceTranslate[key]) {
              translatedData[PersonnelPerformanceTranslate[key]] = d[key];
            } else {
              translatedData[key] = d[key];
            }
          }

          return translatedData;
        },
      ),
    [getAll?.data?.result],
  );

  useEffect(() => {
    setSelectedPerson(undefined);
  }, [router]);

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
        list={distinctPersonnelPerformanceData(
          getAll?.data ?? [],
          ["NationalCode", "NameFamily"],
          [
            "NationalCode",
            "NameFamily",
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
            "Role",
            "RoleType",
            "ContractType",
            "ProjectType",
            "TotalPerformance",
            "Start_Date",
          ],
        )}
        filteredList={
          !getAll.isLoading
            ? updatedList
            : [...new Array(10).map((a) => [undefined, a])]
        }
        selectProperty={"NameFamily"}
        onChange={(updatedList) => {
          setUpdatedList(updatedList);
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
          const isActive = user.NationalCode === selectedPerson?.NationalCode;
          const userPerformances = getAll?.data?.result
            .filter((x) => x.NameFamily === user.NameFamily)
            .map((m) => {
              return m.TotalPerformance;
            });

          // ||
          // user.NationalCode === router.query.personnel;

          const sparkData = sparkChartForPersonnelAndCity(
            getAll?.data?.result,
            "NameFamily",
            user.NameFamily,
          );
          return (
            <>
              <Button
                key={i}
                className={twMerge(
                  "rounded-xl  ",
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
                    sparkData: sparkChartForPersonnelAndCity(
                      getAll?.data?.result,
                      "NameFamily",
                      user.NameFamily,
                    ),
                  });
                }}
              >
                <div className=" flex w-full flex-row-reverse items-center justify-between gap-2  px-2 text-right ">
                  <div className=" w-10">
                    <ChevronLeftIcon className="h-4 w-4 fill-none stroke-primary" />
                  </div>
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
                      index={"Start_Date"}
                      colors={["purple", "rose", "cyan"]}
                      className="h-10 w-36 cursor-pointer"
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
                className="grid  grid-cols-1  gap-4 md:grid-cols-2 "
                dir="rtl"
              >
                {numericItems.map(([key, value], index, array) => {
                  // const isLastItem = index === array.length - 1;
                  if (!PersonnelPerformanceIcons[key]) return;
                  return (
                    <>
                      <div
                        key={key}
                        className={twMerge(
                          "`p-2`  flex flex-col justify-center gap-2 rounded-2xl bg-secondary  p-2 md:col-span-1",
                          // isLastItem ? " md:col-span-2" : "md:col-span-1",
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-between  gap-4 rounded-xl bg-secbuttn p-2">
                          <span> {PersonnelPerformanceIcons[key]}</span>
                          <span className="text-primary">
                            {PersonnelPerformanceTranslate[key]}
                          </span>
                          <span className="text-accent">
                            {commify(
                              Number.isInteger(value)
                                ? value
                                : (value as number).toFixed(2),
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
              <div className="grid  gap-4 " dir="rtl">
                {noneNumericItems.map(([key, value], index, array) => {
                  const isLastItem = index === array.length - 1;
                  let _value = value;
                  if (key === "DateInfo") return;
                  if (key === "Start_Date")
                    _value = getMonthNamesFromJOINED_date_strings(
                      value as string,
                      getAll?.data?.periodType,
                    );
                  return (
                    <>
                      <div
                        key={key}
                        className={twMerge(
                          "flex  min-w-[150px] flex-col justify-center  gap-2 rounded-2xl bg-secondary p-2",
                          isLastItem || index === 0
                            ? " md:col-span-2"
                            : "col-span-1",
                        )}
                      >
                        <span className="break-words text-center font-bold text-accent">
                          {_value as string}
                        </span>
                      </div>
                    </>
                  );
                })}
                <div className="col-span-2 w-full">
                  <Calender
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

                      return (
                        <>
                          {parseInt(date.format("M")) !== monthNumber + 1 ? (
                            <ToolTipSimple
                              className="bg-secondary"
                              tooltip={
                                <span
                                  style={{
                                    color: userCalData
                                      ? userMetric.color
                                      : undefined,
                                  }}
                                  className="text-base "
                                >
                                  {userCalData?.TotalPerformance.toFixed(2)}
                                </span>
                              }
                            >
                              <span
                                className={twMerge(
                                  "flex items-center justify-center text-xs text-primary/50 ",

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
                            </ToolTipSimple>
                          ) : (
                            <ToolTipSimple
                              className="bg-secondary"
                              tooltip={
                                <span
                                  style={{
                                    color: userCalData
                                      ? userMetric.color
                                      : undefined,
                                  }}
                                  className="text-base "
                                >
                                  {userCalData?.TotalPerformance.toFixed(2)}
                                </span>
                              }
                            >
                              <span
                                className={twMerge(
                                  "flex items-center justify-center text-xs text-primary ",

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
                            </ToolTipSimple>
                          )}
                        </>
                      );
                    }}
                  />
                </div>
                <div className="col-span-2  flex  w-full flex-col items-center justify-center   ">
                  <H2>عملکرد</H2>

                  <Gauge value={Math.round(selectedPerson?.TotalPerformance)} />
                  <p className="text-accent">
                    {getPerformanceText(selectedPerson?.TotalPerformance)}
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
          <CitiesWithDatesPerformanceBarChart
            filters={{
              ...filters,
              filter: {
                ...filters.filter,
                CityName: [router.query.city as string],
              },
            }}
          />
        </div>
      </div>
    </CitiesPage>
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
