"use client";
import { Column } from "@tanstack/react-table";
import { SelectControlled } from "~/features/checkbox-list";
import { getPersianToEnglishCity } from "~/utils/util";
import { DepoData } from "../../types";

interface CityNameFilterProps {
  column: Column<DepoData, string | number | null>;
  initialFilters: any;
  setDataFilters: (filters: any) => void;
}

export function CityNameFilter({
  column,
  initialFilters,
  setDataFilters,
}: CityNameFilterProps) {
  const cityList =
    initialFilters?.data?.Cities?.map((a: any) => a.CityName) ?? [];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">استان</span>
      {initialFilters?.data?.Cities ? (
        <SelectControlled
          withSelectAll
          list={cityList}
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
      ) : (
        <div className="h-8 w-full animate-pulse rounded-md bg-secbuttn"></div>
      )}
    </div>
  );
}
