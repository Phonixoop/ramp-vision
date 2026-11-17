"use client";
import { Column } from "@tanstack/react-table";
import { SelectControlled } from "~/features/checkbox-list";
import { getPersianToEnglishCity } from "~/utils/util";
import { DepoData } from "../../types";
import { CityLevelTabs } from "~/features/city-level-tab";
import { TableFilterSkeleton } from "~/app/dashboard/personnels/components";
import { memo, useCallback, useEffect, useMemo } from "react";

interface CityNameFilterProps {
  column: Column<DepoData, string | number | null>;
  depo: any;
  /** Permission-scoped fallback while the table query is still loading. */
  fallbackCityNames?: string[];
  setDataFilters: (filters: any) => void;
}
const same = (a?: string[], b?: string[]) =>
  a === b ||
  (Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((x, i) => x === b[i]));

function uniqueSorted(values: Iterable<unknown>) {
  return Array.from(
    new Set(
      Array.from(values)
        .map((v) => (v == null ? "" : String(v).trim()))
        .filter(Boolean),
    ),
  ).toSorted();
}

export const CityNameFilter = memo(function CityNameFilter({
  column,
  depo,
  fallbackCityNames = [],
  setDataFilters,
}: CityNameFilterProps) {
  const get = column.getFilterValue as () => string[] | undefined;
  const set = column.setFilterValue;

  // Prefer cities present in the loaded table (and respect other column filters).
  const cityNames = useMemo(() => {
    const faceted = uniqueSorted(column.getFacetedUniqueValues().keys());
    if (faceted.length > 0) return faceted;

    const fromTable = uniqueSorted(
      (depo?.data?.result ?? []).map((row: DepoData) => row.CityName),
    );
    if (fromTable.length > 0) return fromTable;

    return uniqueSorted(fallbackCityNames);
  }, [
    column.getFacetedUniqueValues(),
    depo?.data?.result,
    fallbackCityNames,
  ]);

  const isLoading = Boolean(depo?.isLoading) && cityNames.length === 0;

  const applyColumn = useCallback(
    (vals: string[]) => {
      const next = vals.filter(Boolean);
      const current = get() ?? [];
      if (!same(current, next)) set(next);
    },
    [get, set],
  );

  // Drop selections that are no longer in the table for the current period/filters.
  useEffect(() => {
    if (isLoading || cityNames.length === 0) return;
    const current = get() ?? [];
    if (current.length === 0) return;
    const next = current.filter((city) => cityNames.includes(city));
    if (!same(current, next)) {
      applyColumn(next);
      setDataFilters((prev: any) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: next.map(getPersianToEnglishCity),
        },
      }));
    }
  }, [cityNames, isLoading, get, applyColumn, setDataFilters]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">استان</span>

      {isLoading ? (
        <TableFilterSkeleton />
      ) : (
        <>
          <CityLevelTabs
            initialCities={cityNames}
            column={column}
            onChange={(data) => {
              applyColumn(data.values);
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
            list={cityNames}
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
