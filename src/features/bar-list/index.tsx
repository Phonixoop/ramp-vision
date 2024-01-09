import React from "react";
import { twMerge } from "tailwind-merge";

type BarData = {
  name: string;
  value: number;
};

type BarListProps = {
  data: BarData[];
};

function FloatDiv({ className }) {
  return <div className={twMerge("opacity-0", className)} />;
}
export default function MyBarList({ data }: BarListProps) {
  // const maxNumber = Math.max(...data.map((bar) => bar.value));
  const sumOfValues = data.reduce((total, item) => total + item.value, 0);

  return (
    <div className="relative flex flex-col items-center justify-start p-2 xl:p-0">
      {/* <div className="line_height_animation_100 absolute right-12 top-0 h-full w-[1px] rounded-full bg-primary" /> */}
      {data.length > 0 && (
        <FloatDiv
          className="line_height_animation_100 absolute 
        right-12 top-0 h-full w-[1px] bg-gradient-to-b  from-primary/20 from-0% via-primary via-50% to-primary/20 to-100%  "
        />
      )}
      {data.map((bar, index) => (
        <div
          key={index}
          className="relative flex w-full items-center justify-start gap-5  p-1 text-primary"
        >
          <FloatDiv className="line_width_animation_100 absolute right-[2.40rem] top-4  h-[1px] w-5 max-w-[1.25rem] bg-primary " />
          {/* <div className="absolute  right-10 top-3.5 h-0.5 w-5 bg-primary" /> */}
          <span className="z-10 w-11  text-start ">{bar.value}</span>
          <h2 className="z-10 text-lg font-bold">{bar.name}</h2>

          {/* <div
            className="absolute right-0 top-1/2 z-0 flex h-12 -translate-y-1/2 transform-gpu justify-end rounded-md bg-primbuttn  mix-blend-color-dodge transition-all duration-1000"
            style={{ width: `${(bar.value / maxNumber) * 100}%` }}
          /> */}
        </div>
      ))}
      {data.length > 0 && (
        <div className="relative flex w-full items-center justify-start gap-5  p-1 text-primary">
          <FloatDiv className="line_width_animation_100 absolute right-10 top-4  h-[1px] w-5 max-w-[1.25rem] rounded-full bg-primary  " />

          <span className="z-10 w-11 text-start  font-bold text-accent ">
            {sumOfValues}
          </span>
          <h2 className="z-10 text-lg  font-bold  text-accent">مجموع</h2>
        </div>
      )}
    </div>
  );
}
