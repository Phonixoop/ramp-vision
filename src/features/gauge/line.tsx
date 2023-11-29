import React from "react";
import { twMerge } from "tailwind-merge";

const subs = [
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
      text: "نیاز به بررسی",
    },
  },
];
export default function LineGauge({ value }) {
  const { color, tooltip } =
    subs.find((sub) => value <= sub.limit) || subs[subs.length - 1];

  return (
    <>
      <div className="relative flex h-4 w-full items-center justify-center">
        {subs.map((sub, index) => (
          <div
            key={index}
            className={twMerge(
              "group relative h-full w-full ",
              index === 0
                ? "rounded-r-lg"
                : index === subs.length - 1
                ? "rounded-l-lg"
                : "",
            )}
            style={{
              backgroundColor: sub.color,
              width: `${(sub.limit / subs[subs.length - 1].limit) * 100}%`,
            }}
          >
            <span
              className="absolute left-1/2 m-4 mx-auto w-full -translate-x-1/2 translate-y-full rounded-md bg-secondary p-2 text-center 
    text-sm text-gray-100 opacity-0 transition-opacity group-hover:opacity-100"
            >
              {sub.tooltip.text}
            </span>
            <span className="absolute -left-5 -top-5 z-10 w-10 text-sm">
              {sub.limit}
            </span>
          </div>
        ))}
      </div>
      <div className="relative flex h-4 w-full items-center justify-center">
        {subs.map((sub, index) => (
          <div
            key={index}
            className={twMerge(
              "group relative h-full w-full ",
              index === 0
                ? "rounded-r-lg"
                : index === subs.length - 1
                ? "rounded-l-lg"
                : "",
            )}
            style={{
              backgroundColor: sub.color,
              width: `${(sub.limit / subs[subs.length - 1].limit) * 100}%`,
            }}
          >
            <span
              className="absolute left-1/2 m-4 mx-auto w-full -translate-x-1/2 translate-y-full rounded-md bg-secondary p-2 text-center 
    text-sm text-gray-100 opacity-0 transition-opacity group-hover:opacity-100"
            >
              {sub.tooltip.text}
            </span>
          </div>
        ))}
        <div
          className="absolute top-1/2 z-0 h-12 w-1 -translate-y-1/2 rounded-full bg-black"
          style={{ right: `${(value / subs[subs.length - 1].limit) * 100}%` }}
        />
      </div>
    </>
  );
}
