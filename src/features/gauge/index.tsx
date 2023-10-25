import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import dynamic from "next/dynamic";

const GaugeChart = dynamic(() => import("react-gauge-chart"), {
  loading: () => <p>Loading...</p>,
});

ChartJS.register(ArcElement, Tooltip, Legend);
export default function Gauge({ value }) {
  return (
    <div className="text-center">
      <GaugeChart
        //@ts-ignore
        nrOfLevels={5}
        colors={["#F44336", "rgb(75, 113, 100)"]}
        arcWidth={0.3}
        percent={value / 100}
      />
    </div>
  );
}
