import React from "react";
import { twMerge } from "tailwind-merge";

export default function ToolTip({ children, className = "" }) {
  return (
    <span
      className={twMerge(
        `absolute 
        left-1/2 
        top-0 w-full 
        -translate-x-1/2 rounded-lg
        border border-primary/40 
        bg-secondary/80 p-2 text-center
        opacity-0 
        backdrop-blur-md
        duration-150 group-hover:-top-5 
        group-hover:opacity-100 `,
        className
      )}
    >
      {children}
    </span>
  );
}
