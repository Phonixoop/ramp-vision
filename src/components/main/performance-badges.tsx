import React from "react";
import { performanceLevels } from "~/constants/personnel-performance";

const PerformanceBadges: React.FC = () => {
  return (
    <div dir="rtl" className="flex flex-wrap justify-center gap-2 py-2">
      {performanceLevels.map((level, index) => (
        <span
          key={index}
          className="rounded-full px-2 py-1"
          style={{
            backgroundColor: level.color,
            color: "#FFFFFF",
            border: "none",
          }}
        >
          {level.text}
        </span>
      ))}
    </div>
  );
};

export default PerformanceBadges;
