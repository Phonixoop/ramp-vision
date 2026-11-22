"use client";
import React, { memo, useEffect, useMemo, useState } from "react";
import type { Column } from "@tanstack/react-table";

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "~/components/shadcn/multi-select";
import Button from "~/ui/buttons";
import { TableFilterSkeleton } from "~/app/dashboard/personnel_performance/table/components/TableFilterSkeleton";
import { PersonnelPerformanceData } from "~/app/dashboard/personnel_performance/table/types";
import {
  getPersonnelDisplayName,
  nationalCodeMatchesQuery,
  normalizeNationalCode,
} from "~/utils/personnel-performance";

type PersonnelOption = {
  code: string;
  name: string;
  label: string;
};

const PAGE_SIZE = 50;

export const PersonnelFilter = memo(function PersonnelFilter({
  column,
  personnelPerformance,
}: {
  column: Column<any, unknown>;
  personnelPerformance: any;
}) {
  const isPersonnelDataLoading = !personnelPerformance?.result;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const options = useMemo<PersonnelOption[]>(() => {
    const rows = (personnelPerformance?.result ??
      []) as PersonnelPerformanceData[];
    const byCode = new Map<string, PersonnelOption>();

    for (const row of rows) {
      const code = normalizeNationalCode(row.NationalCode);
      if (!code || byCode.has(code)) continue;
      const name = getPersonnelDisplayName(
        row.NameFamily,
        row.CityName,
        row.RealCityName,
      );
      byCode.set(code, {
        code,
        name,
        label: `${name} — ${code}`,
      });
    }

    return [...byCode.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fa", { numeric: true }),
    );
  }, [personnelPerformance?.result]);

  const columnFilterValue = column.getFilterValue() as string[] | undefined;

  // Keep local selection in sync with the NameFamily column filter.
  // Filter values are national codes (unique), matched via custom filterFn.
  useEffect(() => {
    setSelectedCodes(columnFilterValue ?? []);
  }, [columnFilterValue?.join(",")]);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(q) ||
        option.label.toLowerCase().includes(q) ||
        nationalCodeMatchesQuery(option.code, q),
    );
  }, [options, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageItems = filteredOptions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const applySelection = (codes: string[]) => {
    setSelectedCodes(codes);
    column.setFilterValue(codes.length ? codes : undefined);
  };

  if (isPersonnelDataLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
        <span className="font-bold text-primary">پرسنل</span>
        <TableFilterSkeleton />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
      <span className="font-bold text-primary">پرسنل</span>
      <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-hidden px-2 text-center text-primary sm:px-0">
        <div className="flex w-full min-w-0 max-w-[300px] items-center gap-2">
          <MultiSelect
            values={selectedCodes}
            onValuesChange={(values) => applySelection(values as string[])}
          >
            <MultiSelectTrigger className="min-w-0 max-w-full overflow-hidden">
              <MultiSelectValue
                overflowBehavior="cutoff"
                placeholder="جستجو نام یا کد ملی..."
              />
            </MultiSelectTrigger>
            <MultiSelectContent
              shouldFilter={false}
              search={{
                emptyMessage: "موردی یافت نشد",
                placeholder: "جستجو نام یا کد ملی...",
                value: searchTerm,
                onValueChange: (value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                },
              }}
            >
              <MultiSelectGroup>
                {pageItems.map((option) => (
                  <MultiSelectItem key={option.code} value={option.code}>
                    <p className="px-2 text-right text-primary hover:text-accent">
                      <span className="block">{option.name}</span>
                      <span className="block font-mono text-[11px] opacity-70 tabular-nums">
                        {option.code}
                      </span>
                    </p>
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
              {totalPages > 1 && (
                <div className="sticky bottom-0 flex items-center justify-center gap-2 border-t border-primary/10 bg-secbuttn p-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="h-6 border border-primary/10 bg-primary/5 px-2 text-xs"
                  >
                    قبلی
                  </Button>
                  <span className="text-xs text-primary/60">
                    {page} / {totalPages}
                  </span>
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={page === totalPages}
                    className="h-6 border border-primary/10 bg-primary/5 px-2 text-xs"
                  >
                    بعدی
                  </Button>
                </div>
              )}
            </MultiSelectContent>
          </MultiSelect>
        </div>
      </div>
    </div>
  );
});
