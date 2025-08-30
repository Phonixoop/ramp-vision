"use client";

import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useState } from "react";
import { analyzePerformanceTrend } from "~/utils/util";

export function TrendDecider({ values }: { values: number[] }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (text: string, event: React.MouseEvent) => {
    setTooltipText(text);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const trend = analyzePerformanceTrend(values);

  if (trend === "Up")
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={(e) => handleMouseEnter("روند رو به رشد", e)}
          onMouseLeave={handleMouseLeave}
          className="cursor-help"
        >
          <TrendingUpIcon className="h-5 w-5 stroke-emerald-700" />
        </div>
        {showTooltip && tooltipText === "روند رو به رشد" && (
          <div
            className="absolute z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-secondary shadow-lg"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 30,
              transform: "translateX(-50%)",
            }}
          >
            {tooltipText}
          </div>
        )}
      </div>
    );

  if (trend === "Stable")
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={(e) => handleMouseEnter("روند پایدار", e)}
          onMouseLeave={handleMouseLeave}
          className="cursor-help"
        >
          <MinusIcon className="h-5 w-5 stroke-amber-700" />
        </div>
        {showTooltip && tooltipText === "روند پایدار" && (
          <div
            className="absolute z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-secondary shadow-lg"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 30,
              transform: "translateX(-50%)",
            }}
          >
            {tooltipText}
          </div>
        )}
      </div>
    );

  if (trend === "Down")
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={(e) => handleMouseEnter("روند رو به پایین", e)}
          onMouseLeave={handleMouseLeave}
          className="cursor-help"
        >
          <TrendingDownIcon className="h-5 w-5 stroke-rose-700" />
        </div>
        {showTooltip && tooltipText === "روند رو به پایین" && (
          <div
            className="absolute z-50 rounded-md bg-primary px-3 py-1.5 text-xs text-secondary shadow-lg"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 30,
              transform: "translateX(-50%)",
            }}
          >
            {tooltipText}
          </div>
        )}
      </div>
    );
}
