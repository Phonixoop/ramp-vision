import React, { useState } from "react";
import { Pie, Sector, ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";
import { commify } from "~/utils/util";
import { twMerge } from "tailwind-merge";

const PieChart = dynamic(
  () => import("recharts").then((recharts) => recharts.PieChart),
  { ssr: false },
);

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

export default function CustomPieChart({ className = "", data = [], index }) {
  const [activeBar, setActiveBar] = useState({
    index: 0,
    name: data[0].name,
  });

  function onPieEnter(data, index) {
    setActiveBar({
      index,
      name: data.name,
    });
  }
  // function onPieLeave() {
  //   setActiveIndex(-1);
  // }
  const isEmpty = data.filter(({ value }) => value > 0).length <= 0;
  return (
    <div
      dir="ltr"
      className={twMerge("flex  w-full items-center justify-center", className)}
    >
      {isEmpty ? (
        <div className="flex h-[300px] w-full items-center justify-center p-2 text-center text-primary">
          <span>دیتا ای وجود ندارد</span>
        </div>
      ) : (
        <PieChart width={450} height={300}>
          <Pie
            activeIndex={[activeBar.index]}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            stroke="#00000000"
            innerRadius={60}
            outerRadius={80}
            dataKey={"value"}
            onMouseEnter={onPieEnter}
            // onMouseLeave={onPieLeave}
            // label={activeIndex === -1}
            label={(entry) =>
              `${
                entry.name === activeBar.name ? "" : `${commify(entry.value)}`
              }`
            }
          />
        </PieChart>
      )}
    </div>
  );
}
