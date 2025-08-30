import React from "react";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";

interface BottomChartProps {
  filters: any;
  activeCity: string;
}

export const BottomChart = React.memo<BottomChartProps>(
  ({ filters, activeCity }) => {
    return (
      <div
        dir="rtl"
        className="mx-auto flex w-11/12 flex-col items-center justify-center gap-5 rounded-b-2xl bg-secondary p-2 py-5"
      >
        <CityPerformanceWithUsersChart
          filters={filters}
          cityName_En={activeCity}
        />
      </div>
    );
  },
);

BottomChart.displayName = "BottomChart";
