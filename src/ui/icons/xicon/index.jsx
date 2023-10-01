import React from "react";

export default function XIcon({
  className = "h-6 w-6 stroke-primary  scale-90",
}) {
  return (
    <svg className={className} stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      ></path>
    </svg>
  );
}
