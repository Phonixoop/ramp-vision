import React from "react";
import { LogoRamp } from "./LogoRamp";

export function HeaderBrand() {
  return (
    <div className="flex items-center justify-center gap-4">
      <LogoRamp />
      <span className="text-lg font-bold text-primary underline underline-offset-4">
        RAMP
      </span>
    </div>
  );
}
