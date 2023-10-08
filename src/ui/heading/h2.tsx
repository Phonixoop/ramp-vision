import React from "react";
import { twMerge } from "tailwind-merge";

export default function H2({ className = "", children }) {
  return <h2 className={twMerge("text-primary", className)}>{children}</h2>;
}
