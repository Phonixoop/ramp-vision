"use client";
import { Column } from "@tanstack/react-table";
import { SelectControlled } from "~/features/checkbox-list";
import { getPersianToEnglishCity } from "~/utils/util";
import { CityLevelTabs } from "~/features/city-level-tab";
import { TableFilterSkeleton } from "~/app/dashboard/personnels/components";
import { memo, useCallback } from "react";

interface CityNameFilterProps {
  column: Column<any, string | number | null>;
  cityNames: string[];
  setDataFilters: (filters: any) => void;
}
const same = (a?: string[], b?: string[]) =>
  a === b ||
  (Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((x, i) => x === b[i]));

export const CityNameFilter = memo(function CityNameFilter({
  column,
  cityNames,
  setDataFilters,
}: CityNameFilterProps) {
  const isCityNamesLoading = !cityNames;
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
          <CityLevelTabs
            initialCities={cityNames ?? []}
            column={column}
            onChange={(data) => {
              // 1) instant table filter
              applyColumn(data.values);
              // 2) keep server-side mirror in sync
              setDataFilters((prev: any) => ({
                ...prev,
                filter: {
                  ...prev.filter,
                  CityName: data.values.map(getPersianToEnglishCity),
                },
              }));
            }}
          />

          <SelectControlled
            withSelectAll
            list={cityNames ?? []}
            value={(column.getFilterValue() as string[]) ?? []}
            onChange={(selectedValues) => {
              column.setFilterValue(selectedValues);
              setDataFilters((prev: any) => ({
                ...prev,
                filter: {
                  ...prev.filter,
                  CityName: selectedValues.map(getPersianToEnglishCity),
                },
              }));
            }}
          />
        </>
      )}
    </div>
  );
});
