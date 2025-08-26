import { FilterType } from "~/context/personnel-filter.context";
import H2 from "~/ui/heading/h2";
import { api } from "~/trpc/react";
import {
  distinctDataAndCalculatePerformance,
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";
import { commify, getEnglishToPersianCity } from "~/utils/util";

import { Cell, ResponsiveContainer } from "recharts";

import CustomBarChart from "~/features/custom-charts/bar-chart";
import {
  Performance_Levels_Gauge,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";
import { useMemo } from "react";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";

export function CitiesPerformanceBarChart({
  filters,
}: {
  filters: FilterType;
}) {
  const router = useRouter();
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        filter: {
          CityName: [],
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: defaultProjectTypes,
          Role: defualtRoles,
          ContractType: defualtContractTypes,
          RoleType: undefined,
          DateInfo: filters?.filter?.DateInfo,
        },
        periodType: filters.periodType,
      },

      {
        select: (data) => {
          return {
            ...data,
            result: distinctDataAndCalculatePerformance(data),
          };
        },

        refetchOnWindowFocus: false,
      },
    );

  return (
    <>
      {!getCitiesWithPerformance.isLoading ? (
        <ResponsiveContainer width="99%" height="auto">
          <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
            <H2 className="font-bold">نمودار عملکرد شهر ها</H2>
            <H2 className="font-bold">
              {getCitiesWithPerformance?.data?.periodType}
            </H2>
            {/* <H2 className="font-bold">
              {getCitiesWithPerformance?.data?.dateLength[""]} روز
            </H2> */}
            <CustomBarChart
              width={500}
              height={500}
              onBarClick={(data, index) => {
                // window.open(
                //   "/dashboard/personnel_performance/cities/" + data.CityName_En,
                //   "_blank",
                // );

                router.push(
                  {
                    href: router.pathname,
                    query: {
                      performance_CityName: data.CityName_En,
                    },
                  },
                  undefined,
                  {
                    scroll: false,
                    shallow: true,
                  },
                );
              }}
              data={(getCitiesWithPerformance?.data.result ?? []).map((row) => {
                return {
                  CityName_En: row.CityName_En,
                  شهر: row.CityName_Fa,
                  عملکرد: Math.round(row.TotalPerformance),
                };
              })}
              bars={[
                {
                  name: "عملکرد",
                  className: "fill-primary cursor-pointer",
                  labelClassName: "fill-secondary",
                  angle: 0,
                },
              ]}
              keys={["شهر"]}
              // refrenceLines={Performance_Levels.map((level) => {
              //   const max = Math.max(
              //     ...getCitiesWithPerformance.data.map((a) => a.TotalPerformance),
              //   );
              //   return {
              //     name: level.tooltip.text,
              //     number:
              //       level.limit > 180 && max > 180 && max <= 500
              //         ? max
              //         : level.limit,
              //     color: level.color,
              //   };
              // })}
              nameClassName="fill-primary"
              customXTick
              customYTick
              formatter={commify}
              customBars={(data) => {
                if (data.length <= 0) return <></>;

                return (
                  <>
                    {data.map((item, index) => {
                      return (
                        <>
                          <Cell
                            key={`cell-${index}`}
                            fill={getPerformanceMetric(item["عملکرد"]).color}
                          />
                        </>
                      );
                    })}
                  </>
                );
              }}
            />
          </div>
        </ResponsiveContainer>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
          <BarChartSkeletonLoading />
        </div>
      )}

      {!!router.query.performance_CityName && (
        <>
          <CityPerformanceWithUsersChart
            filters={filters}
            cityName_En={router.query.performance_CityName as string}
          />

          <CitiesWithDatesPerformanceBarChart
            filters={{
              ...filters,
              filter: {
                ...filters.filter,
                CityName: [router.query.performance_CityName as string],
              },
            }}
          />
        </>
      )}
    </>
  );
}
