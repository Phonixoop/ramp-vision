import React from "react";

export function BarChartSkeletonLoading() {
  return (
    <>
      <div role="status" className="0  w-full animate-pulse rounded p-4 ">
        <div className="mt-4 flex items-baseline">
          <div className="h-32 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-14 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-20 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-44 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-24 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-14 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-32 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-64 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-32 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-52 w-full rounded-t-lg bg-primary/50 "></div>
          <div className="ms-6 h-32 w-full rounded-t-lg bg-primary/50 "></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}
