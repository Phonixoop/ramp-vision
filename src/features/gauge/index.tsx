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
      <GaugeChart
        // className="xl:scale-125"
        //@ts-ignore
        type="semicircle"
        minValue={0}
        maxValue={500}
        arc={{
          // colorArray: ["#FF2121", "#00FF15"],
          padding: 0.02,
          subArcs: [
            {
              limit: 80,
              color: "#B12B1D",
              tooltip: {
                text: "ضعیف",
              },
            },

            {
              limit: 100,
              color: "#7BB11B",
              tooltip: {
                text: "متوسط",
              },
            },
            {
              limit: 150,
              color: "#7BB11B",
              tooltip: {
                text: "خوب",
              },
            },
            {
              limit: 200,
              color: "#16B13D",
              tooltip: {
                text: "عالی",
              },
            },
            {
              limit: 500,
              color: "#B1671E",
              tooltip: {
                text: "نیاز به برسی",
              },
            },
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
              { value: 80 },
              { value: 100 },
              { value: 150 },
              { value: 200 },
              { value: 500 },
            ],
          },
        }}
        value={Math.trunc(Number.isNaN(value) ? 0 : value)}
      />
    </div>
  );
}
