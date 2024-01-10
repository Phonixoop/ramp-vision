import {
  TrendingDownIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  BuildingIcon,
  FilterIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Header from "~/features/header";
import BlurBackground from "~/ui/blur-backgrounds";
import { api } from "~/utils/api";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import SuperJSON from "superjson";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";
import { SparkAreaChart } from "@tremor/react";
import { CITIES, Reports_Period } from "~/constants";
import AdvancedList from "~/features/advanced-list";
import moment from "jalali-moment";

import {
  en,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
} from "~/utils/util";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtDateInfos,
  defualtRoles,
} from "~/constants/personnel-performance";

import { SelectControlled } from "~/features/checkbox-list";
import H2 from "~/ui/heading/h2";
import { usePersonnelFilter } from "~/context/personnel-filter.context";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import ResponsiveView from "~/features/responsive-view";
import { TrendDecider } from "~/features/trend-decider";

type CityWithPerformanceData = {
  CityName_En: string;
  CityName_Fa: string;
  TotalPerformance: number;
};

function DistinctData(data = []): CityWithPerformanceData[] {
  const cityMap = new Map();
  data?.forEach((item) => {
    if (!cityMap.has(item.CityName)) {
      cityMap.set(item.CityName, { total: 0, count: 0 });
    }
    const city = cityMap.get(item.CityName);
    city.total += item.TotalPerformance;
    city.count++;
  });

  const averageTotalPerformance: CityWithPerformanceData[] = Array.from(
    cityMap,
    ([city, { total, count }]) => {
      if (!getEnglishToPersianCity(city)) return;
      return {
        CityName_En: city,
        CityName_Fa: CITIES.find((a) => a.EnglishName === city).PersianName,
        TotalPerformance: total / count,
      };
    },
  );

  return averageTotalPerformance;
}

