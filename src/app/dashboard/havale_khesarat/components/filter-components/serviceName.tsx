"use client";
import { SelectControlled } from "~/features/checkbox-list";
import { ServiceNames } from "~/constants/depo";

interface ServiceNameFilterProps {
  setDataFilters: (filters: any) => void;
  currentValue: string[];
}

export function ServiceNameFilter({
  setDataFilters,
  currentValue,
}: ServiceNameFilterProps) {
  const serviceNameList = Object.values(ServiceNames);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع فعالیت</span>
      <SelectControlled
        withSelectAll
        list={serviceNameList}
        value={currentValue}
        onChange={(selectedValues) => {
          setDataFilters((prev: any) => ({
            ...prev,
            filter: {
              ...prev.filter,
              ServiceName: selectedValues,
            },
          }));
        }}
      />
    </div>
  );
}
