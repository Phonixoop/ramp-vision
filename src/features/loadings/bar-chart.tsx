import React from "react";

export function BarChartSkeletonLoading() {
  return (
    <>
      <div role="status" className="0 w-full animate-pulse rounded   p-4  ">
        <div className="mx-auto mb-2.5 h-2.5 w-32 rounded-full bg-primary/50 "></div>
        <div className="mx-auto mb-10 h-2 w-48 rounded-full bg-primary/50 "></div>
        <div className="mt-4 flex items-baseline">
          <div className="h-72 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-56 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-72 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-64 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-80 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-72 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-80 w-full rounded-t-lg bg-primary/50 "></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}
