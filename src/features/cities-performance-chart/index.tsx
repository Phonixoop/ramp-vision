import { BarChart as TremorBarChart } from "@tremor/react";

import { Text } from "~/constants";
import { FilterType } from "~/context/personnel-filter.context";
import H2 from "~/ui/heading/h2";
import { api } from "~/utils/api";
import { DistinctDataAndCalculatePerformance } from "~/utils/personnel-performance";
import { commify } from "~/utils/util";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  Line,
  LabelList,
} from "recharts";
import { ReactElement, useEffect, useRef, useState } from "react";
import CustomBarChart from "~/features/custom-charts/bar-chart";

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
          return DistinctDataAndCalculatePerformance(data);
        },

        refetchOnWindowFocus: false,
      },
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
