import React from "react";
import LoaderAnim from "~/components/main/loader-anim";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";

interface RightPaneProps {
  children?: React.ReactNode;
  navigatingToCity: string | null;
  useWorkDays?: boolean;
}

export const RightPane = React.memo<RightPaneProps>(
  ({ children, navigatingToCity, useWorkDays }) => {
    return (
      <>
        {navigatingToCity ? (
          <div className="flex h-[680px] w-full items-center justify-center gap-5 rounded-lg bg-accent bg-secondary/50">
            <div className=" grid h-full w-8/12 grid-cols-2 grid-rows-2 items-center justify-center gap-5 rounded-xl bg-secbuttn p-2  ">
              <span className="h-full w-full animate-pulse rounded-xl bg-primary/5" />
              <span className="h-full w-full animate-pulse rounded-xl bg-primary/5" />
              <div className="h-full w-full animate-pulse rounded-xl bg-primary/5">
                <BarChartSkeletonLoading />
              </div>
              <span className="h-full w-full animate-pulse rounded-xl bg-primary/5" />
            </div>
            <div className="flex h-full w-4/12 flex-col items-center justify-center gap-2 rounded-xl bg-secbuttn px-2 ">
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
              <span className="h-14 w-full animate-pulse rounded-xl bg-primary/10"></span>
            </div>
          </div>
        ) : (
          children || (
            <div className="flex h-full items-center  justify-center rounded-lg bg-red-400 bg-secondary/50 p-8">
              <p className="text-center text-muted-foreground">
                برای مشاهده جزئیات شهر، روی آن کلیک کنید
              </p>
            </div>
          )
        )}
      </>
    );
  },
);

RightPane.displayName = "RightPane";
