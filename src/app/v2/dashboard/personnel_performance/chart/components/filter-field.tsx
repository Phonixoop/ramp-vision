"use client";

import { useMemo } from "react";
import { cn } from "~/lib/utils";
import { MultiSelect } from "~/components/arc/multi-select/multi-select";

/** Same page size as SelectControlled / SelectColumnFilterOptimized. */
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
  const mergedOptions = useMemo(() => {
    const labels = Array.from(new Set([...values, ...options].filter(Boolean)));
    return labels.map((item) => ({ value: item, label: item }));
  }, [values, options]);

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5 text-sm", className)}>
      {loading && mergedOptions.length === 0 ? (
        <>
          <span className="text-primary/70">{label}</span>
          <div
            className="min-h-11 animate-pulse rounded-xl border border-primary/10 bg-secbuttn/60"
            aria-hidden
          />
        </>
      ) : (
        <MultiSelect
          label={label}
          value={values}
          onValueChange={onChange}
          options={mergedOptions}
          placeholder={
            values.length > 0 ? `${values.length} مورد` : placeholder
          }
          singleSelect={singleSelect}
          disabled={disabled}
          itemsPerPage={itemsPerPage}
          maxVisible={2}
        />
      )}
    </div>
  );
}
