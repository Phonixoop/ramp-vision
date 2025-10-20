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
  title = <></> || "",
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
}) {
  const correctList = useMemo(
    () => (typeof list === "function" ? list() : list),
    [list],
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "original">(
    "original",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce(searchQuery, 250);

  // Filtered list computed based on search
  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return correctList;
    return correctList.filter((item) => {
      const selectItem = selectProperty ? item[selectProperty] : item;
      return selectItem
        ?.toString()
        .toLowerCase()
        .includes(debouncedQuery.toLowerCase());
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
    setSortOrder((prev) => {
      if (prev === "original") return "asc";
      if (prev === "asc") return "desc";
      return "original";
    });
  }, [correctList.length]);

  const myDisabled = correctList.length <= 0 || disabled;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className={twMerge(
        "relative flex w-full max-w-sm flex-col items-center justify-start gap-1",
        className,
      )}
    >
      {title && (
        <div className="w-full rounded-lg bg-secbuttn p-3 text-center text-lg font-bold text-primary">
          {title}
        </div>
      )}

      <div
        className={twMerge(
          "flex w-full flex-col gap-1 overflow-hidden overflow-y-auto rounded-2xl p-1",
          computedList.length > 0
            ? "max-h-[580px] min-h-[580px] bg-secbuttn"
            : "h-full min-h-[580px]",
        )}
      >
        <div
          className={twMerge(
            "sticky top-0 z-10 flex w-full flex-col items-center justify-center gap-1 py-2 drop-shadow-lg",
            computedList.length > 0 ? "bg-secbuttn" : "",
          )}
        >
          <input
            type="text"
            dir="rtl"
            placeholder="جستجو..."
            className="w-full rounded-md bg-secondary p-2 text-primary disabled:bg-primary/30 disabled:text-secondary"
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            value={searchQuery}
          />

          <div className="flex w-full items-center justify-stretch gap-2">
            <div className="flex w-full items-center justify-around gap-2 rounded-lg bg-primary/10 p-2 text-primary">
              <Tally5Icon />
              <span>{computedList.length}</span>
            </div>

            <Button
              disabled={myDisabled}
              onClick={toggleSortOrder}
              className="flex w-full items-center justify-around gap-2 bg-secondary text-accent disabled:bg-primary/70 disabled:text-secondary"
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

        {computedList.map((item, i) => renderItem(item, i))}

        {correctList.length <= 0 && !isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-primary">دیتا ای موجود نیست</span>
          </div>
        )}
      </div>

      <Button className="sticky bottom-1 w-full bg-accent text-secondary">
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
    </div>
  );
}
