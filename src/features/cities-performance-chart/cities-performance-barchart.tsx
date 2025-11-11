// @ts-nocheck - Disable TypeScript checking for recharts type conflicts
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ResponsiveContainer } from "recharts";
import { api } from "~/trpc/react";
import { FilterType } from "~/context/personnel-filter.context";
import {
  distinctDataAndCalculatePerformance,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import { commify, getEnglishToPersianCity } from "~/utils/util";
import H2 from "~/ui/heading/h2";
import CustomBarChart from "~/features/custom-charts/bar-chart";
import {
  Performance_Levels_Gauge,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import { Cell } from "recharts";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";

function CitiesPerformanceBarChartContent({
  filters,
}: {
  filters: FilterType;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn/50 py-5 xl:p-5">
          <H2 className="font-bold">نمودار عملکرد شهر ها</H2>
          <H2 className="font-bold">
            {getCitiesWithPerformance?.data?.periodType}
          </H2>
          {/* <H2 className="font-bold">
            {getCitiesWithPerformance?.data?.dateLength[""]} روز
          </H2> */}
          <div className="h-[500px] w-full">
            <CustomBarChart
              width={500}
              height={500}
              onBarClick={(data, index) => {
                // window.open(
                //   "/dashboard/personnel_performance/cities/" + data.CityName_En,
                //   "_blank",
                // );

                const params = new URLSearchParams(searchParams);
                params.set("performance_CityName", data.CityName_En);
                params.delete("NameFamily");
                router.push(`?${params.toString()}`, { scroll: false });
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

                return data.map((item, index) => {
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={getPerformanceMetric(item["عملکرد"]).color}
                    />
                  );
                });
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
          <BarChartSkeletonLoading />
        </div>
      )}

      {searchParams.get("performance_CityName") && (
        <>
          <CityPerformanceWithUsersChart
            filters={filters}
            cityName_En={searchParams.get("performance_CityName") as string}
          />

          <CitiesWithDatesPerformanceBarChart
            filters={{
              ...filters,
              filter: {
                ...filters.filter,
                CityName: [searchParams.get("performance_CityName") as string],
              },
            }}
          />
        </>
      )}
    </>
  );
}

export function CitiesPerformanceBarChart({
  filters,
}: {
  filters: FilterType;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          در حال بارگذاری...
        </div>
      }
    >
      <CitiesPerformanceBarChartContent filters={filters} />
    </Suspense>
  );
}
