"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "~/lib/utils";

/**
 * Accessible on/off switch built on Radix.
 * Prefer this for interactive toggles; the legacy `Switch` is a visual indicator.
 */
export const SwitchControl = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(function SwitchControl({ className, ...props }, ref) {
  return (
    <SwitchPrimitives.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        "data-[state=checked]:bg-accent data-[state=unchecked]:bg-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-third",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {/*
        Direction-aware thumb travel.

        `translate-x-4` is a *physical* offset: under `dir="rtl"` it moves the
        thumb left, i.e. out of the `w-9` track (and `-translate-x-4` would be
        needed). A logical offset has no such failure mode — `margin-inline-start`
        resolves against the thumb's computed direction, so it pushes toward the
        track's inline end in both LTR and RTL.

        The distance is exact: track `w-9` (36px) minus `border-2` on both sides
        leaves a 32px content box; the `size-4` (16px) thumb can therefore travel
        32 - 16 = 16px = `ms-4`, keeping it flush inside the rounded track.
        `transition-[margin-inline-start]` keeps the slide smooth both ways.
      */}
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-primary shadow-sm ring-0",
          "transition-[margin-inline-start] duration-200 ease-out",
          "data-[state=checked]:ms-4 data-[state=unchecked]:ms-0",
        )}
      />
    </SwitchPrimitives.Root>
  );
});
