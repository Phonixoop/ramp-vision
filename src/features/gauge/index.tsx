import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import dynamic from "next/dynamic";

const GaugeChart = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});

// const GaugeChart = dynamic(() => import("react-gauge-chart"), {
//   loading: () => <p>Loading...</p>,
// });

ChartJS.register(ArcElement, Tooltip, Legend);
export default function Gauge({ value }) {
  if (!value) return <></>;
  return (
    <div className="text-center">
      {value}
      <GaugeChart
        // className="xl:scale-125"
        //@ts-ignore
        type="semicircle"
        minValue={0}
        maxValue={500}
        arc={{
          colorArray: ["#FF2121", "#00FF15"],
          padding: 0.02,
          subArcs: [
            { limit: 50 },

            { limit: 100 },
            { limit: 200 },
            { limit: 300 },
            { limit: 400 },
            { limit: 500 },
          ],
        }}
        pointer={{ type: "blob", animationDelay: 1 }}
        labels={{
          valueLabel: {
            formatTextValue: (value) => `${value}%`,
          },
          tickLabels: {
            type: "outer",
            ticks: [
              { value: 50 },
              { value: 100 },
              { value: 200 },
              { value: 300 },
              { value: 400 },
              { value: 500 },
            ],
          },
        }}
        value={Math.trunc(Number.isNaN(value) ? 0 : value)}
      />
    </div>
  );
}
