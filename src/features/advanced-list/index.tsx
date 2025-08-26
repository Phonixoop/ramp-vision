// --- imports ---
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { FixedSizeList as VList } from "react-window";
import { twMerge } from "tailwind-merge";
import Button from "~/ui/buttons";
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  DownloadCloudIcon,
  Tally5Icon,
} from "lucide-react";

import type { CSVLinkProps } from "react-csv";

type CSVLinkWithChildren = CSVLinkProps & {
  children?: ReactNode;
  className?: string;
};

const CSVLink = dynamic<CSVLinkWithChildren>(
  () => import("react-csv").then((m) => m.CSVLink as any),
  { ssr: false, loading: () => <span className="opacity-60">...</span> },
);
// --- types ---
type Header = { label: string; key: string };

type Props<T = any> = {
  className?: string;
  title?: React.ReactNode;
  list?: T[] | (() => T[]);
  isLoading?: boolean;
  disabled?: boolean;
  selectProperty?: keyof T | string;
  downloadFileName?: string;
  headers?: Header[];
  dataToDownload?: any[];
  onChange?: (next: T[]) => void; // fires after user actions (sort/search), not on mount
  renderItem: (item: T, index: number) => React.ReactNode;
  renderUnderButtons?: () => React.ReactNode;
  height?: number; // viewport height
  rowHeight?: number; // fixed row height for virtualization
  emptyText?: string;
};

// --- component ---
export default function AdvancedListFast<T>({
  className = "",
  title = null,
  list = [] as T[] | (() => T[]),
  isLoading = false,
  disabled = false,
  selectProperty,
  downloadFileName = "",
  headers = [],
  dataToDownload = [],
  onChange = () => {},
  renderItem,
  renderUnderButtons = () => null,
  height = 580,
  rowHeight = 72,
  emptyText = "دیتایی موجود نیست",
}: Props<T>) {
  // pull list once per change
  const correctList = useMemo<T[]>(
    () => (typeof list === "function" ? (list as any)() : (list as any)),
    [list],
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // debounce search
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const baseComparable = useCallback(
    (item: any) =>
      selectProperty ? item?.[selectProperty as string] ?? "" : item ?? "",
    [selectProperty],
  );

  const filtered = useMemo(() => {
    if (!debouncedQuery) return correctList;
    const q = debouncedQuery.toString().toLowerCase();
    return correctList.filter(
      (item: any) =>
        baseComparable(item)?.toString?.().toLowerCase?.().includes(q),
    );
  }, [correctList, debouncedQuery, baseComparable]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a: any, b: any) => {
      const aa = baseComparable(a)?.toString?.() ?? "";
      const bb = baseComparable(b)?.toString?.() ?? "";
      const cmp = aa.localeCompare(bb, undefined, { numeric: true });
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortOrder, baseComparable]);

  // Only notify parent after user intent (sort/search), not on first mount
  const didMountRef = useRef(false);
  useEffect(() => {
    didMountRef.current = true;
  }, []);
  useEffect(() => {
    if (!didMountRef.current || isLoading) return;
    onChange(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted]);

  const toggleSortOrder = useCallback(() => {
    if (!sorted.length) return;
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, [sorted.length]);

  const myDisabled = disabled || isLoading || sorted.length === 0;

  return (
    <div
      className={twMerge(
        "relative flex w-full max-w-sm flex-col gap-1",
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
          "flex w-full flex-col gap-1 overflow-hidden rounded-2xl bg-secbuttn p-1",
        )}
        style={{ minHeight: height, maxHeight: height }}
      >
        {/* Controls */}
        <div className="sticky top-0 z-10 flex w-full flex-col items-center justify-center gap-2 bg-secbuttn py-2 drop-shadow-lg">
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
            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 p-2 text-primary">
              <span>تعداد</span>
              <span className="font-bold">
                {isLoading ? "…" : sorted.length}
              </span>
            </div>

            <Button
              disabled={myDisabled}
              onClick={toggleSortOrder}
              className="flex w-full items-center justify-center gap-2 bg-secondary text-accent disabled:bg-primary/70 disabled:text-secondary"
            >
              <span>مرتب سازی</span>
              {sortOrder === "asc" ? <ArrowDownAZIcon /> : <ArrowUpAZIcon />}
            </Button>
          </div>

          <div className="flex w-full items-center justify-stretch gap-2">
            {renderUnderButtons()}
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <SkeletonList height={height - 120} rowHeight={rowHeight} />
        ) : sorted.length ? (
          <VList
            height={height - 120}
            itemCount={sorted.length}
            itemSize={rowHeight}
            width="100%"
          >
            {({ index, style }) => renderItem(sorted[index], index)}
          </VList>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-primary">{emptyText}</span>
          </div>
        )}
      </div>

      <Button
        className="sticky bottom-1 w-full bg-accent text-secondary"
        disabled={dataToDownload.length === 0}
      >
        <span className="flex w-full items-center justify-center gap-2">
          <DownloadCloudIcon />
          <CSVLink
            className="flex w-full justify-center gap-1"
            headers={headers}
            data={dataToDownload}
            filename={`${downloadFileName}.csv`}
          >
            دانلود لیست
          </CSVLink>
        </span>
      </Button>
    </div>
  );
}

// --- skeleton list ---
function SkeletonList({
  height,
  rowHeight,
}: {
  height: number;
  rowHeight: number;
}) {
  const rows = Math.max(1, Math.floor(height / rowHeight));
  return (
    <div className="w-full" style={{ height }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="my-1 h-[calc(var(--rowH)_-_8px)] animate-pulse rounded-xl bg-secondary/60"
          style={{ ["--rowH" as any]: `${rowHeight}px` }}
        />
      ))}
    </div>
  );
}
