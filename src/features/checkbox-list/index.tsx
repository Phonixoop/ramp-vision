"use client";

import { Column } from "@tanstack/react-table";

import { ListXIcon, ListChecksIcon } from "lucide-react";
import React, { useEffect, useLayoutEffect, useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { ServiceNamesType } from "~/constants/depo";
import Button from "~/ui/buttons";
import { api } from "~/trpc/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/shadcn/tooltip";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "~/components/shadcn/multi-select";
import { Label } from "~/components/shadcn/label";
import { cn } from "~/lib/utils";
import { CommandInput } from "~/components/shadcn/command";
import { useCallback, useRef } from "react";
import { useTransition } from "react";

/**
 * Performance Optimized Checkbox List Components
 *
 * The SelectColumnFilter component has been optimized for large datasets:
 * - Uses requestIdleCallback to defer heavy computations
 * - Provides immediate visual feedback with local state
 * - Shows loading state during processing
 * - Memoizes unique values to avoid recalculation
 *
 * For very large datasets (>1000 items), use SelectColumnFilterOptimized
 * which includes pagination and search functionality.
 */

export default function CheckboxList({ checkboxes, onCheckboxChange }) {
  const handleCheckboxChange = (id) => {
    onCheckboxChange(id);
  };

  return (
    <div>
      {checkboxes.map((checkbox) => (
        <div key={checkbox.id} className="flex items-center">
          <input
            type="checkbox"
            id={`checkbox-${checkbox.id}`}
            checked={checkbox.checked}
            onChange={() => handleCheckboxChange(checkbox.id)}
            className="mr-2"
          />
          <label htmlFor={`checkbox-${checkbox.id}`}>{checkbox.label}</label>
        </div>
      ))}
    </div>
  );
}

type SelectControlledProps = {
  list?: string[];
  value?: string[];
  onChange?: (values: string[]) => void;
  title?: string;
  className?: string;
  withSelectAll?: boolean;
  singleSelect?: boolean;
  itemsPerPage?: number;
};

export function SelectControlled({
  list = [""],
  value = [""],
  onChange = () => {},
  title,
  className = "",
  withSelectAll = false,
  singleSelect = false,
  itemsPerPage = 50,
}: SelectControlledProps) {
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticValues, setOptimisticValues] = useState<string[]>(value);
  const [currentPage, setCurrentPage] = useState(1);

  // Store onChange in a ref to prevent infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Store previous value to prevent unnecessary updates
  const prevValueRef = useRef<string[]>(value ?? []);

  // Memoize filtered values to prevent infinite re-renders
  const filteredValues = useMemo(() => {
    return value ?? [];
  }, [value]);

  // Update optimistic values when value changes
  useEffect(() => {
    const currentValue = value ?? [];
    const prevValue = prevValueRef.current;

    // Only update if the values are actually different
    if (JSON.stringify(prevValue) !== JSON.stringify(currentValue)) {
      setOptimisticValues(currentValue);
      prevValueRef.current = currentValue;
    }
  }, [value]);

  // Memoize unique values calculation to avoid recalculating on every render
  useLayoutEffect(() => {
    if (!list || list.length === 0) {
      setOptimisticValues(value);
      return;
    }

    const processData = () => {
      const unique: string[] = Array.from(new Set(list))
        .filter((a) => a != null && a !== "" && String(a).trim() !== "")
        .toSorted();
      setUniqueValues(unique);
      setIsProcessing(false);
    };

    // For large datasets, use a more controlled approach
    if (list.length > 1000) {
      setIsProcessing(true);
      // Use a shorter timeout to avoid long delays
      const timer = setTimeout(processData, 16); // ~60fps
      return () => clearTimeout(timer);
    } else {
      processData();
    }
  }, [list]);

  const handleFilterChange = useCallback((values: string[]) => {
    // Filter out empty strings before updating
    const filteredValues = values.filter(
      (value) => value && value.trim() !== "",
    );

    // Immediately update optimistic state for instant feedback
    setOptimisticValues(filteredValues);
    setIsFiltering(true);

    // Defer the actual filter application to avoid blocking UI
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(
        () => {
          onChangeRef.current(filteredValues);
          setIsFiltering(false);
        },
        { timeout: 100 },
      );
    } else {
      setTimeout(() => {
        onChangeRef.current(filteredValues);
        setIsFiltering(false);
      }, 0);
    }
  }, []);

  if (!list || list.length === 0) return <></>;

  const isAllSelected =
    optimisticValues.length === uniqueValues.length && uniqueValues.length > 0;

  // Filter and paginate items
  const filteredItems = uniqueValues.filter((item) =>
    String(item || "").toLowerCase(),
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the paginated items to display
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // const handleSearchChange = (value: string) => {
  //   setSearchTerm(value);
  //   setCurrentPage(1); // Reset to first page when searching
  // };

  return (
    <div
      className={cn(
        "flex w-full max-w-full items-center justify-between gap-2 overflow-hidden px-2 text-center text-primary sm:px-0",
        className,
      )}
    >
      <div className="relative flex w-full min-w-0 max-w-[300px] items-center gap-2">
        <MultiSelect
          singleSelect={singleSelect}
          values={optimisticValues}
          onValuesChange={(values) => {
            handleFilterChange(values as string[]);
          }}
        >
          <MultiSelectTrigger className="min-w-0 max-w-full overflow-hidden">
            <MultiSelectValue
              overflowBehavior="cutoff"
              placeholder={title || "جستجو..."}
            />
          </MultiSelectTrigger>

          <MultiSelectContent search={false}>
            <MultiSelectGroup>
              {isProcessing ? (
                <div className="flex items-center justify-center p-4 text-sm text-primary/60">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary"></div>
                  در حال پردازش... (CPU شما)
                </div>
              ) : (
                <>
                  {paginatedItems.map((item) => (
                    <MultiSelectItem key={item} value={item}>
                      <p className="px-2 text-right text-primary hover:text-accent">
                        {item}
                      </p>
                    </MultiSelectItem>
                  ))}
                </>
              )}
            </MultiSelectGroup>
            {/* Pagination for large datasets */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 flex items-center justify-center gap-2 border-t border-primary/10 bg-secbuttn p-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="h-6 border border-primary/10 bg-primary/5 px-2 text-xs "
                >
                  قبلی
                </Button>
                <div className="flex items-center gap-2 text-xs text-primary/60">
                  <span className="text-primary">{totalPages}</span>
                  <span>از </span>
                  <span className="text-primary">{currentPage}</span>
                </div>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-6 border border-primary/10 bg-primary/5 px-2 text-xs hover:bg-primary/10"
                >
                  بعدی
                </Button>
              </div>
            )}
          </MultiSelectContent>
        </MultiSelect>

        {/* Loading indicator for filtering */}
        {isFiltering && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div className="h-3 w-3 animate-spin rounded-full border border-primary/20 border-t-primary"></div>
          </div>
        )}
      </div>
      {withSelectAll && !singleSelect && list.length > 0 && !isProcessing && (
        <Button
          className={cn(
            "rounded-xl font-bold",
            isAllSelected
              ? "border border-primary/10  bg-primary/10 p-1 text-rose-600 transition-all duration-300 hover:bg-primary/20"
              : "border border-primary/10  p-1 text-emerald-600 transition-all duration-300 hover:bg-emerald-50/20",
          )}
          onClick={() => {
            if (isAllSelected) {
              handleFilterChange([]);
            } else {
              handleFilterChange(uniqueValues);
            }
          }}
        >
          {isAllSelected ? <ListXIcon /> : <ListChecksIcon />}
        </Button>
      )}
    </div>
  );
}
type AnyRow = Record<string, unknown>;
const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];
const getString = (v: unknown): string => (v == null ? "" : String(v));

