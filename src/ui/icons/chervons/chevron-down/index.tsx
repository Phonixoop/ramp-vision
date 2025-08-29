"use client";

interface ChevronDownIconProps {
  className?: string;
  strokeWidth?: string;
  strokeColor?: string;
  fill?: string;
}

export default function ChevronDownIcon({
  className = "w-4 h-4",
  strokeWidth = "stroke-2",
  strokeColor = "stroke-gray-900",
  fill = "fill-none",
}: ChevronDownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${strokeWidth} ${strokeColor} ${fill}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
