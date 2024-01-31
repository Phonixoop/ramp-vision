import { FilterType } from "~/context/personnel-filter.context";
import H2 from "~/ui/heading/h2";
import { api } from "~/utils/api";
import {
  distinctDataAndCalculatePerformance,
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import { commify, getEnglishToPersianCity } from "~/utils/util";

import { Cell, ResponsiveContainer } from "recharts";

import CustomBarChart from "~/features/custom-charts/bar-chart";
import {
  Performance_Levels,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import BarChartSkeletonLoading from "~/features/cities-performance-chart/loading";

export function CitiesPerformanceBarChart({
  filters,
}: {
  filters: FilterType;
}) {
  const router = useRouter();
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        ...filters,
      },
      {
        select: (data) => {
          return distinctDataAndCalculatePerformance(data);
        },

        refetchOnWindowFocus: false,
      },
    );

  const getCitysUsersPerformance = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [router.query.performance_CityName as string],
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
        return distinctPersonnelPerformanceData(
          data,
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
          ],
        );
      },
      enabled: !!router.query.performance_CityName,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      {!getCitiesWithPerformance.isLoading ? (
        <ResponsiveContainer width="99%" height="auto">
          <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
            <H2 className="font-bold">نمودار عملکرد شهر ها</H2>
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
                    href: "/dashboard/depo",
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
              data={(getCitiesWithPerformance?.data ?? []).map((row) => {
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
        <CityPerformanceWithUsersChart
          data={getCitysUsersPerformance.data}
          isLoading={getCitysUsersPerformance.isLoading}
          cityName_En={router.query.performance_CityName as string}
        />
      )}
    </>
  );
}

function CityPerformanceWithUsersChart({ data, isLoading, cityName_En }) {
  return (
    <>
      {!isLoading ? (
        <ResponsiveContainer width="99%" height="auto">
          <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
            <H2 className="font-bold">
              نمودار عملکرد پرسنل شهر {getEnglishToPersianCity(cityName_En)}
            </H2>
            <CustomBarChart
              width={500}
              height={500}
              data={(data ?? []).map((row) => {
                return {
                  نام: row.NameFamily,
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
              keys={["نام"]}
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
    </>
  );
}

// export function transformData(rawData) {
//   const transformedData = rawData.reduce((acc, current) => {
//     const { key, TotalPerformance } = current;
//     const { Start_Date, CityName } = key;
//     // Check if there's an existing object for the current Start_Date
//     const existingObject = acc.find((item) => item.Start_Date === Start_Date);

//     if (existingObject) {
//       existingObject[CityName] = TotalPerformance;
//     } else {
//       const newObject = { Start_Date, [CityName]: TotalPerformance };
//       acc.push(newObject);
//     }

//     return acc;
//   }, []);

//   return transformedData;
// }
