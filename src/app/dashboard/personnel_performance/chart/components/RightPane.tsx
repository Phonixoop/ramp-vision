import React from "react";
import LoaderAnim from "~/components/main/loader-anim";

interface RightPaneProps {
  children?: React.ReactNode;
  navigatingToCity: string | null;
}

export const RightPane = React.memo<RightPaneProps>(
  ({ children, navigatingToCity }) => {
    return (
      <>
        {navigatingToCity ? (
          <div className="flex h-full  items-center justify-center rounded-lg bg-secondary/50 p-8">
            <div className="text-center">
              <span dir="rtl" className="mb-4 text-lg text-primary">
                در حال بارگذاری...
              </span>
              <LoaderAnim />{" "}
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
