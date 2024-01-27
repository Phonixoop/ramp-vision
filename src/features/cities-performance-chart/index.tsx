import { FilterType } from "~/context/personnel-filter.context";
import H2 from "~/ui/heading/h2";
import { api } from "~/utils/api";
import {
  DistinctDataAndCalculatePerformance,
  DistinctPersonnelPerformanceData,
} from "~/utils/personnel-performance";
import { commify, getEnglishToPersianCity } from "~/utils/util";

import { ResponsiveContainer } from "recharts";

import CustomBarChart from "~/features/custom-charts/bar-chart";
import { Performance_Levels } from "~/constants/personnel-performance";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";

export default function CitiesPerformanceBarChart({
  filters,
}: {
  filters: FilterType;
}) {
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        ...filters,
      },
      {
        select: (data) => {
          const f = DistinctDataAndCalculatePerformance(data);

          return f;
        },

        refetchOnWindowFocus: false,
      },
    );
  if (getCitiesWithPerformance.isLoading)
    return (
      <>
        <ThreeDotsWave />
      </>
    );
  return (
    <>
      <ResponsiveContainer width="99%" height="auto">
        <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
          <H2 className="font-bold">نمودار عملکرد شهر ها</H2>
          <CustomBarChart
            width={500}
            height={500}
            data={(getCitiesWithPerformance?.data ?? []).map((row) => {
              return {
                شهر: row.CityName_Fa,
                عملکرد: Math.round(row.TotalPerformance),
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
            keys={["شهر"]}
            refrenceLines={Performance_Levels.map((level) => {
              const max = Math.max(
                ...getCitiesWithPerformance.data.map((a) => a.TotalPerformance),
              );
              return {
                name: level.tooltip.text,
                number:
                  level.limit > 180 && max > 180 && max <= 500
                    ? max
                    : level.limit,
                color: level.color,
              };
            })}
            nameClassName="fill-primary"
            customXTick
            customYTick
            formatter={commify}
          />
        </div>
      </ResponsiveContainer>
    </>
  );
}

export function CitiesWithDatesPerformanceBarChart({
  filters,
}: {
  filters: FilterType;
}) {
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        ...filters,
      },
      {
        select: (data) => {
          const b = DistinctPersonnelPerformanceData(
            data,
            ["Start_Date", "CityName"],
            ["TotalPerformance"],
            { CityName: filters.filter.CityName },
          );

          return b;
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
  if (getCitiesWithPerformance.isLoading)
    return (
      <>
        <ThreeDotsWave />
      </>
    );
  return (
    <>
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
                عملکرد: Math.round(row.TotalPerformance),
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
            refrenceLines={Performance_Levels.map((level) => {
              const max = Math.max(
                ...getCitiesWithPerformance.data.map((a) => a.TotalPerformance),
              );
              return {
                name: level.tooltip.text,
                number:
                  level.limit > 180 && max > 180 && max <= 500
                    ? max
                    : level.limit,
                color: level.color,
              };
            })}
            nameClassName="fill-primary"
            customXTick
            customYTick
            formatter={commify}
          />
        </div>
      </ResponsiveContainer>
    </>
  );
}

export function transformData(rawData) {
  const transformedData = rawData.reduce((acc, current) => {
    const { key, TotalPerformance } = current;
    const { Start_Date, CityName } = key;
    // Check if there's an existing object for the current Start_Date
    const existingObject = acc.find((item) => item.Start_Date === Start_Date);

    if (existingObject) {
      existingObject[CityName] = TotalPerformance;
    } else {
      const newObject = { Start_Date, [CityName]: TotalPerformance };
      acc.push(newObject);
    }

    return acc;
  }, []);

  return transformedData;
}
