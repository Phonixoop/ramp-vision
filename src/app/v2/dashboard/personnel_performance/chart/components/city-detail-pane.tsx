"use client";

import { BottomChart } from "./bottom-chart";
import { CityOverview } from "./city-overview";
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
          <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-third">
            <PersonnelDetailsPanel />
          </div>
        ) : null}
        <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-third">
          <CityOverview
            currentCity={currentCity}
            filters={apiFilters}
            selectedPerson={selectedPerson}
            tehranSubCities={tehranSubCities}
          />
        </div>
      </div>
      {ready ? (
        <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-third">
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
