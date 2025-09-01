"use client";
import React, { memo, useCallback } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectControlled } from "~/features/checkbox-list";
import { getPersianToEnglishCity } from "~/utils/util";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { CityLevelTabs } from "~/app/dashboard/personnel_performance/table/components/CityLevelTabs";
import { toast } from "sonner";

const same = (a?: string[], b?: string[]) =>
  a === b ||
  (Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((x, i) => x === b[i]));

export const CityNameFilter = memo(function CityNameFilter({
  column,
  initialFilters,
  reportPeriod,
  setDataFilters,
}: {
  column: Column<any, unknown>;
  initialFilters: any;
  reportPeriod: string;
  setDataFilters: (f: any) => void;
}) {
  const isCityNamesLoading = !initialFilters?.CityNames;
  const get = column.getFilterValue as () => string[] | undefined;
  const set = column.setFilterValue;

  const applyColumn = useCallback(
    (vals: string[]) => {
      const next = vals.filter(Boolean);
      const current = get() ?? [];
      if (!same(current, next)) set(next);
    },
    [get, set],
  );

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">استان</span>

      {isCityNamesLoading ? (
        <TableFilterSkeleton />
      ) : (
        <>
          {/* tabs only when NOT monthly */}
          {reportPeriod !== "ماهانه" && (
            <CityLevelTabs
              initialCities={initialFilters?.CityNames ?? []}
              column={column}
              onChange={(data) => {
                // 1) instant table filter
                applyColumn(data.values);
                // 2) keep server-side mirror in sync (no heavy fetch needed for روزانه/هفتگی)
                setDataFilters((prev: any) => ({
                  ...prev,
                  filter: {
                    ...prev.filter,
                    CityName: data.values.map(getPersianToEnglishCity),
                    Start_Date: prev.filter?.Start_Date ?? [],
                  },
                }));
              }}
            />
          )}

          <SelectControlled
            singleSelect={reportPeriod === "ماهانه"}
            withSelectAll
            list={initialFilters?.CityNames}
            // pass a STABLE array (see section C)
            value={get() ?? []}
            onChange={(values) => {
              if (reportPeriod === "ماهانه") {
                if (values.length <= 0) {
                  toast("لطفا یک شهر انتخاب کنید");
                  return;
                }
                const single = values.slice(0, 1);
                // 👉 server-driven path: do NOT also keep a large client filter running
                //  applyColumn(single); // you can also skip this line if you prefer purely server-filter in monthly
                setDataFilters((prev: any) => ({
                  ...prev,
                  filter: {
                    ...prev.filter,
                    CityName: single.map(getPersianToEnglishCity),
                    Start_Date: prev.filter?.Start_Date ?? [],
                  },
                }));
              } else {
                // client-driven path
                setDataFilters((prev: any) => ({
                  ...prev,
                  filter: {
                    ...prev.filter,
                    CityName: values.map(getPersianToEnglishCity),
                    Start_Date: prev.filter?.Start_Date ?? [],
                  },
                }));
                applyColumn(values);
              }
            }}
          />
        </>
      )}
    </div>
  );
});
