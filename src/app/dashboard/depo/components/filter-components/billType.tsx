"use client";
import { Column } from "@tanstack/react-table";
import { SelectControlled } from "~/features/checkbox-list";
import { DepoData } from "../../types";

interface BillTypeFilterProps {
  column: Column<DepoData, string | number | null>;
  depo: any;
  setDataFilters: (filters: any) => void;
}

export function BillTypeFilter({
  column,
  depo,
  setDataFilters,
}: BillTypeFilterProps) {
  const billTypeList = Array.from(
    new Set(depo.data?.result?.map((item: any) => item.BillType) ?? []),
  ) as string[];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع صورتحساب</span>
      {!depo.isLoading && depo.data ? (
        <SelectControlled
          withSelectAll
          list={billTypeList}
          value={(column.getFilterValue() as string[]) ?? []}
          onChange={(selectedValues) => {
            column.setFilterValue(selectedValues);
          }}
        />
      ) : (
        <div className="h-8 w-full animate-pulse rounded-md bg-secbuttn"></div>
      )}
    </div>
  );
}
