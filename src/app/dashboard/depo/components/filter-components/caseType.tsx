"use client";
import { Column } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import { SelectControlled } from "~/features/checkbox-list";
import { DepoData } from "../../types";

interface CaseTypeFilterProps {
  column: Column<DepoData, string | number | null>;
  depo: any;
  setDataFilters: (filters: any) => void;
}

function uniqueSorted(values: Iterable<unknown>) {
  return Array.from(
    new Set(
      Array.from(values)
        .map((v) => (v == null ? "" : String(v).trim()))
        .filter(Boolean),
    ),
  ).toSorted();
}

export function CaseTypeFilter({ column, depo }: CaseTypeFilterProps) {
  const caseTypeList = useMemo(() => {
    const faceted = uniqueSorted(column.getFacetedUniqueValues().keys());
    if (faceted.length > 0) return faceted;
    return uniqueSorted(
      (depo?.data?.result ?? []).map((item: DepoData) => item.CaseType),
    );
  }, [column.getFacetedUniqueValues(), depo?.data?.result]);

  useEffect(() => {
    if (depo?.isLoading || caseTypeList.length === 0) return;
    const current = (column.getFilterValue() as string[]) ?? [];
    if (current.length === 0) return;
    const next = current.filter((item) => caseTypeList.includes(item));
    if (next.length !== current.length) column.setFilterValue(next);
  }, [caseTypeList, depo?.isLoading, column]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">نوع پرونده</span>
      {!depo.isLoading && depo.data ? (
        <SelectControlled
          withSelectAll
          list={caseTypeList}
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
