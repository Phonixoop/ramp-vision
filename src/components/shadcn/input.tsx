import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border-secnbg-secbuttn shadow-xs flex h-9 w-full min-w-0 rounded-md border bg-secbuttn/30 px-3  py-1 text-base outline-none transition-[color,box-shadow] selection:bg-primary selection:text-accent file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary placeholder:text-primary/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:border-primbuttn  aria-invalid:ring-primbuttn/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