export function SelectColumnFilter({
  column,
  data,
  initialFilters = [""],
  selectedValues = [""],
  onChange = (filter) => {},
  withSelectAll = true,
  singleSelect = false,
}) {
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const { getFilterValue, setFilterValue } = column as Column<any>;
  const [isProcessing, setIsProcessing] = useState(false);
  const [localFilterValue, setLocalFilterValue] =
    useState<string[]>(initialFilters);
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleCallbackRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (
      idleCallbackRef.current &&
      typeof window !== "undefined" &&
      "cancelIdleCallback" in window
    ) {
      (window as any).cancelIdleCallback(idleCallbackRef.current);
      idleCallbackRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Memoize unique values calculation to avoid recalculating on every render
  useLayoutEffect(() => {
    if (!data || data.length === 0) return;

    const processData = () => {
      const unique: string[] = Array.from(
        new Set(
          (data as AnyRow[])
            .map((a) => getString((a as AnyRow)[column.id]))
            .filter((v) => v && v.trim() !== ""),
        ),
      ).toSorted();

      setUniqueValues(unique);
      setIsProcessing(false);
    };

    // For large datasets, use a more controlled approach
    if (data.length > 1000) {
      setIsProcessing(true);
      // Use a shorter timeout to avoid long delays
      const timer = setTimeout(processData, 16); // ~60fps
      return () => clearTimeout(timer);
    } else {
      processData();
    }
  }, [data, column.id]);

  useIsomorphicLayoutEffect(() => {
    setFilterValue(initialFilters);
    setLocalFilterValue(initialFilters);
  }, []);

  const handleFilterChange = useCallback(
    (values: string[]) => {
      // Immediately update local state for instant feedback
      setLocalFilterValue(values);

      // Cleanup previous deferred operations
      cleanup();

      // Defer the actual filter application
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleCallbackRef.current = (window as any).requestIdleCallback(
          () => {
            setFilterValue(values);
            onChange({
              id: column.id,
              values: values,
            });
          },
          { timeout: 50 },
        );
      } else {
        timeoutRef.current = setTimeout(() => {
          setFilterValue(values);
          onChange({
            id: column.id,
            values: values,
          });
        }, 0);
      }
    },
    [column.id, onChange, cleanup],
  );

  if (!data || data.length === 0) return <></>;

  const finalValues =
    selectedValues?.length <= 0 ? getFilterValue() : selectedValues ?? [];

  const selectedCount = finalValues ? (finalValues as any).length : 0;
  const selectAllState = selectedCount < uniqueValues.length;

  return (
    <div className="flex w-full max-w-full items-center justify-center gap-2 overflow-hidden px-2 text-center sm:px-0">
      <MultiSelect
        values={localFilterValue}
        onValuesChange={handleFilterChange}
        defaultValues={initialFilters}
      >
        <MultiSelectTrigger className="min-w-0 max-w-full overflow-hidden">
          <MultiSelectValue placeholder="جستجو..." />
        </MultiSelectTrigger>
        <MultiSelectContent
          search={{
            emptyMessage: "موردی یافت نشد",
            placeholder: "جستجو...",
          }}
        >
          <MultiSelectGroup>
            <input
              type="text"
              placeholder="جستجو..."
              className="sticky top-0 w-full rounded-full bg-secbuttn"
            />
            {isProcessing ? (
              <div className="flex items-center justify-center p-4 text-sm text-primary/60">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary"></div>
                در حال پردازش... (CPU شما)
              </div>
            ) : (
              uniqueValues.map((item) => (
                <MultiSelectItem key={item} value={item}>
                  <p className="px-2 text-right text-primary hover:text-accent">
                    {item}
                  </p>
                </MultiSelectItem>
              ))
            )}
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
      {withSelectAll &&
        !singleSelect &&
        uniqueValues.length > 0 &&
        !isProcessing && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    "rounded-xl font-bold",
                    selectAllState
                      ? "border border-primary/10  p-1 text-emerald-600 transition-all duration-300 hover:bg-emerald-50/20"
                      : "border border-primary/10  bg-primary/10 p-1 text-rose-600 transition-all duration-300 hover:bg-primary/20",
                  )}
                  onClick={() => {
                    if (selectedCount == uniqueValues.length) {
                      handleFilterChange([]);
                    } else {
                      handleFilterChange(uniqueValues);
                    }
                  }}
                >
                  {selectAllState ? <ListChecksIcon /> : <ListXIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  selectAllState ? "bg-emerald-200" : "bg-rose-200",
                )}
              >
                <p className="text-secondary">
                  {selectAllState ? "انتخاب همه" : "پاک کردن انتخاب ها"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
    </div>
  );
}
const uniqueValues = [
  "اذربایجان شرقی",
  "اذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران غیر مستقیم",
  "تهران مستقیم",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "چهار محال و بختیاری",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویر احمد",
  "گلستان",
  "گیلان",
  "یزد",
];
export function SearchConfigurationMultiSelect() {
  const [selectedValues, setSelectedValues] = useState<string[]>(uniqueValues);

  const isAllSelected = selectedValues.length === uniqueValues.length;

  const handleSelectAll = () => {
    console.log("Select All clicked, current state:", selectedValues);
    if (isAllSelected) {
      setSelectedValues([]);
    } else {
      setSelectedValues([...uniqueValues]);
    }
  };

  const handleValuesChange = (values: string[]) => {
    console.log("Values changed from:", selectedValues, "to:", values);
    setSelectedValues([...values]); // Create a new array to ensure state update
  };

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("Selected values changed:", selectedValues);
  }, [selectedValues]);

  return (
    <div className="flex w-[400px] flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button onClick={handleSelectAll}>
          {isAllSelected ? "انتخاب همه" : "انتخاب هیچ‌کدام"}
        </Button>
        <span className="text-sm text-gray-600">
          {selectedValues.length} از {uniqueValues.length} انتخاب شده
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <MultiSelect
          values={selectedValues}
          onValuesChange={handleValuesChange}
          defaultValues={uniqueValues}
        >
          <MultiSelectTrigger className="w-full">
            <MultiSelectValue placeholder="جستجو..." />
          </MultiSelectTrigger>
          <MultiSelectContent
            search={{
              emptyMessage: "شهری یافت نشد",
              placeholder: "جستجو شهر ها",
            }}
          >
            <MultiSelectGroup>
              {uniqueValues.map((item) => (
                <MultiSelectItem key={item} value={item}>
                  <p className="px-2 text-right text-primary hover:text-accent">
                    {item}
                  </p>
                </MultiSelectItem>
              ))}
            </MultiSelectGroup>
          </MultiSelectContent>
        </MultiSelect>
      </div>

      {/* Debug section - remove in production */}
      <div className="text-xs text-gray-500">
        <p>Debug Info:</p>
        <p>Selected: {JSON.stringify(selectedValues)}</p>
        <p>Count: {selectedValues.length}</p>
      </div>
    </div>
  );
}

