import React from "react";
import { getEnglishToPersianCity } from "~/utils/util";

interface ChartHeaderProps {
  activeCity: string;
}

export const ChartHeader = React.memo<ChartHeaderProps>(({ activeCity }) => {
  return (
    <div className="mx-auto flex w-11/12 items-center justify-end">
      {activeCity && (
        <div className="flex items-center justify-center gap-1 p-2 px-6 text-accent">
          <span>{getEnglishToPersianCity(activeCity)}</span>
        </div>
      )}
    </div>
  );
});

ChartHeader.displayName = "ChartHeader";
