import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  DownloadCloudIcon,
  Tally5Icon,
  ArrowUpDownIcon,
} from "lucide-react";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import Button from "~/ui/buttons";
import { CSVLink } from "react-csv";
import { nationalCodeMatchesQuery } from "~/utils/personnel-performance";

// simple debounce hook
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function AdvancedList({
  className = "",
  title = null,
  list = () => [],
  filteredList = [], // external controlled list
  isLoading = false,
  disabled = false,
  selectProperty = undefined,
  downloadFileName = "",
  headers = [],
  dataToDownload = [],
  onChange = (action: any) => {},
  renderItem = (item: any, i: number) => <></>,
  renderUnderButtons = () => <></>,
  /** Hide search/sort/download chrome for narrow sticky rails. */
  compact = false,
  /** Stretch to parent flex height instead of the fixed 580px panel. */
  fillHeight = false,
  /** Initial sort when uncontrolled: asc = A→Z, desc = Z→A, original = API order. */
  defaultSortOrder = "original" as "asc" | "desc" | "original",
  /** Controlled sort order. */
  sortOrder: controlledSortOrder,
  onSortOrderChange,
}: {
  className?: string;
  title?: React.ReactNode | null;
  list?: any[] | (() => any[]);
  filteredList?: any[];
  isLoading?: boolean;
  disabled?: boolean;
  selectProperty?: string;
  downloadFileName?: string;
  headers?: { label: string; key: string }[];
  dataToDownload?: any[];
  onChange?: (action: any) => void;
  renderItem?: (item: any, i: number) => React.ReactNode;
  renderUnderButtons?: () => React.ReactNode;
  compact?: boolean;
  fillHeight?: boolean;
  defaultSortOrder?: "asc" | "desc" | "original";
  sortOrder?: "asc" | "desc" | "original";
  onSortOrderChange?: (order: "asc" | "desc" | "original") => void;
}) {
  const correctList = useMemo(
    () => (typeof list === "function" ? list() : list),
    [list],
  );

  const [uncontrolledSortOrder, setUncontrolledSortOrder] = useState<
    "asc" | "desc" | "original"
  >(defaultSortOrder);
  const isSortControlled = controlledSortOrder !== undefined;
  const sortOrder = isSortControlled
    ? controlledSortOrder
    : uncontrolledSortOrder;
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 250);

  // Filtered list computed based on search (name + national code when present)
  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return correctList;
    const q = debouncedQuery.toLowerCase();
    return correctList.filter((item) => {
      const selectItem = selectProperty ? item[selectProperty] : item;
      if (selectItem?.toString().toLowerCase().includes(q)) return true;
      return (
        nationalCodeMatchesQuery(item?.NationalCode, q) ||
        nationalCodeMatchesQuery(item?.key?.NationalCode, q)
      );
    });
  }, [debouncedQuery, correctList, selectProperty]);

  // Sorted list computed based on sort order
  const computedList = useMemo(() => {
    if (sortOrder === "original") {
      return filteredItems; // Return in original order without sorting
    }

    const arr = [...filteredItems];
    arr.sort((a, b) => {
      const aa = selectProperty ? a[selectProperty] : a;
      const bb = selectProperty ? b[selectProperty] : b;
      const aaStr = aa?.toString() ?? "";
      const bbStr = bb?.toString() ?? "";
      const comparison = aaStr.localeCompare(bbStr, undefined, {
        numeric: true,
      });
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return arr;
  }, [filteredItems, sortOrder, selectProperty]);

  // Send changes up
  React.useEffect(() => {
    onChange(computedList);
  }, [computedList, onChange]);

  const toggleSortOrder = useCallback(() => {
    if (correctList.length <= 0) return;
    const next =
      sortOrder === "original"
        ? "asc"
        : sortOrder === "asc"
          ? "desc"
          : "original";
    if (!isSortControlled) {
      setUncontrolledSortOrder(next);
    }
    onSortOrderChange?.(next);
  }, [correctList.length, isSortControlled, onSortOrderChange, sortOrder]);

  const myDisabled = correctList.length <= 0 || disabled;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className={twMerge(
        "relative flex w-full flex-col items-center justify-start gap-1",
        compact ? "max-w-none" : "max-w-sm",
        fillHeight && "min-h-0 flex-1 overflow-hidden",
        className,
      )}
    >
      {title && !compact && (
        <div className="w-full rounded-lg bg-secbuttn p-3 text-center text-lg font-bold text-primary">
          {title}
        </div>
      )}

      <div
        className={twMerge(
          "flex w-full flex-col gap-1 overflow-hidden overflow-y-auto rounded-2xl p-1",
          fillHeight
            ? "min-h-0 max-h-none flex-1 bg-transparent"
            : twMerge(
                computedList.length > 0
                  ? "max-h-[580px] min-h-[580px] bg-secbuttn"
                  : "h-full min-h-[580px]",
                compact && "min-h-0 max-h-[min(580px,70vh)]",
              ),
        )}
      >
        {!compact && (
          <div
            className={twMerge(
              "sticky top-0 z-10 flex w-full flex-col items-center justify-center gap-1 py-2 drop-shadow-lg",
              fillHeight
                ? "bg-fourth"
                : computedList.length > 0
                  ? "bg-secbuttn"
                  : "",
            )}
          >
            <input
              type="text"
              dir="rtl"
              placeholder="جستجو نام یا کد ملی..."
              className={twMerge(
                "w-full rounded-md p-2 text-primary disabled:bg-primary/30 disabled:text-secondary",
                fillHeight
                  ? "border border-border-color/10 bg-third text-xs"
                  : "bg-secondary",
              )}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={disabled}
              value={searchQuery}
            />

            <div className="flex w-full items-center justify-stretch gap-2">
              <div
                className={twMerge(
                  "flex w-full items-center justify-around gap-2 rounded-lg p-2 text-primary",
                  fillHeight ? "bg-third text-xs" : "bg-primary/10",
                )}
              >
                <Tally5Icon className={fillHeight ? "size-3.5" : undefined} />
                <span>{computedList.length}</span>
              </div>

              <Button
                disabled={myDisabled}
                onClick={toggleSortOrder}
                className={twMerge(
                  "flex w-full items-center justify-around gap-2 disabled:bg-primary/70 disabled:text-secondary",
                  fillHeight
                    ? "rounded-lg border border-border-color/10 bg-third text-xs text-primary/70"
                    : "bg-secondary text-accent",
                )}
              >
                <span>مرتب سازی</span>
                {sortOrder === "original" ? (
                  <ArrowUpDownIcon />
                ) : sortOrder === "asc" ? (
                  <ArrowDownAZIcon />
                ) : (
                  <ArrowUpAZIcon />
                )}
              </Button>
            </div>

            <div className="flex w-full items-center justify-stretch gap-2">
              {renderUnderButtons()}
            </div>
          </div>
        )}

        {computedList.map((item, i) => renderItem(item, i))}

        {correctList.length <= 0 && !isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-primary">دیتا ای موجود نیست</span>
          </div>
        )}
      </div>

      {!compact && (
        <Button
          className={twMerge(
            "w-full shrink-0 bg-accent text-secondary",
            fillHeight ? "sticky bottom-0 rounded-none rounded-b-2xl" : "sticky bottom-1",
          )}
        >
          {isClient ? (
            <CSVLink
              className="flex w-full justify-center gap-1"
              headers={headers}
              data={dataToDownload}
              filename={`${downloadFileName}.csv`}
            >
              <DownloadCloudIcon />
              دانلود لیست
            </CSVLink>
          ) : (
            <div className="flex w-full justify-center gap-1">
              <DownloadCloudIcon />
              دانلود لیست
            </div>
          )}
        </Button>
      )}
    </div>
  );
}
