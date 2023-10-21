import moment from "jalali-moment";
import React from "react";

export default function Test() {
  return <div>{getFirstSaturdayOfLastWeekOfMonth(1402, 7)}</div>;
}

function getFirstSaturdayOfLastWeekOfMonth(year: number, month: number) {
  // Get the first day of the month in the Jalali calendar
  // Get the current date
  const currentDate = moment()
    .locale("fa")
    .year(year)
    .month(month - 2)
    .jDay(1);

  // Calculate the date for the Saturday in the 4th week
  const fourthWeek = currentDate
    .clone()
    .add(3, "weeks") // Add 3 weeks to get to the 4th week
    .day(6); // Set the day to Saturday (0 is Sunday, 6 is Saturday)

  return fourthWeek.format("YYYY/MM/DD");
}
