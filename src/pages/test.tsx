import React from "react";
import { Card, Title, BarChart, Subtitle } from "@tremor/react";
import moment from "jalali-moment";
import H2 from "~/ui/heading/h2";
import Gauge from "~/features/gauge";
export default function Test() {
  return (
    <div className="mx-auto w-6/12">
      <div className="flex w-full flex-col items-center  justify-between gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:p-5">
        <H2>عملکرد</H2>
        <p className="text-right">% {(75).toFixed(2)}</p>
        <Gauge value={75} />
      </div>
    </div>
  );
}

export function getFirstSaturdayOfLastWeekOfMonth(year: number, month: number) {
  // Get the first day of the month in the Jalali calendar
  // Get the current date
  const currentDate = moment()
    .locale("fa")
    .year(year)
    .month(month - 1)
    .jDay(1);

  // Calculate the date for the Saturday in the 4th week
  const fourthWeek = currentDate
    .clone()
    .add(3, "weeks") // Add 3 weeks to get to the 4th week
    .day(6); // Set the day to Saturday (0 is Sunday, 6 is Saturday)

  return fourthWeek.format("YYYY/MM/DD");
}
