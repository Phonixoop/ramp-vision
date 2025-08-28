"use client";

import React, { useState } from "react";
import SimplifiedPersianCalendarPicker from "./simplified";

export function PersianCalendarExample() {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );

  const handleSelectionChange = (selection: {
    dates: string[];
    periodType: "daily" | "weekly" | "monthly";
  }) => {
    console.log("Selection changed:", selection);
    setSelectedDates(selection.dates);
    setPeriodType(selection.periodType);
  };

  return (
    <div className="max-w-  lg space-y-6 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">
          Persian Calendar Picker Example
        </h2>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary">
            Current Selection:
          </h3>
          <div className="rounded-lg bg-secbuttn p-4">
            <p className="text-sm text-primary">
              <strong>Period Type:</strong> {periodType}
            </p>
            <p className="text-sm text-primary">
              <strong>Selected Dates:</strong>{" "}
              {selectedDates.length > 0 ? selectedDates.join(", ") : "None"}
            </p>
            <p className="text-sm text-primary">
              <strong>Count:</strong> {selectedDates.length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary">
            Period Type Controls:
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodType("daily")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                periodType === "daily"
                  ? "bg-accent text-secondary"
                  : "bg-secbuttn text-primary hover:bg-accent/20"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriodType("weekly")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                periodType === "weekly"
                  ? "bg-accent text-secondary"
                  : "bg-secbuttn text-primary hover:bg-accent/20"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriodType("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                periodType === "monthly"
                  ? "bg-accent text-secondary"
                  : "bg-secbuttn text-primary hover:bg-accent/20"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <SimplifiedPersianCalendarPicker
        onSelectionChange={handleSelectionChange}
        selectedDates={selectedDates}
        periodType={periodType}
        allowMultiSelection={true}
        className="max-w-md"
      />
    </div>
  );
}

export default PersianCalendarExample;
