"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useDeferredValue,
  memo,
} from "react";
import { twMerge } from "tailwind-merge";
import { CSVLink } from "react-csv";
import Button from "~/ui/buttons";
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  DownloadCloudIcon,
  Tally5Icon,
} from "lucide-react";
import { FixedSizeList as VirtualList, areEqual } from "react-window";

export type AdvancedListProps<T> = {
  className?: string;
  title?: React.ReactNode;
  list: T[] | (() => T[]);
  filteredList?: T[];
  isLoading?: boolean;
  disabled?: boolean;
  selectProperty?: keyof T;
  downloadFileName?: string;
  headers?: { label: string; key: string }[];
  dataToDownload?: any[];
  onChange?: (visibleItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderUnderButtons?: () => React.ReactNode;
  itemHeight: number;
  maxHeight?: number;
  searchPlaceholder?: string;
};

function getItemString<T>(item: T, selectProperty?: keyof T) {
  const val = selectProperty ? (item as any)?.[selectProperty] : (item as any);
  return val == null ? "" : String(val);
}

const Row = memo<{ index: number; style: React.CSSProperties; data: any }>(
  ({ index, style, data }) => {
    const { items, renderItem } = data;
    const item = items[index];
    return (
      <div style={style} className="w-full">
        {renderItem(item, index)}
      </div>
    );
  },
  areEqual,
);

export default function AdvancedList2<T = any>({
  className = "",
  title,
  list,
  filteredList,
  isLoading = false,
  disabled = false,
  selectProperty,
  downloadFileName = "",
  headers = [],
  dataToDownload = [],
  onChange,
  renderItem,
  renderUnderButtons,
  itemHeight,
  maxHeight = 580,
  searchPlaceholder = "جستجو...",
}: AdvancedListProps<T>) {
  const baseList = useMemo<T[]>(
    () => (typeof list === "function" ? (list as any)() : (list as any) || []),
    [list],
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  // IMPORTANT: do not re-sort externally provided list, keep input order intact.
  const sourceList =
    filteredList && filteredList.length ? filteredList : baseList;

  const filtered = useMemo(() => {
    if (!deferredQuery) return sourceList;
    const q = deferredQuery.toLowerCase();
    return sourceList.filter((item) =>
      getItemString(item, selectProperty).toLowerCase().includes(q),
    );
  }, [deferredQuery, selectProperty, sourceList]);

  // Only change search filtering; DO NOT reorder the list
  const visibleItems = useMemo(() => filtered, [filtered]);

  React.useEffect(() => {
    onChange?.(visibleItems);
  }, [visibleItems, onChange]);

  const toggleSortOrder = useCallback(() => {
    // Keep this function but disable actual sorting since order should not change
    setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
  }, []);

  const isEmpty = !isLoading && (baseList?.length ?? 0) === 0;
  const myDisabled = visibleItems.length <= 0 || disabled;

  return (
    <div
      className={twMerge(
        "relative flex w-full max-w-sm flex-col items-center justify-start gap-1",
        className,
      )}
    >
      {title ? (
        <div className="w-full rounded-lg bg-secbuttn p-3 text-center text-lg font-bold text-primary">
          {title}
        </div>
      ) : null}

      <div
        className={twMerge(
          "flex w-full flex-col gap-1 overflow-hidden rounded-2xl p-1",
          visibleItems.length > 0 ? "bg-secbuttn" : "",
        )}
        style={{ maxHeight }}
      >
        <div
          className={twMerge(
            "sticky top-0 z-10 flex w-full flex-col items-center gap-1 py-2 drop-shadow-lg",
            visibleItems.length > 0 ? "bg-secbuttn" : "",
          )}
        >
          <input
            type="text"
            dir="rtl"
            placeholder={searchPlaceholder}
            className="w-full rounded-md bg-secondary p-2 text-primary disabled:bg-primary/30 disabled:text-secondary"
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            value={searchQuery}
          />

          <div className="flex w-full items-center justify-stretch gap-2">
            <div className="flex w-full items-center justify-around gap-2 rounded-lg bg-primary/10 p-2 text-primary">
              <Tally5Icon />
              <span>{visibleItems.length}</span>
            </div>

            <Button
              disabled={myDisabled}
              onClick={toggleSortOrder}
              className="flex w-full items-center justify-around gap-2 bg-secondary text-accent disabled:bg-primary/70 disabled:text-secondary"
            >
              <span>مرتب سازی</span>
              {sortOrder === "asc" ? <ArrowDownAZIcon /> : <ArrowUpAZIcon />}
            </Button>
          </div>

          <div className="flex w-full items-center justify-stretch gap-2">
            {renderUnderButtons?.()}
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <VirtualList
            height={maxHeight - 120}
            itemCount={visibleItems.length}
            itemSize={itemHeight}
            width={"100%"}
            itemData={{ items: visibleItems, renderItem }}
            itemKey={(index) => `${index}`}
          >
            {Row}
          </VirtualList>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center">
            {isLoading ? (
              <span className="text-primary/80">در حال بارگذاری…</span>
            ) : isEmpty ? (
              <span className="text-primary">دیتایی موجود نیست</span>
            ) : (
              <span className="text-primary/80">موردی یافت نشد</span>
            )}
          </div>
        )}
      </div>

      <Button className="sticky bottom-1 w-full bg-accent text-secondary">
        <CSVLink
          className="flex w-full justify-center gap-1"
          headers={headers}
          data={dataToDownload}
          filename={`${downloadFileName}.csv`}
        >
          <DownloadCloudIcon />
          دانلود لیست
        </CSVLink>
      </Button>
    </div>
  );
}
