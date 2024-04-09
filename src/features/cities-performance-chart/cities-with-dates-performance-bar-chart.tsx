import { FilterType } from "~/context/personnel-filter.context";
import H2 from "~/ui/heading/h2";
import { api } from "~/utils/api";
import {
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
  sparkChartForPersonnelAndCity,
} from "~/utils/personnel-performance";
import { commify, getEnglishToPersianCity } from "~/utils/util";

import { Cell, ResponsiveContainer } from "recharts";

import CustomBarChart from "~/features/custom-charts/bar-chart";

import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";

export function CitiesWithDatesPerformanceBarChart({
  filters,
}: {
  filters: FilterType;
}) {
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        filter: {
          CityName: filters.filter.CityName,
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
          Role: filters?.filter?.Role ?? defualtRoles,
          ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
          RoleType: undefined,
          DateInfo: filters?.filter?.DateInfo,
        },
        periodType: filters.periodType,
      },
      {
        select: (data) => {
          return distinctPersonnelPerformanceData(
            data,
            ["Start_Date", "CityName"],
            ["TotalPerformance", "COUNT"],
            { CityName: filters.filter.CityName },
          );
        },
        refetchOnWindowFocus: false,
      },
    );

  if (
    filters.filter.CityName.length <= 0 ||
    filters.filter.CityName.length >= 2
  )
    return (
      <>
        <p className="rounded-xl bg-primary p-3 text-secondary">
          برای نمایش نمودار زمانی فقط یک شهر را فیلتر کنید
        </p>
      </>
    );

  return (
    <>
      {!getCitiesWithPerformance.isLoading ? (
        <ResponsiveContainer width="99%" height="auto">
          <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn py-5 xl:p-5">
            <H2 className="font-bold">
              نمودار زمانی عملکرد شهر{" "}
              {getEnglishToPersianCity(filters.filter.CityName[0])}
            </H2>
            <CustomBarChart
              width={500}
              height={500}
              data={(getCitiesWithPerformance?.data ?? []).map((row) => {
                return {
                  تاریخ: row.key.Start_Date,
                  عملکرد: Math.round(row.TotalPerformance / row.COUNT),
                };
              })}
              bars={[
                {
                  name: "عملکرد",
                  className: "fill-primary",
                  labelClassName: "fill-secondary",
                  angle: 0,
                },
              ]}
              keys={["تاریخ"]}
              brushKey="تاریخ"
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
        <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn py-5 xl:p-5">
          <BarChartSkeletonLoading />
        </div>
      )}
    </>
  );
}
