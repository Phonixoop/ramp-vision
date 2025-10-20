"use client";

import React from "react";
import { cn } from "~/lib/utils";

export default function ToolTipSimple({
  children,
  tooltip = <></>,
  className = "",
  childClassName = "",
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        className={childClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={cn(
            "text-primary-foreground pointer-events-none fixed z-50 rounded-md bg-primary px-3 py-1.5 text-xs shadow-lg",
            className,
          )}
          style={{
            left: position.x,
            top: position.y,
            transform: "translateX(-50%) translateY(-100%)",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
