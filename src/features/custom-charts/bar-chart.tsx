import { SquircleIcon } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { twMerge } from "tailwind-merge";

const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red", "pink"];

const getPath = (x, y, width, height) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${
    y + height / 3
  }
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
    x + width
  }, ${y + height}
  Z`;
};

const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

function getPathRectangle(
  x,
  y,
  width,
  height,
  topLeftRadius,
  topRightRadius,
  bottomRightRadius,
  bottomLeftRadius,
) {
  return `
  M${x + topLeftRadius},${y}
  H${x + width - topRightRadius}
  Q${x + width},${y} ${x + width},${y + topRightRadius}
  V${y + height - bottomRightRadius}
  Q${x + width},${y + height} ${x + width - bottomRightRadius},${y + height}
  H${x + bottomLeftRadius}
  Q${x},${y + height} ${x},${y + height - bottomLeftRadius}
  V${y + topLeftRadius}
  Q${x},${y} ${x + topLeftRadius},${y}
  Z`;
}

const RectangleBar = (props) => {
  const { fill, x, y, width, height } = props;

  return (
    <path
      d={getPathRectangle(x, y, width, height, 10, 10, 0, 0)}
      stroke="none"
      fill={fill}
    />
  );
};
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
  refrenceLines?: { name: string; number: number; color: string }[];
  customXTick?: boolean;
  customYTick?: boolean;
  brushKey?: string;
  formatter?: Function;
  customBars?: (data) => ReactNode;
  onBarClick?: (data, index) => void;
};
export default function CustomBarChart({
  nameClassName = "",
  width,
  height = 500,
  data = [],
  bars = [],
  keys = [],
  refrenceLines = [],
  customXTick = false,
  customYTick = false,
  brushKey,
  formatter = (num: number) => "",
  customBars = undefined,
  onBarClick = (data, index) => {},
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
      <BarChart
        width={containerWidth ?? width}
        height={height}
        data={data.map((item) => {
          return {
            ...item,
            first: 75,
            second: 120,
          };
        })}
      >
        {refrenceLines &&
          refrenceLines.map((line) => {
            return (
              <>
                <ReferenceLine
                  y={line.number}
                  label={line.name}
                  stroke={line.color}
                  strokeDasharray="3 3"
                />
              </>
            );
          })}

        {bars.map((bar) => {
          return (
            <>
              <Bar
                dataKey={bar.name}
                className={bar.className}
                onClick={(data, index) => onBarClick(data, index)}
                shape={<RectangleBar />}
              >
                {customBars && customBars(data)}

                {bar.labelClassName && (
                  <LabelList
                    style={{ pointerEvents: "none" }}
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
                scale="auto"
                //  padding={{ left: bars.length * 35, right: bars.length * 35 }}
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
          width={80}
          tickFormatter={(value, index) => formatter(value)}
          orientation="right"
          tick={
            customYTick ? <CustomizedYAxisTick formatter={formatter} /> : null
          }
        />

        <Legend content={<CustomLegend bars={bars} />} />
        <Tooltip
          content={<CustomTooltip bars={bars} />}
          labelFormatter={(value, index) => formatter(value)}
        />
        {brushKey && <Brush dataKey={brushKey} height={30} />}
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

function CustomizedXAxisTick({
  className = "",
  customXTick = false,
  onClick = (payload) => {},
  ...rest
}) {
  const { x, y, payload } = rest;

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onClick(payload.value)}
    >
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

function CustomizedYAxisTick({ formatter, ...rest }) {
  const { x, y, payload } = rest;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={0}
        className="fill-primary text-sm"
        textAnchor="end"
      >
        {formatter ? formatter(payload.value) : payload.value}
      </text>
    </g>
  );
}
