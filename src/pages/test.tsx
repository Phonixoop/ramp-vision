import React from "react";
import { Card, Title, BarChart, Subtitle } from "@tremor/react";
import moment from "jalali-moment";
export default function Test() {
  return (
    <div className="mx-auto w-6/12">{humanizeDuration(0.03, "months")}</div>
  );
}

function humanizeDuration(number, duration) {
  let result = "";

  if (duration === "months") {
    result = moment.duration(number, "months").humanize();
  } else if (duration === "weeks") {
    result = moment.duration(number, "weeks").humanize();
  } else if (duration === "days") {
    result = moment.duration(number, "days").humanize();
  } else {
    result = "Invalid duration";
  }

  return result;
}
