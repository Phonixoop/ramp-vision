import React from "react";

export default function BarChart3Loading() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className=""
    >
      <path
        d="M18 17V9"
        className="animate-path animate-[move_100s_linear_infinite]"
      />
      <path
        d="M13 17V5"
        className="animate-path animate-[move_100s_linear_infinite]"
      />
      <path
        d="M8 17v-3"
        className="animate-path animate-[move_100s_linear_infinite]"
      />
    </svg>
  );
}
