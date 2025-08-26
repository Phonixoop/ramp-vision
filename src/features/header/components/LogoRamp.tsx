import { twMerge } from "tailwind-merge";

interface LogoRampProps {
  className?: string;
}

export function LogoRamp({ className = "" }: LogoRampProps) {
  return (
    <svg
      width="108"
      height="108"
      viewBox="0 0 108 108"
      fill="none"
      className={twMerge("h-auto w-7 fill-primary", className)}
    >
      <path d="M95.5 1H2L14 15H95V93L107.5 105.5V13C107.5 6.37258 102.127 1 95.5 1Z" />
      <path d="M16 20L30 33.5H15.5V93.5H74V77L88 90.5V95C88 101.627 82.6274 107 76 107H18C9.16344 107 2 99.8366 2 91V34C2 26.268 8.26801 20 16 20Z" />
    </svg>
  );
}
