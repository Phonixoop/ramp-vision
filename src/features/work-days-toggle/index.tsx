"use client";

import { ListRestartIcon } from "lucide-react";
import React from "react";
import { Switch } from "~/components/shadcn/switch";
import { cn } from "~/lib/utils";

interface WorkDaysToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  totalWorkDays: number | null;
  className?: string;
}

function WorkDaysToggle({
  isEnabled,
  onToggle,
  totalWorkDays,
  className,
}: WorkDaysToggleProps) {
  return (
    <div dir="rtl" className={cn("flex  items-center gap-3", className)}>
      <span className="text-sm text-primary">محاسبه بر اساس روزهای کاری</span>

      <button
        onClick={() => onToggle(!isEnabled)}
        type="button"
        disabled={!totalWorkDays}
        className={cn(
          "relative h-6 w-11 items-center rounded-full transition-colors",
          isEnabled ? "bg-accent" : "bg-primary/20",
          !totalWorkDays && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-primary transition-transform",
            isEnabled ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>

      {totalWorkDays && (
        <span dir="rtl" className="text-xs text-primary/70">
          ({totalWorkDays} روز)
        </span>
      )}

      {!totalWorkDays && (
        <span className="text-xs text-primary/50">(فقط برای فیلتر ماهانه)</span>
      )}
    </div>
  );
}

export default WorkDaysToggle;
