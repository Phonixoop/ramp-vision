"use client";

import { BottomChart } from "./bottom-chart";
import { CityMetricsCard } from "./city-metrics-card";
import { CityOverview } from "./city-overview";
import { CityTrendCard } from "./city-trend-card";
import { PersonnelDetailsPanel } from "./personnel-details-panel";
import { useChartFilters } from "../filters-context";
import { useCitySession } from "../city-session-context";

export function CityDetailPane() {
  const { apiFilters, useWorkDays } = useChartFilters();
  const {
    currentCity,
    selectedPerson,
    tehranSubCities,
    ready,
  } = useCitySession();

  if (!currentCity) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3">
        {selectedPerson ? (
          <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-fourth">
            <PersonnelDetailsPanel />
          </div>
        ) : null}
        {/* City-level KPIs + performance-band split. Reads context only. */}
        <CityMetricsCard />
        {/*
         * Daily trend. Sits above the bar charts because it is the "trend over
         * time" reading; the bars below stay untouched (owned by the pie/data
         * fix), only their wrapper surface was restyled above.
         */}
        <CityTrendCard />
        <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-fourth">
          <CityOverview
            currentCity={currentCity}
            filters={apiFilters}
            selectedPerson={selectedPerson}
            tehranSubCities={tehranSubCities}
          />
        </div>
      </div>
      {ready ? (
        <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-fourth">
          <BottomChart
            filters={apiFilters}
            activeCity={currentCity}
            useWorkDays={useWorkDays}
          />
        </div>
      ) : null}
    </div>
  );
}
