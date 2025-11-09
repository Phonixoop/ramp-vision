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
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";

function CityPerformanceWithUsersChartContent({ filters, cityName_En }) {
  const { useWorkDays } = useWorkDaysToggle();
  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const getCitysUsersPerformance = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [cityName_En],
        Start_Date: filters?.filter?.Start_Date,
        ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
        Role: filters?.filter?.Role ?? defualtRoles,
        ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
        RoleType: filters?.filter?.RoleType,
        DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo.data],
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

  // Prepare months array for work days calculation
  const monthsArray = useMemo(() => {
    if (
      !filters?.periodType ||
      filters.periodType !== "ماهانه" ||
      !filters?.filter?.Start_Date ||
      !Array.isArray(filters.filter.Start_Date)
    ) {
      return [];
    }

    const months: { year: number; month: number }[] = [];

    filters.filter.Start_Date.forEach((dateStr) => {
      if (typeof dateStr === "string") {
        try {
          const momentDate = moment(dateStr, "jYYYY/jMM/jDD");
          const year = momentDate.jYear();
          const month = momentDate.jMonth() + 1; // jMonth() returns 0-11, we need 1-12

          months.push({ year, month });
        } catch (error) {
          console.warn("Error parsing date:", dateStr, error);
        }
      }
    });

    return months;
  }, [filters?.periodType, filters?.filter?.Start_Date]);

  // Get total work days for monthly filters
  const { data: workDaysData } = api.monthWorkDays.getTotalWorkDays.useQuery(
    { months: monthsArray },
    {
      enabled: monthsArray.length > 0,
      staleTime: 5 * 60 * 1000,
    },
  );

  const totalWorkDays = workDaysData?.totalWorkDays || null;

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
      useWorkDays ? totalWorkDays : null, // Pass work days if toggle is enabled
    );
  }, [getCitysUsersPerformance?.data, useWorkDays, totalWorkDays]);

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
        // For single date view, TotalPerformance is already daily performance
        // No need to divide further when showing individual days
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

    // Calculate number of unique months for work days approximation
    const numberOfMonths = dates.result.length;

    const rrr = Object.entries(resultGroupByStartDate)?.map(([key, value]) => {
      const vv: any = processDataForChart({
        rawData: value,
        groupBy: ["Start_Date", "CityName"],
        values: ["TotalPerformance", "COUNT"],
      });

      // For multi-month view: if workdays enabled, approximate work days per month
      // by dividing total work days by number of months. Otherwise use rowCount (actual days in that month)
      const divisor =
        useWorkDays && totalWorkDays && numberOfMonths > 0
          ? totalWorkDays / numberOfMonths
          : vv[0].key.rowCount;

      return {
        key: { Start_Date: key },
        Start_Date: key,
        COUNT: 1,
        TotalPerformance: divisor,
      };
    });

    return rrr;
  }, [
    searchParams,
    filters,
    getCitysUsersPerformance?.data,
    useWorkDays,
    totalWorkDays,
  ]);

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
