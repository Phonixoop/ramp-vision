import React from "react";

export function HeaderSkeleton() {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 flex w-full flex-col items-center justify-between border-b border-primary/20 bg-secondary sm:p-0"
    >
      <div className="flex w-full flex-row items-center justify-between gap-4 py-2 lg:w-11/12">
        {/* Left side - Navigation */}
        <div className="flex w-full flex-row items-center justify-start gap-4 px-2 sm:w-max sm:px-0">
          {/* Mobile menu button skeleton */}
          <div className="flex sm:hidden">
            <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20" />
          </div>

          {/* Logo and brand skeleton */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-7 w-7 animate-pulse rounded bg-primary/20" />
            <div className="h-6 w-16 animate-pulse rounded bg-primary/20" />
          </div>

          {/* Navigation links skeleton */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex gap-2">
              <div className="h-8 w-16 animate-pulse rounded-full bg-primary/20" />
              <div className="h-8 w-16 animate-pulse rounded-full bg-primary/20" />
              <div className="h-8 w-20 animate-pulse rounded-full bg-primary/20" />
            </div>

            {/* Performance/Insurance/Personnel buttons skeleton */}
            <div className="relative flex h-fit gap-2">
              <div className="h-8 w-20 animate-pulse rounded-full bg-primary/20" />
              <div className="h-8 w-24 animate-pulse rounded-full bg-primary/20" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-primary/20" />
            </div>
          </div>
        </div>

        {/* Right side - Auth showcase skeleton */}
        <div className="flex items-center justify-center gap-5">
          <div className="flex items-center justify-evenly gap-4 rounded-lg bg-secbuttn/50 p-2">
            <div className="h-6 w-10 animate-pulse rounded-full bg-primary/20" />
            <div className="h-6 w-24 animate-pulse rounded-lg bg-primary/20" />
          </div>
        </div>
      </div>
    </header>
  );
}
