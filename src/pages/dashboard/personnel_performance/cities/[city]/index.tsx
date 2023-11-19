import { AreaChart, BarChart, SparkAreaChart } from "@tremor/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import moment from "jalali-moment";
import { Contact2Icon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { InferGetStaticPropsType, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { use, useEffect, useState } from "react";
import SuperJSON from "superjson";
import { twMerge } from "tailwind-merge";
import { CITIES } from "~/constants";
import {
  PersonnelPerformanceIcons,
  PersonnelPerformanceTranslate,
} from "~/constants/personnel-performance";
import { usePersonnelFilter } from "~/context/personnel-filter.context";

import AdvancedList from "~/features/advanced-list";
import Gauge from "~/features/gauge";
import LineGauge from "~/features/gauge/line";
import CitiesPage from "~/pages/dashboard/personnel_performance/cities";
import { appRouter } from "~/server/api/root";
import Button from "~/ui/buttons";
import H2 from "~/ui/heading/h2";
import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";

import { api } from "~/utils/api";
import {
  DistinctData,
  commify,
  getPerformanceText,
  processDataForChart,
} from "~/utils/util";

const chartdata = [
  {
    month: "Jan 21",
    Performance: 30000,
    Benchmark: 3000,
  },
  {
    month: "Feb 21",
    Performance: 3000,
    Benchmark: 21000,
  },
  {
    month: "Mar 21",
    Performance: 2000,
    Benchmark: 17500,
  },
  {
    month: "Apr 21",
    Performance: 27800,
    Benchmark: 2500,
  },
  {
    month: "May 21",
    Performance: 1829,
    Benchmark: 1890,
  },
  {
    month: "Jun 21",
    Performance: 2390,
    Benchmark: 2000,
  },
  {
    month: "Jul 21",
    Performance: 3090,
    Benchmark: 3000,
  },
];

type CityWithPerformanceData = {
  CityName_En: string;
  CityName_Fa: string;
  TotalPerformance: number;
};

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
        ProjectType: filters?.filter?.ProjectType,
        Role: filters?.filter?.Role,
        ContractType: filters?.filter?.ContractType,
        RoleType: filters?.filter?.RoleType,
        DateInfo: filters?.filter?.DateInfo,
      },
      periodType: filters.periodType,
    },
    {
      onSuccess: (data) => {
        setSelectedPerson((prev) =>
          data.result.find((a) => a.NationalCode === prev?.NationalCode),
        );
        setUpdatedList(DistinctData(data.result));
      },
      refetchOnWindowFocus: false,
    },
  );
  const [updatedList, setUpdatedList] = useState(getAll.data?.result ?? []);

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

  const fullData = processDataForChart(
    getAll?.data?.result ?? [],
    "Start_Date",
    [
      "SabtAvalieAsnad",
      "PazireshVaSabtAvalieAsnad",
      "ArzyabiAsanadBimarsetaniDirect",
      "ArzyabiAsnadBimarestaniIndirect",
      "ArzyabiAsnadDandanVaParaDirect",
      "ArzyabiAsnadDandanVaParaIndirect",
      "ArzyabiAsnadDaroDirect",
      "ArzyabiAsnadDaroIndirect",
      "TotalPerformance",
    ],
  ).map((d) => {
    d.TotalPerformance = (
      d.TotalPerformance /
        getAll?.data?.result.map((a) => a.Start_Date === d.key).length ?? 1
    ).toFixed(0);

    const translatedData = {};
    for (const key in d) {
      if (PersonnelPerformanceTranslate[key]) {
        translatedData[PersonnelPerformanceTranslate[key]] = d[key];
      } else {
        translatedData[key] = d[key];
      }
    }

    return translatedData;
  });

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
        list={DistinctData(getAll?.data?.result)}
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
                  setSelectedPerson(user);
                }}
              >
                <div className=" flex w-full flex-row-reverse items-center justify-between gap-2  px-2 text-right ">
                  <div className=" w-10">
                    <ChevronLeftIcon className="h-4 w-4 fill-none stroke-primary" />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {user.TotalPerformance < 50 ? (
                      <TrendingDownIcon className="h-5 w-5 stroke-red-700" />
                    ) : (
                      <TrendingUpIcon className="h-5 w-5 stroke-emerald-700" />
                    )}
                    {user.TotalPerformance.toFixed(0)}
                    {"%"}
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <SparkAreaChart
                      data={getAll?.data?.result
                        .filter((a) => a.NameFamily === user.NameFamily)
                        .map((a) => {
                          return {
                            TotalPerformance: a.TotalPerformance,
                            Start_Date: a.Start_Date,

                            Middle: 80,
                          };
                        })}
                      categories={["TotalPerformance", "Middle"]}
                      index={"Start_Date"}
                      colors={["purple", "cyan"]}
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
                  const isLastItem = index === array.length - 1;
                  if (!PersonnelPerformanceIcons[key]) return;
                  return (
                    <>
                      <div
                        key={key}
                        className={twMerge(
                          "`p-2`  flex flex-col justify-center gap-2 rounded-2xl bg-secondary  p-2",
                          isLastItem ? " md:col-span-2" : "md:col-span-1",
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-between  gap-4 rounded-xl bg-secbuttn p-2">
                          <span> {PersonnelPerformanceIcons[key]}</span>
                          <span className="text-primary">
                            {PersonnelPerformanceTranslate[key]}
                          </span>
                          <span className="text-accent">
                            {commify((value as number).toFixed(0))}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
              <div
                className="grid  grid-cols-1  gap-4 md:grid-cols-2 "
                dir="rtl"
              >
                {noneNumericItems.map(([key, value], index, array) => {
                  const isLastItem = index === array.length - 1;

                  if (key === "DateInfo") return;
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
                          {value as string}
                        </span>
                      </div>
                    </>
                  );
                })}
                <div className="col-span-2  flex  w-full flex-col items-center justify-center   ">
                  <H2>عملکرد</H2>

                  <Gauge value={selectedPerson.TotalPerformance} />
                  <p className="text-accent">
                    {getPerformanceText(selectedPerson.TotalPerformance)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        <div
          className={twMerge(
            "flex w-full  flex-col items-center justify-center gap-2  rounded-xl  p-5",
            selectedPerson ? "bg-secondary" : "",
          )}
        >
          <H2>
            نمای کلی شهر{" "}
            {CITIES.find((a) => a.EnglishName === city).PersianName}
          </H2>
          <AreaChart
            data={fullData}
            dir="rtl"
            index="key"
            categories={[
              "ثبت اولیه اسناد",
              "پذیرش و ثبت اولیه اسناد",
              "ارزیابی اسناد بیمارستانی مستقیم",
              "ارزیابی اسناد بیمارستانی غیر مستقیم",
              "ارزیابی اسناد دندان و پارا مستقیم",
              "ارزیابی اسناد دندان و پارا غیر مستقیم",
              "ارزیابی اسناد دارو مستقیم",
              "ارزیابی اسناد دارو غیر مستقیم",
              "عملکرد",
            ]}
          />
        </div>
      </div>
    </CitiesPage>
  );
}

export async function getStaticProps(ctx) {
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
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
