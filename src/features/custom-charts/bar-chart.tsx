import { SquircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";
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
                    className={twMerge(
                      bar?.labelClassName ?? "fill-cyan-400 text-sm",
                      "text-sm",
                    )}
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
                height={customXTick ? 160 : 80}
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
        <Legend content={<CustomLegend bars={bars} />} />
        <Tooltip
          content={<CustomTooltip bars={bars} />}
          labelFormatter={(value, index) => formatter(value)}
        />
      </BarChart>
    </div>
  );
}

function CustomLegend({ bars = [], ...rest }) {
  return (
    <div className="flex items-center justify-center gap-5 ">
      {bars.map((bar) => {
        return (
          <>
            <div className="flex items-center justify-center gap-2">
              <SquircleIcon className={twMerge("stroke-none", bar.className)} />
              <span className="text-primary">{bar.name}</span>
            </div>
          </>
        );
      })}
    </div>
  );
}

function CustomTooltip({ bars = [], ...rest }) {
  const { active, payload, label, labelFormatter } = rest;
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-[0.5px] border-primary/10 bg-secondary p-2  text-primary">
        <div className="border-b border-primary/10 ">
          <p className=" py-2 text-primary ">{label}</p>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-2 pb-3 ">
          {payload.map((p) => {
            const theBar = bars.find((b) => b.name === p.name);
            const valueFormat = labelFormatter
              ? labelFormatter(p.value)
              : p.value;
            return (
              <>
                <div className="flex w-full items-center justify-between gap-5 ">
                  <span className="text-primary">{valueFormat}</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-primary">{p.name}</span>
                    <SquircleIcon
                      className={twMerge("stroke-none", theBar.className)}
                    />
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    );
  }

  return undefined;
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
