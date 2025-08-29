"use client";

interface ChevronRightIconProps {
  className?: string;
}

export default function ChevronRightIcon({
  className = "w-4 h-4 fill-none stroke-gray-900 stroke-2 ",
}: ChevronRightIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
