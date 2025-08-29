"use client";

interface SearchIconProps {
  className?: string;
  stroke?: string;
}

export default function SearchIcon({
  className = "w-4 h-4 fill-atysa-900",
  stroke = "stroke-atysa-main fill-none",
}: SearchIconProps) {
  //#A6AAAD
  return (
    <svg className={className} viewBox="0 0 17 17">
      <path
        className="fill-atysa-900"
        d="M11 12.0607L12.0607 11L15.5027 14.442C15.7956 14.7349 15.7956 15.2098 15.5027 15.5027V15.5027C15.2098 15.7956 14.7349 15.7956 14.442 15.5027L11 12.0607Z"
      />
      <circle cx="7" cy="7" r="6.25" className={stroke} strokeWidth="1.5" />
    </svg>
  );
}
