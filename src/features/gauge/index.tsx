import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import dynamic from "next/dynamic";
import { Performance_Levels_Gauge } from "~/constants/personnel-performance";

const GaugeChart = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});

// const GaugeChart = dynamic(() => import("react-gauge-chart"), {
//   loading: () => <p>Loading...</p>,
// });

ChartJS.register(ArcElement, Tooltip, Legend);
export default function Gauge({ value }) {
  if (value == undefined || value == null) return <></>;
  return (
    <div className="text-center">
      <GaugeChart
        // className="xl:scale-125"
        //@ts-ignore
        type="grafana"
        minValue={0}
        maxValue={500}
        arc={{
          // colorArray: ["#FF2121", "#00FF15"],

          padding: 0.02,
          subArcs: Performance_Levels_Gauge,
        }}
        pointer={{ type: "blob", animationDelay: 1 }}
        labels={{
          valueLabel: {
            formatTextValue: (value) => `${value}%`,
            matchColorWithArc: true,
            style: {
              textShadow: "none",
            },
          },
          tickLabels: {
            type: "outer",
            ticks: [
              { value: 75 },
              { value: 90 },
              { value: 120 },
              { value: 180 },
              { value: 500 },
            ],
          },
        }}
        value={Math.round(Number.isNaN(value) ? 0 : value)}
      />
      <span className="text-primary">
        {(Number.isNaN(value) ? 0 : value).toFixed(2)}
      </span>
    </div>
  );
}
