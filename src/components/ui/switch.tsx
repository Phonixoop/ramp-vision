"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "~/lib/utils";
import { CheckIcon, Minus, XIcon } from "lucide-react";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    middle?: boolean;
  }
>(({ className, middle = false, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      `focus-visible:ring-ring
      focus-visible:ring-offset-primary
       peer 
       relative inline-flex h-[20px]
        w-[36px] shrink-0 cursor-pointer 
        items-center rounded-full
        border-2 border-transparent 
        shadow-sm transition-colors 
        data-[state=checked]:bg-primbuttn/50 
        data-[state=unchecked]:bg-secbuttn 
        focus-visible:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-offset-2
         disabled:cursor-not-allowed 
         disabled:opacity-50`,
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        `
        pointer-events-none
        relative
        block h-4 w-4
         rounded-full 
         shadow-lg ring-0 
         transition-transform 
       
          data-[state=checked]:bg-primbuttn 
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
      <Minus
        className={cn(
          `absolute left-1/2 top-1/2 w-4 -translate-x-1/2 -translate-y-1/2`,
        )}
      />
    )}

    <CheckIcon
      className={cn(
        `absolute right-0  top-1/2 h-3 w-3 -translate-x-[2px] -translate-y-1/2 transition-all duration-500`,
        props.checked && !middle
          ? ""
          : "right-0 top-1/2 h-3 w-3 -translate-x-[18px] -translate-y-1/2 scale-0",
      )}
    />

    <XIcon
      className={cn(
        `absolute right-0 top-1/2 h-3 w-3 -translate-x-[18px] -translate-y-1/2  transition-all  duration-500`,
        !props.checked && !middle
          ? ""
          : "right-0 top-1/2 h-3 w-3 -translate-x-[2px] -translate-y-1/2 scale-0",
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
