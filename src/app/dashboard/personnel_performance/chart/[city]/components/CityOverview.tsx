import React from "react";
import { ResponsiveContainer } from "recharts";
import { twMerge } from "tailwind-merge";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";

interface CityOverviewProps {
  currentCity: string;
  filters: any;
  selectedPerson: any;
}

export const CityOverview = React.memo<CityOverviewProps>(
  ({ currentCity, filters, selectedPerson }) => {
    return (
      <div
        dir="rtl"
        className={twMerge(
          "flex min-h-[700px] w-full flex-col items-center justify-center gap-2  rounded-xl bg-secbuttn p-5",
          selectedPerson ? "" : "",
        )}
      >
        <CitiesWithDatesPerformanceBarChart
          filters={{
            ...filters,
            filter: { ...filters.filter, CityName: [currentCity] },
          }}
        />
      </div>
    );
  },
);

CityOverview.displayName = "CityOverview";
