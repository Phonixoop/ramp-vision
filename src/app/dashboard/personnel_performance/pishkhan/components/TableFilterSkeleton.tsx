import React from "react";
import { cn } from "~/lib/utils";

interface TableFilterSkeletonProps {
  className?: string;
}

export function TableFilterSkeleton({ className }: TableFilterSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 px-2 text-center text-primary sm:px-0",
        className,
      )}
    >
      <div className="relative flex w-full max-w-[350px] items-center gap-2">
        {/* MultiSelect trigger skeleton */}
        <div className="flex min-h-[38px] w-full animate-pulse items-center justify-between rounded-xl border border-primary/10 bg-secondary/60 px-3 py-2">
          <div className="h-4 w-2/3 rounded bg-primary/10"></div>
          <div className="h-4 w-4 rounded bg-primary/10"></div>
        </div>
      </div>

      {/* Select all button skeleton */}
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl border border-primary/10 bg-secbuttn/60"></div>
    </div>
  );
}

export function TableFilterSectionSkeleton() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <div className="h-5 w-16 animate-pulse rounded bg-primary/10"></div>
      <TableFilterSkeleton />
    </div>
  );
}

export function TableFiltersContainerSkeleton() {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-5 text-primary"
      dir="rtl"
    >
      <div className="h-8 w-64 animate-pulse rounded bg-primary/10"></div>

      <div className="relative flex w-full items-center justify-center rounded-lg py-5 text-center">
        <div className="w-full">
          {/* Filter sections skeleton */}
          <div className="flex w-full flex-wrap items-center justify-center gap-4">
            {/* City filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-12 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>

            {/* Personnel filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>

            {/* Performance filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>

            {/* Town filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-16 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>

            {/* Branch Name filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>

            {/* Branch Code filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>

            {/* Branch Type filter skeleton */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
              <TableFilterSkeleton />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="mt-8 w-full">
            <div className="h-96 w-full animate-pulse rounded-lg bg-secondary/60"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
