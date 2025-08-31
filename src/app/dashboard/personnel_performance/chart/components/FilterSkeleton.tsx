import React from "react";
import { cn } from "~/lib/utils";

interface FilterSkeletonProps {
  className?: string;
}

export function FilterSkeleton({ className }: FilterSkeletonProps) {
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

export function FilterSectionSkeleton() {
  return (
    <div className="mx-auto flex w-11/12 items-center justify-center gap-5 rounded-t-2xl p-2 sm:flex-col">
      <div className="hidden py-2 text-xl sm:flex">
        <div className="h-6 w-16 animate-pulse rounded bg-primary/10"></div>
      </div>

      <div className="z-20 flex max-h-[100vh] w-full flex-wrap items-stretch justify-start rounded-t-3xl bg-secondary sm:max-h-min sm:p-5">
        <div className="flex w-full flex-wrap">
          {/* Report period skeleton */}
          <div className="flex w-[15rem] max-w-sm flex-col items-center justify-around gap-3 p-2">
            <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
            <div className="flex min-h-[38px] w-full animate-pulse items-center justify-between rounded-md border border-primary/20 bg-secondary/60 px-3 py-2">
              <div className="h-4 w-32 rounded bg-primary/10"></div>
              <div className="h-4 w-4 rounded bg-primary/10"></div>
            </div>
          </div>

          {/* Project Type skeleton */}
          <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
            <div className="h-5 w-16 animate-pulse rounded bg-primary/10"></div>
            <FilterSkeleton />
          </div>

          {/* Role skeleton */}
          <div className="flex max-w-sm flex-col items-center justify-center gap-3 p-2 sm:w-[25rem]">
            <div className="h-5 w-8 animate-pulse rounded bg-primary/10"></div>
            <FilterSkeleton />
          </div>

          {/* Contract Type skeleton */}
          <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
            <div className="h-5 w-20 animate-pulse rounded bg-primary/10"></div>
            <FilterSkeleton />
          </div>

          {/* Role Type skeleton */}
          <div className="flex w-[22rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
            <div className="h-5 w-16 animate-pulse rounded bg-primary/10"></div>
            <FilterSkeleton />
          </div>

          {/* Personnel report DateInfo skeleton */}
          <div className="flex w-[12rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
            <div className="h-5 w-24 animate-pulse rounded bg-primary/10"></div>
            <FilterSkeleton />
          </div>
        </div>

        {/* More filters skeleton */}
        <div className="flex w-full flex-wrap items-center justify-center">
          <div className="w-full">
            <div className="flex min-h-[38px] w-full animate-pulse items-center justify-between rounded-md border border-primary/20 bg-secondary/60 px-3 py-2">
              <div className="h-4 w-24 rounded bg-primary/10"></div>
              <div className="h-4 w-4 rounded bg-primary/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