export default function CitiesPage({ children }) {
  const {
    filters,
    setFilters,
    reportPeriod,
    setReportPeriod,
    selectedDates,
    setSelectedDates,
    selectedPerson,
  } = usePersonnelFilter();

  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: filters?.periodType,
        filter: {
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
          Role: filters?.filter?.Role ?? defualtRoles,
          ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
          RoleType: filters?.filter?.RoleType,
          DateInfo: filters?.filter?.DateInfo,
        },
      },
      {
        onSuccess: (data) => {
          setUpdatedList(DistinctData(data));
        },
        refetchOnWindowFocus: false,
      },
    );
  const router = useRouter();

  // const persianCities = getCitiesWithPerformance.data?.map((a) => {
  //   const persianName = CITIES.find((b) => b.EnglishName === a.CityName)
  //     ?.PersianName;

  //   return {
  //     cityName: persianName,
  //     performance: a.TotalPerformance,
  //   };
  // });
  const [updatedList, setUpdatedList] = useState(
    getCitiesWithPerformance?.data ?? [],
  );

  // const intersection = CITIES.filter((city) => {
  //   getCitiesWithPerformance?.data
  //     ?.map((a) => a.CityName)
  //     .includes(city.EnglishName);
  // });

  // const persianNames = intersection.map((city) => city.PersianName);

  const getInitialFilters =
    api.personnelPerformance.getInitialFilters.useQuery();

  return (
    <>
      <BlurBackground />

      <div className="flex min-h-screen w-full flex-col gap-5 bg-secondary py-2">
        <div className="mx-auto flex w-11/12 items-center justify-center gap-5 rounded-xl p-2 sm:flex-col sm:bg-primbuttn/10">
          <H2 className="hidden text-xl sm:flex">فیلترها</H2>

          {!getInitialFilters.isLoading && (
            <ResponsiveView
              className=" z-20 flex max-h-[100vh] flex-wrap items-stretch justify-center gap-1  sm:max-h-min sm:bg-transparent sm:py-0"
              dir="rtl"
              btnClassName="bg-secondary text-primary"
              icon={
                <>
                  <span className="px-2">فیلترها</span>
                  <FilterIcon className="stroke-primary" />
                </>
              }
            >
              <div className="flex w-[15rem] max-w-sm flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">بازه گزارش</span>
                <DatePickerPeriodic
                  filter={filters}
                  reportPeriod={reportPeriod}
                  onChange={(date) => {
                    if (!date) return;

                    if (Array.isArray(date) && date.length <= 0) return;
                    let dates = [];
                    if (Array.isArray(date)) {
                      dates = date
                        .filter((a) => a.format() != "")
                        .map((a) => en(a.format("YYYY/MM/DD")));
                    } else {
                      if (date.format() != "")
                        dates = [en(date.format("YYYY/MM/DD"))];
                    }
                    if (dates.length <= 0) return;
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          Start_Date: dates,
                        },
                      };
                    });
                  }}
                  setReportPeriod={setReportPeriod}
                />
              </div>

              <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2 sm:w-[23rem]">
                <span className="font-bold text-primary">سمت</span>
                <SelectControlled
                  withSelectAll
                  title={"سمت"}
                  list={[
                    ...new Set(
                      getInitialFilters?.data?.usersInfo
                        ?.map((a) => a.Role)
                        .filter((a) => a),
                    ),
                  ]}
                  value={filters.filter.Role ?? defualtRoles}
                  onChange={(values) => {
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          ...prev.filter,
                          Role: values,
                        },
                      };
                    });
                  }}
                />
              </div>
              <div className="flex w-[15rem] max-w-sm  flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع پروژه</span>
                <SelectControlled
                  withSelectAll
                  title={"نوع پروژه"}
                  list={[
                    ...new Set(
                      getInitialFilters?.data?.usersInfo
                        ?.map((a) => a.ProjectType)
                        .filter((a) => a),
                    ),
                  ]}
                  value={filters.filter.ProjectType ?? defaultProjectTypes}
                  onChange={(values) => {
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          ...prev.filter,
                          ProjectType: values,
                        },
                      };
                    });
                  }}
                />
              </div>

              <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع قرار داد</span>
                <SelectControlled
                  withSelectAll
                  title={"نوع قرار داد"}
                  list={[
                    ...new Set(
                      getInitialFilters?.data?.usersInfo
                        ?.map((a) => a.ContractType)
                        .filter((a) => a),
                    ),
                  ]}
                  value={filters.filter.ContractType ?? defualtContractTypes}
                  onChange={(values) => {
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          ...prev.filter,
                          ContractType: values,
                        },
                      };
                    });
                  }}
                />
              </div>
              <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع سمت</span>
                <SelectControlled
                  withSelectAll
                  title={"نوع سمت"}
                  list={[
                    ...new Set(
                      getInitialFilters?.data?.usersInfo
                        ?.map((a) => a.RoleType)
                        .filter((a) => a),
                    ),
                  ]}
                  value={filters.filter.RoleType ?? []}
                  onChange={(values) => {
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          ...prev.filter,
                          RoleType: values,
                        },
                      };
                    });
                  }}
                />
              </div>
              <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">
                  تاریخ گزارش پرسنل
                </span>
                <SelectControlled
                  withSelectAll
                  title={"تاریخ گزارش پرنسل"}
                  list={[
                    ...new Set(
                      getInitialFilters?.data?.usersInfo
                        ?.map((a) => a.DateInfo)
                        .filter((a) => a),
                    ),
                  ]}
                  value={filters.filter.DateInfo ?? defualtDateInfos}
                  onChange={(values) => {
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          ...prev.filter,
                          DateInfo: values,
                        },
                      };
                    });
                  }}
                />
              </div>
            </ResponsiveView>
          )}
        </div>
        <div className="mx-auto flex w-11/12 items-center justify-end">
          <div className="flex items-center justify-center gap-1 rounded-xl p-2 text-primbuttn">
            <span> {selectedPerson?.NameFamily}</span>
            {selectedPerson && <span>{"/"}</span>}
            <span>
              {Array.isArray(router.query?.city)
                ? ""
                : getEnglishToPersianCity(router.query?.city ?? "")}
            </span>
          </div>
        </div>
        <div className="m-auto flex w-11/12 flex-col justify-start gap-5  pb-10 xl:flex-row-reverse">
          <AdvancedList
            title={
              <span className="flex items-center justify-center gap-2 text-primary">
                استان
                <BuildingIcon />
              </span>
            }
            isLoading={getCitiesWithPerformance.isLoading}
            disabled={!!!updatedList}
            list={DistinctData(getCitiesWithPerformance.data)}
            filteredList={
              !getCitiesWithPerformance.isLoading
                ? updatedList
                : [...new Array(10).map((a) => [undefined, a])]
            }
            selectProperty={"CityName_Fa"}
            onChange={(updatedList) => setUpdatedList(updatedList)}
            renderItem={(item: CityWithPerformanceData, i) => {
              if (item === undefined)
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

              // if (!persianNames.includes(item.cityName)) return;
              // const englishCity = CITIES.find(
              //   (city) => city.PersianName === item.cityName,
              // ).EnglishName;

              const isActive = item.CityName_En === router.query.city;

              const cityPerformances = getCitiesWithPerformance?.data
                .filter(
                  (x) =>
                    getPersianToEnglishCity(x.CityName) === item.CityName_En,
                )
                .map((m) => {
                  return m.TotalPerformance;
                });
              return (
                <Link
                  key={i}
                  className={twMerge(
                    "cursor-pointer rounded-xl py-2",
                    isActive
                      ? "sticky z-20 bg-primary/30 text-secondary backdrop-blur-md "
                      : "bg-secondary",
                    "top-24",
                  )}
                  scroll={false}
                  href={`/dashboard/personnel_performance/cities/${item.CityName_En}`}
                >
                  <div className=" flex w-full items-center justify-between gap-2 px-2 text-right text-primary">
                    <div className=" w-10">
                      <ChevronLeftIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <TrendDecider values={cityPerformances} />
                      {item.TotalPerformance.toFixed(0)}
                      {"%"}
                    </div>
                    <div className="flex w-full  items-center justify-center">
                      <SparkAreaChart
                        data={getCitiesWithPerformance.data
                          ?.filter((a) => a.CityName === item.CityName_En)
                          .map((a) => {
                            return {
                              TotalPerformance: a.TotalPerformance,
                              Start_Date: a.Start_Date,
                              Benchmark: 50,
                            };
                          })}
                        categories={["TotalPerformance", "Benchmark"]}
                        index={"Start_Date"}
                        colors={["purple", "cyan"]}
                        className="h-10 w-36 cursor-pointer"
                      />
                    </div>
                    <span className="w-full text-sm">{item.CityName_Fa}</span>
                  </div>
                </Link>
              );
            }}
          />

          {children}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      db: db,
      session: session,
    },
    transformer: SuperJSON,
  });

  await helpers.personnelPerformance.getCitiesWithPerformance.prefetch({
    periodType: "روزانه",
    filter: {
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
      ProjectType: defaultProjectTypes,
      Role: defualtRoles,
      DateInfo: defualtDateInfos,
    },
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
