// @ts-nocheck - Disable TypeScript checking for recharts type conflicts
import React, { useState, useCallback } from "react";
import { Pie, Sector, ResponsiveContainer, PieChart } from "recharts";
import dynamic from "next/dynamic";
import { commify } from "~/utils/util";

import { cn } from "~/lib/utils";

// const PieChart = dynamic(
//   () => import("recharts").then((recharts) => recharts.PieChart),
//   { ssr: false },
// );

const dataa = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill={fill}
      >{`${commify(value)}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill={fill}
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function CustomPieChart<
  T extends { name: string; value: number; fill?: string },
>({
  className = "",
  data = [],
  index,
}: {
  className?: string;
  data: T[];
  index: keyof T;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  const isEmpty = data.filter(({ value }) => value > 0).length <= 0;

  return (
    <div
      dir="ltr"
      className={cn(
        "flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pie-chart-container svg:focus,
          .pie-chart-container svg:focus-visible,
          .pie-chart-container svg *:focus,
          .pie-chart-container svg *:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
        `,
        }}
      />
      {isEmpty ? (
        <div className="flex h-full w-full items-center justify-center p-2 text-center text-primary">
          <span>دیتا ای وجود ندارد</span>
        </div>
      ) : (
        <div className="pie-chart-container">
          <PieChart width={300} height={300}>
            <Pie
              activeShape={activeIndex >= 0 ? renderActiveShape : undefined}
              data={data}
              cx="50%"
              cy="50%"
              stroke="#00000000"
              innerRadius={60}
              outerRadius={80}
              dataKey={"value"}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              label={(entry) => `${commify(entry.value)}`}
            />
          </PieChart>
        </div>
      )}
    </div>
  );
}
