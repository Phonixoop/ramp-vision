import {
  TrendingDownIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  BuildingIcon,
  FilterIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
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
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";

import { SelectControlled } from "~/features/checkbox-list";
import H2 from "~/ui/heading/h2";
import { usePersonnelFilter } from "~/context/personnel-filter.context";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import ResponsiveView from "~/features/responsive-view";
import { TrendDecider } from "~/features/trend-decider";
import {
  distinctDataAndCalculatePerformance,
  sparkChartForCity,
} from "~/utils/personnel-performance";
import { CityWithPerformanceData } from "~/types";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";
import { sortDates } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

// function DistinctDataForCity(data = []): CityWithPerformanceData[] {
//   const cityMap = new Map();
//   data?.forEach((item) => {
//     if (!cityMap.has(item.CityName)) {
//       cityMap.set(item.CityName, { total: 0, count: 0 });
//     }
//     const city = cityMap.get(item.CityName);
//     city.total += item.TotalPerformance;
//     city.count++;
//   });

//   const averageTotalPerformance: CityWithPerformanceData[] = Array.from(
//     cityMap,
//     ([city, { total, count }]) => {
//       if (!getEnglishToPersianCity(city)) return;
//       return {
//         CityName_En: city,
//         CityName_Fa: CITIES.find((a) => a.EnglishName === city).PersianName,
//         TotalPerformance: total / count,
//       };
//     },
//   );

//   return averageTotalPerformance;
// }

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

  const [isPending, startTransition] = useTransition();
  const [whichTranistion, setWhichTranistion] = useState("");
  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery();
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
          DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo.data],
          TownName: filters?.filter?.TownName,
          BranchName: filters?.filter?.BranchName,
          BranchCode: filters?.filter?.BranchCode,
          BranchType: filters?.filter?.BranchType,
        },
      },
      {
        onSuccess: (data) => {
          setUpdatedList(distinctDataAndCalculatePerformance(data));
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
    () =>
      distinctDataAndCalculatePerformance(getCitiesWithPerformance.data) ?? [],
  );

  // const intersection = CITIES.filter((city) => {
  //   getCitiesWithPerformance?.data
  //     ?.map((a) => a.CityName)
  //     .includes(city.EnglishName);
  // });

  // const persianNames = intersection.map((city) => city.PersianName);

  const getInitialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        ProjectType: filters.filter.ProjectType,
        DateInfo: filters.filter.DateInfo,
      },
    },
  );

  const _DateInfos = [
    ...new Set(
      getInitialFilters?.data?.DateInfos?.map((a) => a.DateInfo).filter(
        (a) => a,
      ),
    ),
  ];

  const DateInfos = sortDates({ dates: _DateInfos });

  const Roles = [
    ...new Set(
      getInitialFilters?.data?.usersInfo?.map((a) => a.Role).filter((a) => a),
    ),
  ];

  const ContractTypes = [
    ...new Set(
      getInitialFilters?.data?.usersInfo
        ?.map((a) => a.ContractType)
        .filter((a) => a),
    ),
  ];

  const RolesType = [
    ...new Set(
      getInitialFilters?.data?.usersInfo
        ?.map((a) => a.RoleType)
        .filter((a) => a),
    ),
  ];
  const distincedData = useMemo(
    () => distinctDataAndCalculatePerformance(getCitiesWithPerformance.data),
    [getCitiesWithPerformance.data],
  );
  return (
    <>
      <BlurBackground />

      <h1 className=" w-full py-5 text-center text-2xl text-primary underline underline-offset-[12px] ">
        (نمودار) جزئیات عملکرد پرسنل شعب
      </h1>
      <div className="flex min-h-screen w-full flex-col divide-y-2 divide-secbuttn  py-2">
        <div className="mx-auto flex w-11/12 items-center justify-center gap-5 rounded-t-2xl    p-2 sm:flex-col ">
          <H2 className="hidden py-2 text-xl sm:flex">فیلترها</H2>

          {!getInitialFilters.isLoading && (
            <ResponsiveView
              className=" z-20 flex max-h-[100vh] w-full flex-wrap items-stretch justify-start rounded-t-3xl bg-secondary  sm:max-h-min sm:p-5"
              dir="rtl"
              btnClassName=" text-primary"
              icon={
                <>
                  <span className="px-2">فیلترها</span>
                  <FilterIcon className="stroke-primary" />
                </>
              }
            >
              <div className="flex w-full flex-wrap">
                {" "}
                <div className="flex w-[15rem] max-w-sm flex-col items-center justify-around gap-3   p-2">
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
                <div className="flex w-[15rem] max-w-sm  flex-col items-center justify-center gap-3   p-2">
                  <span className="font-bold text-primary">نوع پروژه</span>

                  <SelectControlled
                    withSelectAll
                    title={"نوع پروژه"}
                    list={getInitialFilters?.data?.ProjectTypes}
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
                <div className="flex  max-w-sm flex-col items-center justify-center gap-3   p-2 sm:w-[25rem]">
                  <span className="font-bold text-primary">سمت</span>

                  <SelectControlled
                    withSelectAll
                    title={"سمت"}
                    list={Roles}
                    value={
                      filters.filter.Role ??
                      defualtRoles.filter((item) => Roles.includes(item))
                    }
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
                <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3   p-2">
                  <span className="font-bold text-primary">نوع قرار داد</span>
                  <SelectControlled
                    withSelectAll
                    title={"نوع قرار داد"}
                    list={ContractTypes}
                    value={
                      filters.filter.ContractType ??
                      defualtContractTypes.filter((item) =>
                        ContractTypes.includes(item),
                      )
                    }
                    onChange={(values) => {
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            ContractType: values,
                            RoleType: getDefaultRoleTypesBaseOnContractType(
                              values ?? defualtContractTypes,
                            ),
                          },
                        };
                      });
                    }}
                  />
                </div>
                <div className="flex w-[22rem] max-w-sm flex-col items-center justify-center gap-3   p-2">
                  <span className="font-bold text-primary">نوع سمت</span>
                  <SelectControlled
                    withSelectAll
                    title={"نوع سمت"}
                    list={RolesType}
                    value={filters?.filter?.RoleType}
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
                <div className="flex w-[12rem] max-w-sm flex-col items-center justify-center gap-3   p-2">
                  <span className="font-bold text-primary">
                    تاریخ گزارش پرسنل
                  </span>
                  <SelectControlled
                    title={"تاریخ گزارش پرسنل"}
                    list={DateInfos}
                    value={
                      filters.filter.DateInfo ?? [
                        DateInfos[DateInfos.length - 1],
                      ]
                    }
                    onChange={(values) => {
                      let _values = values;
                      _values = [values[values.length - 1]];
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            DateInfo: _values.filter((a) => a),
                          },
                        };
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center justify-center">
                {/* TownName BranchName BranchCode BranchType */}
                <Accordion className="w-full" type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-accent">
                      فیلتر های بیشتر
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3   p-2">
                        <span className="font-bold text-primary">نام شهر</span>
                        <SelectControlled
                          withSelectAll
                          title={"نام شهر"}
                          list={getInitialFilters.data.TownNames}
                          value={filters.filter.TownName ?? []}
                          onChange={(values) => {
                            //@ts-ignore
                            setFilters((prev) => {
                              return {
                                periodType: reportPeriod,
                                filter: {
                                  ...prev.filter,
                                  TownName: values,
                                },
                              };
                            });
                          }}
                        />
                      </div>
                      <div className="flex min-w-full max-w-sm flex-col items-center justify-center gap-3   p-2">
                        <span className="font-bold text-primary">نام شعبه</span>
                        <SelectControlled
                          withSelectAll
                          title={"نام شعبه"}
                          list={getInitialFilters.data.BranchNames}
                          value={filters.filter.BranchName ?? []}
                          onChange={(values) => {
                            //@ts-ignore
                            setFilters((prev) => {
                              return {
                                periodType: reportPeriod,
                                filter: {
                                  ...prev.filter,
                                  BranchName: values,
                                },
                              };
                            });
                          }}
                        />
                      </div>
                      <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3   p-2">
                        <span className="font-bold text-primary">کد شعبه</span>
                        <SelectControlled
                          withSelectAll
                          title={"کد شعبه"}
                          list={getInitialFilters.data.BranchCodes}
                          value={filters.filter.BranchCode ?? []}
                          onChange={(values) => {
                            //@ts-ignore
                            setFilters((prev) => {
                              return {
                                periodType: reportPeriod,
                                filter: {
                                  ...prev.filter,
                                  BranchCode: values,
                                },
                              };
                            });
                          }}
                        />
                      </div>
                      <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3   p-2">
                        <span className="font-bold text-primary">نوع شعبه</span>
                        <SelectControlled
                          withSelectAll
                          title={"نوع شعبه"}
                          list={getInitialFilters.data.BranchTypes}
                          value={filters.filter.BranchType ?? []}
                          onChange={(values) => {
                            //@ts-ignore
                            setFilters((prev) => {
                              return {
                                periodType: reportPeriod,
                                filter: {
                                  ...prev.filter,
                                  BranchType: values,
                                },
                              };
                            });
                          }}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* END TownName BranchName BranchCode BranchType END*/}
              </div>
            </ResponsiveView>
          )}
        </div>
        <div className="mx-auto flex w-11/12 items-center justify-end ">
          {router.query?.city && (
            <div className="flex items-center justify-center gap-1 p-2 px-6 text-accent">
              <span> {selectedPerson?.NameFamily}</span>
              {selectedPerson && <span>{"/"}</span>}
              <span>
                {Array.isArray(router.query?.city)
                  ? ""
                  : getEnglishToPersianCity(router.query?.city ?? "")}
              </span>
            </div>
          )}
        </div>
        <div className=" m-auto flex w-11/12 flex-col  items-center justify-center gap-5 bg-secondary p-5 pb-10 xl:flex-row-reverse  xl:items-stretch xl:justify-start">
          <AdvancedList
            className=" xl:h-fit"
            title={
              <span className="flex items-center justify-center gap-2 text-primary">
                استان
                <BuildingIcon />
              </span>
            }
            isLoading={getCitiesWithPerformance.isLoading}
            disabled={!!!updatedList}
            list={() => {
              return distincedData;
            }}
            filteredList={
              !getCitiesWithPerformance.isLoading
                ? updatedList
                : [...new Array(10).map((a) => [undefined, a])]
            }
            selectProperty={"CityName_Fa"}
            downloadFileName={`عملکرد استان ها ${
              reportPeriod === "ماهانه" && filters.filter.Start_Date.length == 1
                ? moment(filters.filter.Start_Date[0], "jYYYY,jMM,jDD")
                    .locale("fa")
                    .format("YYYY jMMMM")
                : filters.filter.Start_Date.join(",")
            }`}
            headers={[
              { label: "عملکرد", key: "TotalPerformance" },
              { label: "شهر", key: "CityName_Fa" },
            ]}
            dataToDownload={distincedData}
            onChange={(updatedList) => setUpdatedList(updatedList)}
            renderItem={(item: CityWithPerformanceData, i) => {
              if (item === undefined)
                return (
                  <div
                    key={i}
                    className=" flex  w-full animate-pulse flex-row-reverse items-center justify-between gap-2 rounded-xl  bg-secondary/60 p-3 text-right text-primary"
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

              const cityPerformances = getCitiesWithPerformance?.data?.result
                .filter(
                  (x) =>
                    getPersianToEnglishCity(x.CityName) === item.CityName_En,
                )
                .map((m) => {
                  return m.TotalPerformance;
                });

              const isTransitioning =
                isPending && whichTranistion === item.CityName_En;
              return (
                <Link
                  key={i}
                  className={twMerge(
                    "cursor-pointer rounded-xl py-2 transition-opacity duration-500",
                    isActive
                      ? "sticky z-20 bg-primary/30 text-secondary backdrop-blur-md "
                      : "bg-secondary",

                    "top-24",
                  )}
                  scroll={false}
                  onClick={() => {
                    setWhichTranistion(item.CityName_En);
                    startTransition(() => {
                      router.push(
                        `/dashboard/personnel_performance/cities/${item.CityName_En}`,
                        undefined,
                        { scroll: false, shallow: true },
                      );
                    });
                  }}
                  href={`/dashboard/personnel_performance/cities/${item.CityName_En}`}
                >
                  <div
                    className={twMerge(
                      "relative flex w-full  items-center justify-between gap-2 px-2 text-right text-primary duration-1000",
                    )}
                  >
                    <div className=" w-10">
                      {isTransitioning || isActive ? (
                        <BarChart3Loading />
                      ) : (
                        <ChevronLeftIcon className="h-4 w-4 stroke-primary" />
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <TrendDecider values={cityPerformances} />
                      {Math.round(item.TotalPerformance)}
                      {"%"}
                    </div>
                    <div className="flex w-full  items-center justify-center">
                      <SparkAreaChart
                        data={sparkChartForCity(
                          getCitiesWithPerformance?.data?.result ?? [],
                          "CityName",
                          item.CityName_En,
                        )}
                        noDataText="بدون داده"
                        categories={[
                          "TotalPerformance",
                          "Benchmark",
                          "Benchmark2",
                          "Benchmark3",
                        ]}
                        index={"Start_Date"}
                        colors={["purple", "rose", "cyan"]}
                        className={twMerge(
                          " dash-a h-10 w-36  ",
                          isTransitioning || isActive
                            ? "animate-path animate-[move_100s_linear_infinite]"
                            : "",
                        )}
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
        <div
          dir="rtl"
          className="mx-auto flex w-11/12 flex-col items-center justify-center gap-5 rounded-b-2xl  bg-secondary  p-2 py-5 "
        >
          <CityPerformanceWithUsersChart
            filters={filters}
            cityName_En={router.query.city}
          />
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

  await helpers.personnel.getDefualtDateInfo.prefetch();

  await helpers.personnelPerformance.getCitiesWithPerformance.prefetch({
    periodType: "روزانه",
    filter: {
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
      ProjectType: defaultProjectTypes,
      Role: defualtRoles,
    },
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
