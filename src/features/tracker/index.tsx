import { Tracker } from "@tremor/react";
import {
  ArrowDownRightIcon,
  MoveLeftIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import React from "react";
import { TremorColor } from "~/types";
import { cn } from "~/lib/utils";
import H2 from "~/ui/heading/h2";
import ToolTip from "~/ui/tooltip";

type TrackerType = {
  date: string;
  performance: number;
  tracker: {
    color: TremorColor;
    tooltip: string;
  }[];
};

export default function TrackerView({ data }: { data: TrackerType }) {
  return (
    <div
      dir="rtl"
      className="relative flex w-full flex-col   justify-between gap-2 rounded-xl bg-secbuttn p-6"
    >
      <div className="flex w-full flex-col justify-between gap-5">
        <div className="flex w-full items-center justify-between">
          <H2 className="text-right text-xl font-bold text-primbuttn">وضعیت</H2>
          {/* blinker */}
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primbuttn opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primbuttn"></span>
          </span>
        </div>
        <p className="text-right text-primary">
          ماه <span className="text-primbuttn">{data.date}</span>
        </p>
      </div>
      <div className="flex w-full flex-col justify-between gap-5">
        <div className="flex w-full flex-col items-center justify-center">
          <div className=" flex w-full justify-between ">
            <MoveLeftIcon className="stroke-primary" />
            <div
              className={cn(
                "inline-flex w-max flex-shrink-0 cursor-default items-center justify-center rounded-tremor-full px-2.5 py-0.5 text-sm  ",
                data.performance < 50
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700",
              )}
            >
              {data.performance}%
              {data.performance < 50 ? (
                <ArrowDownRightIcon className="h-5 w-5 stroke-red-700" />
              ) : (
                <ArrowUpRightIcon className="h-5 w-5 stroke-emerald-700" />
              )}
            </div>
          </div>
        </div>
        <Tracker data={data.tracker ?? []} className="mt-2" />
        {/* <MyTracker data={data.tracker ?? []} className="mt-2" /> */}
      </div>
    </div>
  );
}

function MyTracker({
  data,
  className,
}: {
  data: {
    color: TremorColor;
    tooltip: string;
  }[];
  className: string;
}) {
  return (
    <div className=" flex h-10 items-center justify-center gap-1">
      {data.map((item, i) => {
        const delay = i * 0.2;
        return (
          <>
            <div
              className={`group relative h-full w-full rounded-lg bg-${item.color}-500   `}
            >
              <ToolTip className="z-10">
                <span>{item.tooltip}</span>
              </ToolTip>
            </div>
          </>
        );
      })}
    </div>
  );
}