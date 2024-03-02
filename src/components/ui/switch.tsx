"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "~/lib/utils";
import { CheckIcon, MinusIcon, XIcon } from "lucide-react";

export function Switch({
  className = "",
  middle = false,
  checked = false,
  IconLeft = XIcon,
  IconRight = CheckIcon,
  ...props
}) {
  return (
    <div
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        `peer
        relative
        inline-flex
    h-[20px]
     w-[36px] 
     shrink-0 cursor-pointer items-center
      rounded-full border-2 border-transparent 
      shadow-xl
      ring-primary transition-colors 
      data-[state=checked]:bg-secbuttn
      data-[state=unchecked]:bg-secbuttn 
      focus-visible:outline-none 
      focus-visible:ring-2 
      focus-visible:ring-accent 
      focus-visible:ring-offset-2 
      focus-visible:ring-offset-primary
       disabled:cursor-not-allowed 
       disabled:opacity-50`,
        className,
      )}
      {...props}
    >
      <div
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          `
      pointer-events-none
      relative
      block h-4 w-4
       rounded-full 
        shadow-lg 
       ring-0 
          
       transition-transform
        data-[state=checked]:bg-primary/20 
        data-[state=unchecked]:bg-primary/20`,
          middle
            ? `w-6 translate-x-1 
        
        data-[state=checked]:bg-primbuttn/50 
        data-[state=unchecked]:bg-primary/5
        `
            : `  
      data-[state=checked]:translate-x-4
      data-[state=unchecked]:translate-x-0 
      `,
        )}
      />
      {middle && (
        <MinusIcon
          className={cn(
            `absolute left-1/2  top-1/2 w-4 -translate-x-1/2 -translate-y-1/2 stroke-accent`,
          )}
        />
      )}

      <IconRight
        className={cn(
          `absolute right-0 top-1/2  h-3 w-3 -translate-x-[2px] -translate-y-1/2 stroke-primary transition-all duration-500`,
          checked && !middle
            ? ""
            : "right-0 top-1/2 h-3 w-3 -translate-x-[18px] -translate-y-1/2 -rotate-180 scale-0",
        )}
      />

      <IconLeft
        className={cn(
          `absolute right-0 top-1/2 h-3 w-3 -translate-x-[18px] -translate-y-1/2 stroke-primary  transition-all  duration-500`,
          !checked && !middle
            ? ""
            : "right-0 top-1/2 h-3 w-3 -translate-x-[2px] -translate-y-1/2 -rotate-180 scale-0",
        )}
      />
    </div>
  );
}