type SelectColumnFilterOptimizedProps<T> = {
  column: Column<any>;
  values: T[];
  initialFilters?: string[];
  onChange?: (filter: { id: string; values: string[] }) => void;
  withSelectAll?: boolean;
  singleSelect?: boolean;
  itemsPerPage?: number;
};
export function SelectColumnFilterOptimized<T>({
  column,
  values,
  initialFilters = [""],
  onChange = (filter) => {},
  withSelectAll = true,
  singleSelect = false,
  itemsPerPage = 50,
}: SelectColumnFilterOptimizedProps<T>) {
  // Use a more stable approach for initialFilters
  const stableInitialFilters = useMemo(() => {
    if (!initialFilters || initialFilters.length === 0) return [];
    return initialFilters;
  }, [initialFilters?.length, initialFilters?.join(",")]);
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const { getFilterValue, setFilterValue } = column as Column<T>;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [optimisticValues, setOptimisticValues] = useState<string[]>([]);
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize filtered values to prevent infinite re-renders
  const filteredValues = useMemo(() => {
    return (getFilterValue() as string[]) ?? [];
  }, [getFilterValue]);

  // Initialize optimistic values when filteredValues change
  useEffect(() => {
    const currentFilteredValues = filteredValues as string[];
    setOptimisticValues(currentFilteredValues);
  }, [filteredValues]);

  // Memoize unique values calculation to avoid recalculating on every render
  useLayoutEffect(() => {
    if (!values || values.length === 0) {
      setUniqueValues(initialFilters as string[]);
      return;
    }

    const processData = () => {
      const unique: string[] = Array.from(
        new Set(
          (values as AnyRow[])
            .map((a) => getString((a as AnyRow)[column.id]))
            .filter(Boolean),
        ),
      ).toSorted();

      setUniqueValues(unique);
      setIsProcessing(false);
    };

    // For large datasets, use a more controlled approach
    if (values.length > 1000) {
      setIsProcessing(true);
      // Use a shorter timeout to avoid long delays
      const timer = setTimeout(processData, 16); // ~60fps
      return () => clearTimeout(timer);
    } else {
      processData();
    }
  }, [values, column.id]);

  // Initialize filter value only once when component mounts
  const hasInitialized = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (
      !hasInitialized.current &&
      stableInitialFilters &&
      stableInitialFilters.length > 0
    ) {
      setFilterValue(stableInitialFilters);
      hasInitialized.current = true;
    }
  }, [stableInitialFilters]);

  if (!values || values.length === 0) return <></>;

  const isAllSelected =
    optimisticValues.length === uniqueValues.length && uniqueValues.length > 0;

  const handleFilterChange = (values: string[]) => {
    // Immediately update optimistic state for instant feedback
    setOptimisticValues(values);
    setIsFiltering(true);

    // Defer the actual filter application to avoid blocking UI
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(
        () => {
          setFilterValue(values);
          onChange({
            id: column.id,
            values: values,
          });
          setIsFiltering(false);
        },
        { timeout: 100 },
      );
    } else {
      setTimeout(() => {
        setFilterValue(values);
        onChange({
          id: column.id,
          values: values,
        });
        setIsFiltering(false);
      }, 0);
    }
  };

  // Filter and paginate items
  const filteredItems = uniqueValues.filter((item) =>
    String(item || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // const handleSearchChange = (value: string) => {
  //   setSearchTerm(value);
  //   setCurrentPage(1); // Reset to first page when searching
  // };

  return (
    <div className="flex w-full max-w-full items-center justify-between gap-2 overflow-hidden px-2 text-center text-primary sm:px-0">
      <div className="relative flex w-full min-w-0 max-w-[300px] items-center gap-2">
        <MultiSelect
          singleSelect={singleSelect}
          defaultValues={stableInitialFilters}
          values={optimisticValues}
          onValuesChange={(values) => {
            handleFilterChange(values as string[]);
          }}
        >
          <MultiSelectTrigger className="min-w-0 max-w-full overflow-hidden">
            <MultiSelectValue
              overflowBehavior="cutoff"
              placeholder="جستجو..."
            />
          </MultiSelectTrigger>

          <MultiSelectContent search={false}>
            <MultiSelectGroup>
              {isProcessing ? (
                <div className="flex items-center justify-center p-4 text-sm text-primary/60">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary"></div>
                  در حال پردازش... (CPU شما)
                </div>
              ) : (
                <>
                  {currentItems.map((item) => (
                    <MultiSelectItem key={item} value={item}>
                      <p className="px-2 text-right text-primary hover:text-accent">
                        {item}
                      </p>
                    </MultiSelectItem>
                  ))}
                </>
              )}
            </MultiSelectGroup>
            {/* Pagination for large datasets */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 flex items-center justify-center gap-2 border-t border-primary/10 bg-secbuttn p-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="h-6 border border-primary/10 bg-primary/5 px-2 text-xs "
                >
                  قبلی
                </Button>
                <div className="flex items-center gap-2 text-xs text-primary/60">
                  <span className="text-primary">{totalPages}</span>
                  <span>از </span>
                  <span className="text-primary">{currentPage}</span>
                </div>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-6 border border-primary/10 bg-primary/5 px-2 text-xs hover:bg-primary/10"
                >
                  بعدی
                </Button>
              </div>
            )}
          </MultiSelectContent>
        </MultiSelect>

        {/* Loading indicator for filtering */}
        {isFiltering && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div className="h-3 w-3 animate-spin rounded-full border border-primary/20 border-t-primary"></div>
          </div>
        )}
      </div>

      {withSelectAll &&
        !singleSelect &&
        uniqueValues.length > 0 &&
        !isProcessing && (
          <Button
            className={cn(
              "rounded-xl font-bold",
              isAllSelected
                ? "border border-primary/10  bg-primary/10 p-1 text-rose-600 transition-all duration-300 hover:bg-primary/20"
                : "border border-primary/10  p-1 text-emerald-600 transition-all duration-300 hover:bg-emerald-50/20",
            )}
            onClick={() => {
              if (isAllSelected) {
                handleFilterChange([]);
              } else {
                handleFilterChange(uniqueValues);
              }
            }}
          >
            {isAllSelected ? <ListXIcon /> : <ListChecksIcon />}
          </Button>
        )}
    </div>
  );
}
