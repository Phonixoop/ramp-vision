// @ts-nocheck - Disable TypeScript checking for recharts type conflicts
"use client";

import { Bar, BarChart, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-primary-muted/5 p-4">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar dataKey="desktop" fill="red" radius={4} />
            <Bar dataKey="mobile" fill="blue" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
