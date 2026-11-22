"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import dynamic from "next/dynamic";
import { Performance_Levels_Gauge } from "~/constants/personnel-performance";

const GaugeChart = dynamic(() => import("react-gauge-component"), {
  ssr: false,
});

ChartJS.register(ArcElement, Tooltip, Legend);

/** Ceiling for the legacy grafana gauge (NeedsReview band beyond 130%). */
const GAUGE_MAX = 160;

export default function Gauge({ value }) {
  if (value == undefined || value == null) return <></>;
  const safe = Number.isNaN(value) ? 0 : Number(value);
  return (
    <div className="text-center">
      <GaugeChart
        //@ts-ignore
        type="grafana"
        minValue={0}
        maxValue={GAUGE_MAX}
        arc={{
          padding: 0.02,
          subArcs: Performance_Levels_Gauge,
        }}
        pointer={{ type: "blob", animationDelay: 1 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${v}%`,
            matchColorWithArc: true,
            style: {
              textShadow: "none",
            },
          },
          tickLabels: {
            type: "outer",
            ticks: [{ value: 70 }, { value: 100 }, { value: 130 }],
          },
        }}
        value={Math.round(Math.min(Math.max(safe, 0), GAUGE_MAX))}
      />
      <span className="text-primary">{safe.toFixed(2)}</span>
    </div>
  );
}
