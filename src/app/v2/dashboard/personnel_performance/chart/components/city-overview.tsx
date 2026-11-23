"use client";

import React from "react";
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

/** v2 city overview — Bklit bar chart presentation. */
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
        className={twMerge(
          "flex min-h-[520px] w-full flex-col gap-2 p-3",
          selectedPerson ? "" : "",
        )}
        dir="rtl"
      >
        <CitiesWithDatesPerformanceBarChart
          chartEngine="bklit"
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
