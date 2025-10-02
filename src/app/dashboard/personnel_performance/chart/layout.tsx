// app/dashboard/personnel_performance/chart/layout.tsx
"use client";

import React, { Suspense } from "react";
import { PersonnelPerformanceChart } from "./components/PersonnelPerformanceChart";
import { PersonnelPerformanceChartProvider } from "./context";
import { WorkDaysToggleProvider } from "~/context/work-days-toggle.context";
import { useSession } from "next-auth/react";
import LoaderAnim from "~/components/main/loader-anim";

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000">
      <div className="w-full sm:p-0 ">
        <PersonnelPerformanceChartProvider>
          <WorkDaysToggleProvider>
            <Suspense fallback={<LoaderAnim />}>
              <PersonnelPerformanceChart sessionData={session}>
                {children}
              </PersonnelPerformanceChart>
            </Suspense>
          </WorkDaysToggleProvider>
        </PersonnelPerformanceChartProvider>
      </div>
    </div>
  );
}
