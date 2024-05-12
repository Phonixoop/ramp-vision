import React from "react";
import { twMerge } from "tailwind-merge";

export default function H2({ children, className = "", ...rest }) {
  return (
    <h2 {...rest} className={twMerge("text-primary", className)}>
      {children}
    </h2>
  );
}
