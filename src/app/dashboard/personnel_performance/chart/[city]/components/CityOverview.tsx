import React from "react";
import { ResponsiveContainer } from "recharts";
import { twMerge } from "tailwind-merge";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import { TEHRAN_SUB_CITIES } from "~/constants";
import {
  expandTehranPerformanceCities,
  normalizeCityName,
} from "~/utils/personnel-performance";

interface CityOverviewProps {
  currentCity: string;
  filters: any;
  selectedPerson: any;
  tehranSubCities: (typeof TEHRAN_SUB_CITIES)[number][];
}

export const CityOverview = React.memo<CityOverviewProps>(
  ({ currentCity, filters, selectedPerson, tehranSubCities }) => {
    const cityFilter =
      normalizeCityName(currentCity) === "Tehran"
        ? tehranSubCities.length > 0
          ? tehranSubCities
          : expandTehranPerformanceCities([currentCity])
        : [currentCity];

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
            filter: { ...filters.filter, CityName: cityFilter },
          }}
        />
      </div>
    );
  },
);

CityOverview.displayName = "CityOverview";
