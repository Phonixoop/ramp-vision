"use client";

import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/shadcn/tooltip";
import { analyzePerformanceTrend } from "~/utils/util";

export function TrendDecider({ values }: { values: number[] }) {
  const trend = analyzePerformanceTrend(values);
  if (trend === "Up")
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <TrendingUpIcon className="h-5 w-5 stroke-emerald-700" />
            </TooltipTrigger>
            <TooltipContent className="bg-primary">
              <p className="text-secondary">روند رو به رشد</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </>
    );

  if (trend === "Stable")
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <MinusIcon className="h-5 w-5 stroke-amber-700" />
            </TooltipTrigger>
            <TooltipContent className="bg-primary">
              <p className="text-secondary">روند پایدار</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </>
    );

  if (trend === "Down")
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <TrendingDownIcon className="h-5 w-5 stroke-rose-700" />
            </TooltipTrigger>
            <TooltipContent className="bg-primary">
              <p className="text-secondary">روند رو به پایین</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </>
    );
}
