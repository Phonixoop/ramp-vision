import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  ComposedChart,
  LabelList,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { commify } from "~/utils/util";

type BarType = {
  name: string;
  className?: string;
  labelClassName?: string;
  position?:
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "inside"
    | "outside"
    | "insideLeft"
    | "insideRight"
    | "insideTop"
    | "insideBottom"
    | "insideTopLeft"
    | "insideBottomLeft"
    | "insideTopRight"
    | "insideBottomRight"
    | "insideStart"
    | "insideEnd"
    | "end"
    | "center"
    | "centerTop"
    | "centerBottom"
    | "middle"
    | {
        x?: number;
        y?: number;
      };
  angle?: number;
};
type CustomBarChartOptions = {
  nameClassName?: string;
  width: number;
  height: number;
  data: any[];
  bars: BarType[];
  keys: string[];
  customXTick?: boolean;
  customYTick?: boolean;
  formatter?: Function;
};
export default function CustomBarChart({
  nameClassName = "",
  width,
  height = 500,
  data = [],
  bars = [],
  keys = [],
  customXTick = false,
  customYTick = false,
  formatter = (num: number) => "",
}: CustomBarChartOptions) {
  const container = useRef<HTMLDivElement>(undefined);

  const [containerWidth, setContainerWidth] = useState(width);

  useEffect(() => {
    setContainerWidth(container.current.clientWidth);
    const handleResize = () => {
      setContainerWidth(container.current.clientWidth);
    };

    // Add event listener to listen for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures that the effect runs only once on mount
  return (
    <div ref={container} className="h-full w-full">
      <BarChart width={containerWidth ?? width} height={height} data={data}>
        {bars.map((bar) => {
          return (
            <>
              <Bar dataKey={bar.name} className={bar.className}>
                {bar.labelClassName && (
                  <LabelList
                    formatter={formatter}
                    dataKey={bar.name}
                    className={bar?.labelClassName ?? "fill-cyan-400"}
                    position={bar?.position ?? "centerTop"}
                    angle={bar?.angle ?? -90}
                  />
                )}
              </Bar>
            </>
          );
        })}

        {keys.map((key) => {
          return (
            <>
              <XAxis
                height={customXTick ? 160 : 50}
                interval={0}
                orientation="bottom"
                dataKey={key}
                scale="point"
                padding={{ left: bars.length * 35, right: bars.length * 35 }}
                tickFormatter={(value, index) => formatter(value)}
                tick={
                  <CustomizedXAxisTick
                    customXTick={customXTick}
                    className={nameClassName}
                  />
                }
              />
            </>
          );
        })}
        <YAxis
          tickFormatter={(value, index) => formatter(value)}
          orientation="right"
          tick={customYTick ? <CustomizedYAxisTick /> : null}
        />

        <Tooltip
          content={<CustomToolTip />}
          formatter={(value, index) => formatter(value)}
        />
      </BarChart>
    </div>
  );
}
function CustomToolTip({ ...rest }) {
  console.log({ rest: rest.content });
  // label
  //formatter
  return <>{rest.content}</>;
}

function CustomizedXAxisTick({ className = "", customXTick = false, ...rest }) {
  const { x, y, payload } = rest;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={customXTick ? 0 : -50}
        y={customXTick ? 0 : 40}
        dy={0}
        className={className}
        textAnchor="end"
        transform={customXTick ? "rotate(90)" : ""}
      >
        {payload.value}
      </text>
    </g>
  );
}

function CustomizedYAxisTick({ ...rest }) {
  const { x, y, payload } = rest;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={0} className="fill-primary" textAnchor="end">
        {payload.value}
      </text>
    </g>
  );
}
