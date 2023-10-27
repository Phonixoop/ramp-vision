import React from "react";

type BarData = {
  name: string;
  value: number;
};

type BarListProps = {
  data: BarData[];
};
export default function MyBarList({ data }: BarListProps) {
  const maxNumber = Math.max(...data.map((bar) => bar.value));

  return (
    <div className="flex flex-col items-center justify-start  p-2 xl:p-0">
      {data.map((bar, index) => (
        <div
          key={index}
          className="relative flex w-full items-center justify-between  p-4 text-primary"
        >
          <h2 className="z-10 text-lg font-bold">{bar.name}</h2>

          <div
            className="absolute right-0 top-1/2 z-0 flex h-12 -translate-y-1/2 transform-gpu justify-end rounded-md bg-primbuttn  mix-blend-color-dodge transition-all duration-1000"
            style={{ width: `${(bar.value / maxNumber) * 100}%` }}
          ></div>
          <span className="z-10">{bar.value}</span>
        </div>
      ))}
    </div>
  );
}
