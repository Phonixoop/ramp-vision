import {
  TrendingDownIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  BuildingIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
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
import Button from "~/ui/buttons";
import DatePicker from "react-multi-date-picker";
import { InPageMenu } from "~/features/menu";
import { default as DatePickerButton } from "react-multi-date-picker/components/button";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "jalali-moment";
import { LayoutGroup } from "framer-motion";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { en } from "~/utils/util";
import {
  PersonnelFilterProvider,
  usePersonnelFilter,
} from "~/context/personnel-filter.context";
import { SelectColumnFilter, SelectControlled } from "~/features/checkbox-list";

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
      if (!CITIES.find((a) => a.EnglishName === city).PersianName) return;
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
    setSelectedCity,
  } = usePersonnelFilter();

  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: filters?.periodType,
        filter: {
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: filters?.filter?.ProjectType,
          Role: filters?.filter?.Role,
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

      <div className="flex min-h-screen w-full flex-col gap-5 bg-secondary">
        <Header />

        <div
          className="m-auto flex w-11/12 items-center justify-center"
          dir="rtl"
        >
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">تاریخ</span>
            <LayoutGroup id="DateMenu">
              <InPageMenu
                list={Object.keys(Reports_Period)}
                value={0}
                onChange={(value) => {
                  setReportPeriod(value.item.name);
                }}
              />
            </LayoutGroup>
            {/* {deferredFilter.filter.Start_Date} */}
            <DatePicker
              //@ts-ignore
              render={(value, openCalendar) => {
                const seperator =
                  filters?.periodType == "روزانه" ? " , " : " ~ ";
                return (
                  <Button
                    className="w-full border border-dashed border-accent text-center hover:bg-accent/20"
                    onClick={openCalendar}
                  >
                    {filters?.filter.Start_Date.join(seperator)}
                  </Button>
                );
              }}
              inputClass="text-center"
              multiple={reportPeriod !== "ماهانه"}
              value={filters?.filter.Start_Date}
              calendar={persian}
              locale={persian_fa}
              weekPicker={reportPeriod === "هفتگی"}
              onlyMonthPicker={reportPeriod === "ماهانه"}
              plugins={[<DatePanel key={"00DatePanel"} />]}
              onClose={() => {
                //@ts-ignore
                setFilters((prev) => {
                  return {
                    periodType: reportPeriod,
                    filter: {
                      Start_Date: selectedDates,
                    },
                  };
                });
              }}
              onChange={(date) => {
                //@ts-ignore
                if (!date) return;

                if (Array.isArray(date) && date.length <= 0) return;
                const dates = Array.isArray(date)
                  ? date.map((a) => en(a.format("YYYY/MM/DD")))
                  : [en(date.format("YYYY/MM/DD"))];
                setSelectedDates(dates);

                // setSelectedDates((prevState) => dates);
              }}
            />
          </div>
          {!getInitialFilters.isLoading && (
            <>
              <div className="w-full">
                {
                  <SelectControlled
                    title={"نوع پروژه"}
                    list={[
                      ...new Set(
                        getInitialFilters?.data
                          ?.map((a) => a.ProjectType)
                          .filter((a) => a),
                      ),
                    ]}
                    value={filters.filter.ProjectType ?? ["جبران"]}
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
                }
              </div>

              <SelectControlled
                title={""}
                list={[
                  ...new Set(
                    getInitialFilters?.data
                      ?.map((a) => a.Role)
                      .filter((a) => a),
                  ),
                ]}
                value={filters.filter.Role ?? [""]}
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
            </>
          )}
        </div>

        <div className="m-auto flex w-11/12 flex-col justify-start gap-5 py-10 xl:flex-row-reverse">
          <AdvancedList
            title={
              <span className="flex items-center justify-center gap-2 text-primary">
                شهر ها
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
                  href={`/dashboard/personnel_performance/cities/${item.CityName_En}`}
                >
                  <div className=" flex w-full items-center justify-between gap-2 px-2 text-right text-primary">
                    <div className=" w-10">
                      <ChevronLeftIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      {item.TotalPerformance < 50 ? (
                        <TrendingDownIcon className="h-5 w-5 stroke-red-700" />
                      ) : (
                        <TrendingUpIcon className="h-5 w-5 stroke-emerald-700" />
                      )}
                      {item.TotalPerformance.toFixed(0)}
                      {"%"}
                    </div>
                    <div className="flex w-full  items-center justify-center">
                      <SparkAreaChart
                        data={getCitiesWithPerformance.data
                          .filter((a) => a.CityName === item.CityName_En)
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
    },
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
