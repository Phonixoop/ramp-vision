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
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl p-5",
          selectedPerson ? "" : "",
        )}
      >
        <ResponsiveContainer width="99%" height="auto">
          <CitiesWithDatesPerformanceBarChart
            filters={{
              ...filters,
              filter: { ...filters.filter, CityName: [currentCity] },
            }}
          />
        </ResponsiveContainer>
      </div>
    );
  },
);

CityOverview.displayName = "CityOverview";
