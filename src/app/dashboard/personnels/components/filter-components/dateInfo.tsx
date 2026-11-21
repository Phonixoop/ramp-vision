"use client";

import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { sortDates } from "~/lib/utils";
import { PersonnelsData } from "../../types";

export const DateInfoFilterPersonnel = memo(function DateInfoFilterPersonnel({
  column,
  dateInfos,
  filters,
  setFilters,
}: {
  column: Column<any, unknown>;
  dateInfos: string[];
  filters: any;
  setFilters: (f: any) => void;
}) {
  const DateInfos = sortDates({ dates: dateInfos }).filter(
    (date) => date && date !== "Invalid date",
  );

  if (DateInfos.length <= 0) return null;

  const initialDateInfo: string[] =
    filters?.filter?.DateInfo?.length > 0
      ? filters.filter.DateInfo
      : [DateInfos.at(-1)!];

  return (
    <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">تاریخ گزارش پرسنل</span>
      <SelectColumnFilterOptimized<Pick<PersonnelsData, "DateInfo">>
        singleSelect
        column={column}
        initialFilters={initialDateInfo}
        values={DateInfos.map((date) => ({ DateInfo: date }))}
        onChange={(filter) => {
          const next = filter.values.filter((value: string) => value);
          if (!next.length) return;
          setFilters((prev: any) => ({
            ...prev,
            filter: {
              ...prev.filter,
              DateInfo: next,
            },
          }));
        }}
      />
    </div>
  );
});
