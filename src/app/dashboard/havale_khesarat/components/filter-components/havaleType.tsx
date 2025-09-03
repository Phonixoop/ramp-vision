"use client";
import { SelectControlled } from "~/features/checkbox-list";

interface HavaleTypeFilterProps {
  setDataFilters: (filters: any) => void;
  data: any[];
  currentValue: string[];
}

export function HavaleTypeFilter({
  setDataFilters,
  data,
  currentValue,
}: HavaleTypeFilterProps) {
  const havaleTypeList = Array.from(
    new Set(data?.map((item) => item.HavaleType) ?? []),
  ).filter(Boolean) as string[];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع حواله</span>
      {data && data.length > 0 ? (
        <SelectControlled
          withSelectAll
          list={havaleTypeList}
          value={currentValue}
          onChange={(selectedValues) => {
            setDataFilters((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                HavaleType: selectedValues,
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
