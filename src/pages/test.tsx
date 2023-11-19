import React from "react";
import { Card, Title, BarChart, Subtitle } from "@tremor/react";
import moment from "jalali-moment";
import H2 from "~/ui/heading/h2";
import Gauge from "~/features/gauge";
import { SelectControlled } from "~/features/checkbox-list";
export default function Test() {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col gap-5 bg-secondary">
        <div
          className="m-auto flex w-11/12 items-center justify-center"
          dir="rtl"
        >
          <SelectControlled
            title={"s"}
            list={Array.from(Array(100).keys()).map((a) => a.toString())}
            value={[0]}
            onChange={() => {}}
          />
        </div>
      </div>
    </>
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
