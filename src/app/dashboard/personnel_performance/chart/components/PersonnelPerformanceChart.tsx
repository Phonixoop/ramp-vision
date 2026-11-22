"use client";

import React from "react";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { usePersonnelChart } from "../hooks/usePersonnelChart";
import { FiltersSection } from "./FiltersSection";
import { ChartHeader } from "./ChartHeader";
import { CitiesList } from "./CitiesList";
import { RightPane } from "./RightPane";
import { BottomChart } from "./BottomChart";
import WorkDaysToggle from "~/features/work-days-toggle";
import { useWorkDaysToggle } from "~/context/work-days-toggle.context";

const VERSION_BTN =
  "inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/20 bg-secondary px-3 text-xs text-primary transition-colors hover:bg-primary/5";

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
    totalWorkDays,
    isLoading,
    handleCalendarSubmit,
    updateFilters,
    handleCityNavigation,
    setListView,
    getCalendarPeriodType,
    hasSavedDefaults,
    saveCurrentAsDefaults,
    resetToSystemDefaults,
    applySavedOrSystemDefaults,
  } = usePersonnelChart();

  // Get work days toggle state from context
  const { useWorkDays, setUseWorkDays } = useWorkDaysToggle();

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

  const v2Href = activeCity
    ? `/v2/dashboard/personnel_performance/chart/${encodeURIComponent(activeCity)}`
    : "/v2/dashboard/personnel_performance/chart";

  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-center gap-3 px-4 py-5">
        <h1 className="text-center text-2xl text-primary underline underline-offset-[12px]">
          (نمودار) جزئیات عملکرد پرسنل شعب
        </h1>
        <Link href={v2Href} className={VERSION_BTN}>
          <SparklesIcon className="size-3.5" />
          نسخه جدید
        </Link>
      </div>

      <div className="flex min-h-screen w-full flex-col items-center justify-center divide-y-2 divide-secbuttn py-2">
        {/* Filters */}
        <FiltersSection
          filters={filters}
          reportPeriod={reportPeriod}
          getInitialFilters={getInitialFilters}
          onCalendarSubmit={handleCalendarSubmit}
          onUpdateFilters={updateFilters}
          getCalendarPeriodType={getCalendarPeriodType}
          hasSavedDefaults={hasSavedDefaults}
          onSaveDefaults={saveCurrentAsDefaults}
          onApplyDefaults={applySavedOrSystemDefaults}
          onResetDefaults={resetToSystemDefaults}
        />

        {/* Work Days Toggle */}
        <div className="flex justify-center py-2">
          <WorkDaysToggle
            isEnabled={useWorkDays}
            onToggle={setUseWorkDays}
            totalWorkDays={totalWorkDays}
            className="rounded-lg bg-primary/5 px-4 py-2"
          />
        </div>
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
              useWorkDays={useWorkDays}
            />
          </div>

          {/* Right pane - This will be the children from the layout */}
          <RightPane
            navigatingToCity={navigatingToCity}
            useWorkDays={useWorkDays}
          >
            {children}
          </RightPane>
        </div>
        {/* Bottom chart */}
        {activeCity && (
          <BottomChart
            filters={filters}
            activeCity={activeCity}
            useWorkDays={useWorkDays}
          />
        )}
      </div>
    </>
  );
});
