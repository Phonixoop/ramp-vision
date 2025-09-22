"use client";
import React, { memo, useCallback, useState } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectControlled } from "~/features/checkbox-list";
import { getPersianToEnglishCity } from "~/utils/util";
import { TableFilterSkeleton } from "../TableFilterSkeleton";
import { CityLevelTabs } from "~/features/city-level-tab";

const same = (a?: string[], b?: string[]) =>
  a === b ||
  (Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((x, i) => x === b[i]));

export const CityNameFilterPersonnel = memo(function CityNameFilter({
  column,
  cityNames,
}: {
  column: Column<any, unknown>;
  cityNames: string[];
}) {
  const isCityNamesLoading = !cityNames;

  // Local state for filter values since we don't have a real column

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
    <div className="flex w-full max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">استان</span>

      {isCityNamesLoading ? (
        <TableFilterSkeleton />
      ) : (
        <>
          <CityLevelTabs
            initialCities={cityNames ?? []}
            column={column}
            onChange={(data) => {
              applyColumn(data.values);
            }}
          />

          <SelectControlled
            withSelectAll
            list={cityNames}
            value={get() ?? []}
            onChange={(values) => {
              applyColumn(values);
            }}
          />
        </>
      )}
    </div>
  );
});
