"use client";

interface ChevronLeftIconProps {
  className?: string;
}

export default function ChevronLeftIcon({
  className = "w-4 h-4 fill-none stroke-gray-900 stroke-2 ",
}: ChevronLeftIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  );
}
