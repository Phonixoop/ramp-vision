"use client";

import { useState, type ReactNode } from "react";
import { ListFilterIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/shadcn/popover";
import { cn } from "~/lib/utils";

type ToolbarFilterPopoverProps = {
  activeFilterCount: number;
  onClear?: () => void;
  children: ReactNode;
  contentClassName?: string;
};

export function ToolbarFilterPopover({
  activeFilterCount,
  onClear,
  children,
  contentClassName,
}: ToolbarFilterPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border border-border-color/15 px-2.5 text-xs text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary",
            activeFilterCount > 0 && "border-accent/40 text-accent",
          )}
        >
          <ListFilterIcon className="size-3.5" />
          فیلتر
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-accent px-1.5 text-[10px] font-medium leading-4 text-secondary">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-max max-w-[min(920px,calc(100vw-2rem))] rounded-xl border border-border-color/10 bg-fourth p-0 shadow-2xl",
          contentClassName,
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => {
          // Arc multi-select menus portal to document.body; keep the filter open while using them.
          const target = event.target as HTMLElement | null;
          if (target?.closest?.("[data-arc-multi-select-menu]")) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest?.("[data-arc-multi-select-menu]")) {
            event.preventDefault();
          }
        }}
      >
        {/* Mount heavy filter fields only while open to avoid MultiSelect work on idle. */}
        {open ? (
          <>
            <div
              dir="rtl"
              className="flex items-center justify-between gap-2 border-b border-border-color/10 px-3.5 py-2.5"
            >
              <p className="text-sm font-medium text-primary">فیلتر</p>
              {activeFilterCount > 0 && onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[11px] text-accent/80 transition-colors hover:text-accent"
                >
                  پاک کردن
                </button>
              ) : null}
            </div>
            <div
              dir="rtl"
              className="max-h-[min(72vh,640px)] space-y-5 overflow-y-auto px-3.5 py-3.5"
            >
              {children}
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function ToolbarFilterSection({
  title,
  hint,
  children,
  fieldsClassName,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  fieldsClassName?: string;
}) {
  return (
    <section className="space-y-2.5">
      <div className="space-y-0.5">
        <h3 className="text-[11px] font-medium tracking-wide text-primary/50">
          {title}
        </h3>
        {hint ? (
          <p className="text-[11px] leading-relaxed text-primary/35">{hint}</p>
        ) : null}
      </div>
      <div
        className={
          fieldsClassName ??
          "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-3 gap-y-3"
        }
      >
        {children}
      </div>
    </section>
  );
}

export function ToolbarFilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-[11px] text-primary/60">{label}</p>
      {children}
    </div>
  );
}
