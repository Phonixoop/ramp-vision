"use client";

import React from "react";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";

interface BottomChartProps {
  filters: any;
  activeCity: string;
  useWorkDays?: boolean;
}

/** v2 bottom personnel chart — Bklit bar presentation. */
export const BottomChart = React.memo<BottomChartProps>(
  ({ filters, activeCity, useWorkDays }) => {
    return (
      <div className="w-full">
        <CityPerformanceWithUsersChart
          chartEngine="bklit"
          cityName_En={activeCity}
          filters={filters}
          useWorkDays={useWorkDays}
        />
      </div>
    );
  },
);

BottomChart.displayName = "BottomChart";
