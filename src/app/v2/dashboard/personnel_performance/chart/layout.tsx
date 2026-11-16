"use client";

import { Suspense, type ReactNode } from "react";
import { ChartFiltersProvider } from "./filters-context";
import { ChartClient } from "./chart-client";

function ChartFallback() {
  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="h-12 shrink-0 border-b border-border-color/10 bg-fourth" />
      <div className="h-12 shrink-0 border-b border-border-color/10 bg-third/90" />
      <div className="grid min-h-0 flex-1 gap-3 p-3 md:grid-cols-[300px_300px_1fr] md:p-4">
        <div className="animate-pulse rounded-2xl bg-fourth" />
        <div className="animate-pulse rounded-2xl bg-fourth" />
        <div className="animate-pulse rounded-2xl bg-fourth" />
      </div>
    </div>
  );
}

export default function ChartLayout({
  children: _children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <ChartFiltersProvider>
        <ChartClient />
      </ChartFiltersProvider>
    </Suspense>
  );
}
