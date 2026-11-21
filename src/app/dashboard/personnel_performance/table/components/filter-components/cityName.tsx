"use client";
import React, { memo, useCallback, useMemo, useState } from "react";
import type { Column } from "@tanstack/react-table";

import { SelectControlled } from "~/features/checkbox-list";
import { getEnglishToPersianCity } from "~/utils/util";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { CityLevelTabs } from "~/features/city-level-tab";
import { toast } from "sonner";
import { TEHRAN_SUB_CITIES } from "~/constants";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import {
  TEHRAN_SUB_CITY_LABELS,
  collapseCitiesForFilterList,
  expandCityFilterSelection,
  type TehranSubCity,
} from "~/utils/personnel-performance";

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

  const [tehranSubCities, setTehranSubCities] = useState<TehranSubCity[]>([]);

  const rawCityNames: string[] = initialFilters?.CityNames ?? [];
  const collapsedCityList = useMemo(
    () => collapseCitiesForFilterList(rawCityNames),
    [rawCityNames],
  );

  const displayValue = collapseCitiesForFilterList(get() ?? []);

  const isTehranSelected = displayValue.includes(
    getEnglishToPersianCity("Tehran"),
  );

  const applyFilters = useCallback(
    (displayCities: string[], subCities: TehranSubCity[]) => {
      const englishCities = expandCityFilterSelection(displayCities, subCities);
      const persianCities = englishCities.map(getEnglishToPersianCity);

      const current = get() ?? [];
      if (!same(current, persianCities)) set(persianCities);

      setDataFilters((prev: any) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: englishCities,
          Start_Date: prev.filter?.Start_Date ?? [],
        },
      }));
    },
    [get, set, setDataFilters],
  );

  const onTehranSubCityChange = useCallback(
    (city: TehranSubCity) => {
      setTehranSubCities((prev) => {
        const next = prev.includes(city)
          ? prev.filter((c) => c !== city)
          : [...prev, city];
        applyFilters(displayValue, next);
        return next;
      });
    },
    [applyFilters, displayValue],
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
              initialCities={rawCityNames}
              column={column}
              onChange={(data) => {
                const collapsed = collapseCitiesForFilterList(data.values);
                setTehranSubCities([]);
                applyFilters(collapsed, []);
              }}
            />
          )}

          <SelectControlled
            singleSelect={reportPeriod === "ماهانه"}
            withSelectAll
            list={collapsedCityList}
            value={displayValue}
            onChange={(values) => {
              if (reportPeriod === "ماهانه") {
                if (values.length <= 0) {
                  toast("لطفا یک شهر انتخاب کنید");
                  return;
                }
                const single = values.slice(0, 1);
                const tehranSelected = single.includes(
                  getEnglishToPersianCity("Tehran"),
                );
                const nextSubs = tehranSelected ? tehranSubCities : [];
                if (!tehranSelected) setTehranSubCities([]);
                applyFilters(single, nextSubs);
              } else {
                const tehranSelected = values.includes(
                  getEnglishToPersianCity("Tehran"),
                );
                const nextSubs = tehranSelected ? tehranSubCities : [];
                if (!tehranSelected) setTehranSubCities([]);
                applyFilters(values, nextSubs);
              }
            }}
          />

          {isTehranSelected && (
            <div
              dir="rtl"
              className="flex w-full flex-col items-center gap-2 pt-1"
            >
              <span className="text-xs text-primary/70">زیرمجموعه تهران</span>
              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                {TEHRAN_SUB_CITIES.map((city) => {
                  const isSelected = tehranSubCities.includes(city);
                  return (
                    <Button
                      key={city}
                      onClick={() => onTehranSubCityChange(city)}
                      className={cn(
                        "rounded-full border border-primary px-3 py-1 text-sm",
                        isSelected
                          ? "bg-primary text-secondary"
                          : "bg-transparent text-primary",
                      )}
                    >
                      {TEHRAN_SUB_CITY_LABELS[city]}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});
