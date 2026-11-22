"use client";

import { useMemo } from "react";
import { SelectControlled } from "~/features/checkbox-list";
import { cn } from "~/lib/utils";

/** Same page size as v1 FiltersSection / SelectControlled. */
const DEFAULT_ITEMS_PER_PAGE = 50;

type FilterFieldProps = {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  singleSelect?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  itemsPerPage?: number;
};

export function FilterField({
  label,
  values,
  options,
  onChange,
  placeholder = "انتخاب",
  singleSelect = false,
  disabled = false,
  loading = false,
  className,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: FilterFieldProps) {
  // Keep URL/default selections visible even before option lists finish loading.
  const list = useMemo(
    () => Array.from(new Set([...values, ...options].filter(Boolean))),
    [values, options],
  );

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5 text-sm", className)}>
      {loading && list.length === 0 ? (
        <>
          <span className="text-primary/70">{label}</span>
          <div
            className="min-h-11 animate-pulse rounded-xl border border-primary/10 bg-secbuttn/60"
            aria-hidden
          />
        </>
      ) : (
        <SelectControlled
          title={label || placeholder}
          list={list}
          value={values}
          onChange={onChange}
          withSelectAll={!singleSelect}
          singleSelect={singleSelect}
          itemsPerPage={itemsPerPage}
          className={cn(disabled && "pointer-events-none opacity-50")}
        />
      )}
    </div>
  );
}
