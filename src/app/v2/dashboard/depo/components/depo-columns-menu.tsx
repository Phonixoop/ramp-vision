/**
 * Column visibility for the depo table.
 *
 * ReUI's `DataGridColumnVisibility` is the one grid feature beui's `Table` has
 * no equivalent for, so this is a small replacement built on the project's own
 * Radix dropdown. Visibility is per-session UI state (not URL state): the old
 * grid behaved the same way, and a hidden column is not a data filter.
 *
 * Items are plain `DropdownMenuItem`s with a trailing check rather than
 * `DropdownMenuCheckboxItem` — that primitive positions its indicator with
 * physical `left-*` / `pl-8` classes, which lands on the wrong edge in RTL.
 *
 * The row-number column is deliberately not hideable: it is the table's
 * positional anchor, and it was `enableHiding: false` before.
 */
"use client";

import { CheckIcon, ColumnsIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/shadcn/dropdown-menu";
import { cn } from "~/lib/utils";

export type DepoColumnOption = {
  key: string;
  header: string;
  /** Columns the guard keeps visible are listed but disabled. */
  locked?: boolean;
};

export function DepoColumnsMenu({
  options,
  hidden,
  onToggle,
  onReset,
  className,
}: {
  options: DepoColumnOption[];
  hidden: string[];
  onToggle: (key: string) => void;
  onReset: () => void;
  className?: string;
}) {
  const hiddenSet = new Set(hidden);
  const hiddenCount = options.filter(
    (option) => !option.locked && hiddenSet.has(option.key),
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md border border-border-color/15 px-2 text-xs text-primary/65 transition-colors hover:bg-primary/5 hover:text-primary data-[state=open]:bg-primary/5 data-[state=open]:text-primary",
          className,
        )}
      >
        <ColumnsIcon className="h-3.5 w-3.5" />
        ستون‌ها
        {hiddenCount > 0 ? (
          <span className="rounded-full bg-primary/10 px-1.5 text-[10px] tabular-nums text-primary/70">
            {hiddenCount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 border border-border-color/15"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-normal text-primary/45">
          نمایش ستون‌ها
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border-color/10" />
        {options.map((option) => {
          const visible = option.locked || !hiddenSet.has(option.key);
          return (
            <DropdownMenuItem
              key={option.key}
              // Keep the menu open so several columns can be toggled at once.
              onSelect={(event) => event.preventDefault()}
              disabled={option.locked}
              onClick={() => onToggle(option.key)}
              className={cn(
                "gap-2 text-xs",
                visible ? "text-primary/85" : "text-primary/35",
                option.locked && "cursor-default opacity-60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center",
                  visible ? "text-accent" : "text-transparent",
                )}
              >
                <CheckIcon className="size-3.5" />
              </span>
              <span className="truncate">{option.header}</span>
            </DropdownMenuItem>
          );
        })}
        {hiddenCount > 0 ? (
          <>
            <DropdownMenuSeparator className="bg-border-color/10" />
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-sm px-2 py-1.5 text-start text-xs text-primary/55 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              نمایش همه ستون‌ها
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
