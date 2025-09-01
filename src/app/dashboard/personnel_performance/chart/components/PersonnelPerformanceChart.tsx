"use client";

import React from "react";
import { usePersonnelChart } from "../hooks/usePersonnelChart";
import { FiltersSection } from "./FiltersSection";
import { ChartHeader } from "./ChartHeader";
import { CitiesList } from "./CitiesList";
import { RightPane } from "./RightPane";
import { BottomChart } from "./BottomChart";

export const PersonnelPerformanceChart = React.memo<{
  sessionData: any;
  children?: React.ReactNode;
}>(function PersonnelPerformanceChart({ sessionData, children }) {
  const {
    filters,
    reportPeriod,
    distincedData,
    listView,
    activeCity,
    navigatingToCity,
    getInitialFilters,
    getCitiesWithPerformance,
    isLoading,
    handleCalendarSubmit,
    updateFilters,
    handleCityNavigation,
    setListView,
    getCalendarPeriodType,
  } = usePersonnelChart();

  // // Show loading state if context is not initialized
  // if (isLoading && !filters) {
  //   return (
  //     <div className="flex min-h-screen w-full items-center justify-center">
  //       <div className="text-center">
  //         <div className="text-lg text-primary">در حال بارگذاری...</div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <h1 className="w-full py-5 text-center text-2xl text-primary underline underline-offset-[12px]">
        (نمودار) جزئیات عملکرد پرسنل شعب
      </h1>

      <div className="flex min-h-screen w-full flex-col items-center justify-center divide-y-2 divide-secbuttn py-2">
        {/* Filters */}
        <FiltersSection
          filters={filters}
          reportPeriod={reportPeriod}
          getInitialFilters={getInitialFilters}
          onCalendarSubmit={handleCalendarSubmit}
          onUpdateFilters={updateFilters}
          getCalendarPeriodType={getCalendarPeriodType}
        />

        {/* Header showing city/person */}
        <ChartHeader activeCity={activeCity} />

        {/* Main content */}
        <div className="m-auto flex w-full flex-row-reverse items-start justify-start gap-5 p-5 pb-10 xl:w-11/12 ">
          <div className="min-w-[380px]">
            <CitiesList
              distincedData={distincedData}
              listView={listView}
              activeCity={activeCity}
              navigatingToCity={navigatingToCity}
              getCitiesWithPerformance={getCitiesWithPerformance}
              reportPeriod={reportPeriod}
              filters={filters}
              isLoading={isLoading}
              onNavigate={handleCityNavigation}
              onListViewChange={setListView}
            />
          </div>

          {/* Right pane - This will be the children from the layout */}
          <RightPane navigatingToCity={navigatingToCity}>{children}</RightPane>
        </div>

        {/* Bottom chart */}
        {activeCity && (
          <BottomChart filters={filters} activeCity={activeCity} />
        )}
      </div>
    </>
  );
});
