"use client";

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "~/lib/utils";

type SlotName = "leading" | "title" | "filters" | "actions" | "mobileFilters";

type SlotProps = {
  children?: ReactNode;
  className?: string;
};

function createSlot(name: SlotName, displayPrefix: string) {
  function Slot(_props: SlotProps) {
    return null;
  }
  Slot.displayName = `${displayPrefix}.${name}`;
  Slot.slotName = name;
  return Slot;
}

const Leading = createSlot("leading", "Layout.TopBar");
const Title = createSlot("title", "Layout.TopBar");
const Filters = createSlot("filters", "Layout.TopBar");
const Actions = createSlot("actions", "Layout.TopBar");
const MobileFilters = createSlot("mobileFilters", "Layout.TopBar");

type SlotComponent = typeof Leading & { slotName: SlotName };

function getSlots(children: ReactNode) {
  const slots: Partial<Record<SlotName, ReactElement<SlotProps>>> = {};

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const slotName = (child.type as SlotComponent | undefined)?.slotName;
    if (!slotName) return;
    slots[slotName] = child as ReactElement<SlotProps>;
  });

  return slots;
}

function slotChildren(slot: ReactElement<SlotProps> | undefined) {
  return slot?.props.children;
}

function slotClassName(slot: ReactElement<SlotProps> | undefined) {
  return slot?.props.className;
}

type TopBarRootProps = {
  children: ReactNode;
  className?: string;
};

const TOP_BAR_SCROLL =
  "overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const TOP_BAR_ROW = "flex h-12 min-w-[40rem] items-center gap-3 px-4";
const INNER_TOP_BAR_ROW =
  "flex h-12 min-w-[36rem] items-center gap-2 px-3 sm:gap-3 sm:px-4";

function TopBarRoot({ children, className }: TopBarRootProps) {
  const slots = getSlots(children);
  const title = slotChildren(slots.title);
  const filters = slotChildren(slots.filters);
  const actions = slotChildren(slots.actions);
  const leading = slotChildren(slots.leading);

  return (
    <header
      dir="rtl"
      className={cn(
        "sticky top-0 z-20 shrink-0 border-b border-border-color/10 bg-fourth backdrop-blur-md",
        className,
      )}
    >
      <div className={TOP_BAR_SCROLL}>
        <div className={TOP_BAR_ROW}>
          {leading ? (
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5",
                slotClassName(slots.leading),
              )}
            >
              {leading}
            </div>
          ) : null}

          {title != null && title !== false ? (
            <div
              className={cn(
                "min-w-0 max-w-56 shrink-0",
                slotClassName(slots.title),
              )}
            >
              <h1 className="truncate text-sm font-semibold tracking-tight text-primary">
                {title}
              </h1>
            </div>
          ) : null}

          {filters ? (
            <>
              <div
                className="mx-1 h-5 w-px shrink-0 bg-border-color/15"
                aria-hidden
              />
              <div
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 overflow-hidden",
                  slotClassName(slots.filters),
                )}
              >
                {filters}
              </div>
            </>
          ) : null}

          {actions ? (
            <div
              className={cn(
                "ms-auto flex shrink-0 items-center gap-1.5 [&>*]:shrink-0",
                slotClassName(slots.actions),
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function InnerTopBarRoot({ children, className }: TopBarRootProps) {
  const slots = getSlots(children);
  const title = slotChildren(slots.title);
  const filters = slotChildren(slots.filters);
  const actions = slotChildren(slots.actions);
  const leading = slotChildren(slots.leading);

  return (
    <header
      dir="rtl"
      className={cn(
        "sticky top-0 z-10 shrink-0 border-b border-border-color/10 bg-third/90 backdrop-blur-md",
        className,
      )}
    >
      <div className={TOP_BAR_SCROLL}>
        <div className={INNER_TOP_BAR_ROW}>
          {leading ? (
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5",
                slotClassName(slots.leading),
              )}
            >
              {leading}
            </div>
          ) : null}

          {title != null && title !== false ? (
            <span
              className={cn(
                "max-w-40 shrink-0 truncate text-xs font-medium tracking-tight text-primary/55",
                slotClassName(slots.title),
              )}
            >
              {title}
            </span>
          ) : null}

          {filters ? (
            <>
              {(title != null && title !== false) || leading ? (
                <div
                  className="mx-0.5 h-5 w-px shrink-0 bg-border-color/15"
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 overflow-hidden",
                  slotClassName(slots.filters),
                )}
              >
                {filters}
              </div>
            </>
          ) : null}

          {actions ? (
            <div
              className={cn(
                "ms-auto flex shrink-0 items-center gap-1.5 [&>*]:shrink-0",
                slotClassName(slots.actions),
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

const TopBar = Object.assign(TopBarRoot, {
  Leading,
  Title,
  Filters,
  Actions,
  MobileFilters,
});

const InnerTopBar = Object.assign(InnerTopBarRoot, {
  Leading,
  Title,
  Label: Title,
  Filters,
  Actions,
  MobileFilters,
});

export const Layout = {
  TopBar,
  InnerTopBar,
};
