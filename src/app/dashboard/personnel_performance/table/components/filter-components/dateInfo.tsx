"use client";
import React, { memo } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectColumnFilterOptimized } from "~/features/checkbox-list";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import { sortDates } from "~/lib/utils";

export const DateInfoFilter = memo(function DateInfoFilter({
  column,
  initialFilters,
  filters,
  personnelPerformance,
  setDataFilters,
}: {
  column: Column<any, unknown>;
  initialFilters: any;
  filters: any;
  personnelPerformance: any;
  setDataFilters: (f: any) => void;
}) {
  if (!initialFilters?.DateInfos) return null;

  const _DateInfos: string[] = initialFilters.DateInfos.map(
    (a: any) => a.DateInfo,
  );
  const DateInfos = sortDates({ dates: _DateInfos });

  if (DateInfos.length <= 0) return null;

  const initialDateInfo: string[] =
    filters?.filter?.DateInfo ??
    (DateInfos.length > 0 ? [DateInfos.at(-1)!] : []);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">تاریخ گزارش پرسنل</span>
      <SelectColumnFilterOptimized<Pick<PersonnelPerformanceData, "DateInfo">>
        singleSelect
        column={column}
        initialFilters={initialDateInfo}
        values={(DateInfos ?? []).map((a: string) => ({
          DateInfo: a,
        }))}
        onChange={(filter) => {
          setDataFilters((prev: any) => ({
            ...prev,
            filter: {
              ...prev.filter,
              [filter.id]: filter.values.filter((a: string) => a),
            },
          }));
        }}
      />
    </div>
  );
});
