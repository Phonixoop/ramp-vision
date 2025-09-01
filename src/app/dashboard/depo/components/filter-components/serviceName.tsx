"use client";
import { Column } from "@tanstack/react-table";
import { SelectControlled } from "~/features/checkbox-list";
import { DepoData } from "../../types";

interface ServiceNameFilterProps {
  column: Column<DepoData, string | number | null>;
  depo: any;
  setDataFilters: (filters: any) => void;
}

export function ServiceNameFilter({
  column,
  depo,
  setDataFilters,
}: ServiceNameFilterProps) {
  const serviceNameList = Array.from(
    new Set(depo.data?.result?.map((item: any) => item.ServiceName) ?? []),
  ) as string[];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع فعالیت</span>
      {!depo.isLoading && depo.data ? (
        <SelectControlled
          withSelectAll
          list={serviceNameList}
          value={(column.getFilterValue() as string[]) ?? []}
          onChange={(selectedValues) => {
            column.setFilterValue(selectedValues);
            setDataFilters((prev: any) => ({
              ...prev,
              filter: {
                ...prev.filter,
                ServiceName: selectedValues,
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
