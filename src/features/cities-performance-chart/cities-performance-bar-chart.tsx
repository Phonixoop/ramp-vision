// @ts-nocheck - Disable TypeScript checking for recharts type conflicts
import React, { Suspense } from "react";
import { Cell } from "recharts";
import { FilterType } from "~/context/personnel-filter.context";
import H2 from "~/ui/heading/h2";
import { api } from "~/trpc/react";
import {
  distinctDataAndCalculatePerformance,
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
  sparkChartForCity,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";
import {
  commify,
  getEnglishToPersianCity,
  processDataForChart,
} from "~/utils/util";

import CustomBarChart from "~/features/custom-charts/bar-chart";
import {
  Performance_Levels_Gauge,
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { twMerge } from "tailwind-merge";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";
import { useMemo } from "react";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import { groupBy, uniqueArrayWithCounts } from "~/lib/utils";
import moment from "jalali-moment";

function CityPerformanceWithUsersChartContent({ filters, cityName_En }) {
  const getCitysUsersPerformance = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [cityName_En],
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
      enabled: !!cityName_En,
      refetchOnWindowFocus: false,
    },
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const distinctData = useMemo(() => {
    return distinctPersonnelPerformanceData(
      getCitysUsersPerformance?.data,
      ["NationalCode", "NameFamily", "CityName"],
      [
        "NationalCode",
        "NameFamily",
        "SabtAvalieAsnad",
        "PazireshVaSabtAvalieAsnad",
        "ArzyabiAsanadBimarsetaniDirect",
        "ArzyabiAsnadBimarestaniIndirect",
        "ArzyabiAsnadDandanVaParaDirect",
        "ArzyabiAsnadDandanVaParaIndirect",
        "ArzyabiAsnadDandanDirect",
        "ArzyabiAsnadDandanIndirect",
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
        "HasTheDayOff",
      ],
      { HasTheDayOff: false },
    );
  }, [getCitysUsersPerformance?.data]);

  // const selectedUserData = useMemo(() => {
  //   return sparkChartForPersonnel(
  //     getCitysUsersPerformance?.data?.result,
  //     "NameFamily",
  //     router.query.NameFamily,
  //   );
  // }, [router.query.NameFamily]);
  const selectedUserData = useMemo(() => {
    const nameFamily = searchParams.get("NameFamily");
    const spark = getCitysUsersPerformance?.data?.result?.filter(
      (a) => a.NameFamily === nameFamily && a.HasTheDayOff === false,
    );

    const data = {
      result: spark,
    };

    const dates = uniqueArrayWithCounts(
      data?.result?.map((a) => a.Start_Date.slice(0, 7)) ?? [],
    );
    if (dates.result.length === 1) {
      const singleMonthData = groupBy(
        data.result ?? [],
        (item: any) => item.Start_Date,
      );
      return Object.entries(singleMonthData)?.map(([key, value]) => {
        return {
          Start_Date: key,
          COUNT: 1,
          TotalPerformance: value[0].TotalPerformance,
        };
      });
    }

    const result: any = data?.result?.map((a) => {
      return {
        ...a,
        Start_Date: moment(a.Start_Date, "jYYYY/jMM/jDD")
          .locale("fa")
          .format("MMMM"),
      };
    });

    const resultGroupByStartDate = groupBy(
      result ?? [],
      (item: any) => item.Start_Date,
    );

    const rrr = Object.entries(resultGroupByStartDate)?.map(([key, value]) => {
      const vv: any = processDataForChart({
        rawData: value,
        groupBy: ["Start_Date", "CityName"],
        values: ["TotalPerformance", "COUNT"],
      });

      return {
        key: { Start_Date: key },
        Start_Date: key,
        COUNT: 1,
        TotalPerformance: vv[0].TotalPerformance / vv[0].key.rowCount,
      };
    });

    return rrr;
  }, [searchParams, filters, getCitysUsersPerformance?.data]);

  return (
    <>
      {!getCitysUsersPerformance.isLoading ? (
        <div className="flex min-h-[70vh] w-full flex-col gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
          <H2 className="text-center font-bold">
            نمودار عملکرد پرسنل شهر {getEnglishToPersianCity(cityName_En)}
          </H2>
          <div className="h-[600px] w-full">
            <CustomBarChart
              onBarClick={(data, index) => {
                // window.open(
                //   "/dashboard/personnel_performance/cities/" + data.CityName_En,
                //   "_blank",
                // );

                const params = new URLSearchParams(searchParams);
                params.set("NameFamily", data["نام"]);
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              width={500}
              height={500}
              data={(distinctData ?? []).map((row) => {
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

      <>
        {searchParams.get("NameFamily") && (
          <div className="flex min-h-[70vh] w-full flex-col gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
            <H2 className="text-center font-bold">
              نمودار زمانی عملکرد {searchParams.get("NameFamily")}
            </H2>
            <div className="h-[600px] w-full">
              <CustomBarChart
                width={500}
                height={500}
                data={(selectedUserData ?? []).map((row) => {
                  return {
                    تاریخ: row.Start_Date,
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
                keys={["تاریخ"]}
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
        )}
      </>
    </>
  );
}

export function CityPerformanceWithUsersChart({ filters, cityName_En }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          در حال بارگذاری...
        </div>
      }
    >
      <CityPerformanceWithUsersChartContent
        filters={filters}
        cityName_En={cityName_En}
      />
    </Suspense>
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
