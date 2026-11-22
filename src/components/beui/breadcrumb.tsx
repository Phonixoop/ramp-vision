"use client";
// Adapted from beui.dev/components/motion/breadcrumb
// Overflow uses the project Popover instead of MorphPopover.

import { ChevronLeftIcon, MoreHorizontalIcon } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useIsPresent,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import {
  Children,
  createContext,
  useContext,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  useId,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/shadcn/popover";
import { EASE_OUT, SPRING_LAYOUT } from "~/components/beui/ease";
import { useHoverCapable } from "~/lib/hooks/use-hover-capable";
import { useMessages } from "~/lib/i18n";
import { cn } from "~/lib/utils";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const breadcrumbMessages = {
  label: "Breadcrumb",
  showHidden: "Show hidden paths",
};

export type BreadcrumbMessages = typeof breadcrumbMessages;

const BreadcrumbLabels = createContext<Partial<BreadcrumbMessages> | undefined>(
  undefined,
);

function useBreadcrumbMessages() {
  return useMessages(
    "breadcrumb",
    breadcrumbMessages,
    useContext(BreadcrumbLabels),
  );
}

export type BreadcrumbProps = ComponentPropsWithRef<"nav"> & {
  /** Override any built-in string. */
  labels?: Partial<BreadcrumbMessages>;
};

/** A navigation landmark. Keep it mounted while the route changes. */
export function Breadcrumb({
  className,
  children,
  labels,
  ...props
}: BreadcrumbProps) {
  const id = useId();
  const t = useMessages("breadcrumb", breadcrumbMessages, labels);
  return (
    <nav aria-label={t("label")} {...props} className={cn("min-w-0", className)}>
      <BreadcrumbLabels.Provider value={labels}>
        <LayoutGroup id={id}>{children}</LayoutGroup>
      </BreadcrumbLabels.Provider>
    </nav>
  );
}

export type BreadcrumbListProps = ComponentPropsWithRef<"ol"> & {
  /** Maximum visible slots, including the ellipsis. Minimum 3; Infinity disables collapsing. */
  maxItems?: number;
  /** Accessible label for the hidden ancestor disclosure. */
  overflowLabel?: string;
};

/** Pass keyed BreadcrumbItems directly so entering and leaving routes animate. */
export function BreadcrumbList({
  className,
  children,
  maxItems = 4,
  overflowLabel,
  ...props
}: BreadcrumbListProps) {
  const items = Children.toArray(children);
  const limit = Number.isFinite(maxItems) ? Math.max(3, Math.floor(maxItems)) : 4;
  const collapse = maxItems !== Infinity && items.length > limit;
  const tailCount = limit - 2;
  const visible = collapse
    ? [
        items[0],
        <BreadcrumbItem key="breadcrumb-overflow">
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis label={overflowLabel}>
            {items.slice(1, -tailCount)}
          </BreadcrumbEllipsis>
        </BreadcrumbItem>,
        ...items.slice(-tailCount),
      ]
    : items;
  return (
    <ol
      {...props}
      className={cn(
        "relative flex flex-wrap items-center gap-x-1 gap-y-1 text-sm",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {visible}
      </AnimatePresence>
    </ol>
  );
}

export type BreadcrumbItemProps = HTMLMotionProps<"li">;

/** Use a stable route key; put its optional separator inside this item. */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, style, children, ...props }, ref) {
    const reduce = useReducedMotion();
    const present = useIsPresent();
    const itemRef = useRef<HTMLLIElement>(null);
    useLayoutEffect(() => {
      const item = itemRef.current;
      if (!item || !present) return;
      const measure = () => {
        item.style.setProperty(
          "--breadcrumb-exit-width",
          `${item.getBoundingClientRect().width}px`,
        );
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(item);
      return () => observer.disconnect();
    }, [present]);
    const hidden = { opacity: 0, y: reduce ? 0 : 6 };
    return (
      <motion.li
        ref={(node) => {
          itemRef.current = node;
          if (typeof ref === "function") return ref(node);
          if (ref) ref.current = node;
        }}
        layout={reduce ? false : "position"}
        initial={hidden}
        animate={{ opacity: 1, y: 0 }}
        exit={hidden}
        transition={{ duration: 0.2, ease: EASE_OUT, layout: SPRING_LAYOUT }}
        {...props}
        inert={!present}
        aria-hidden={!present || undefined}
        style={{
          ...style,
          minWidth: present ? style?.minWidth : "var(--breadcrumb-exit-width)",
          pointerEvents: present ? style?.pointerEvents : "none",
        }}
        className={cn(
          "relative inline-flex min-w-0 max-w-full items-center gap-1",
          className,
        )}
      >
        {children}
      </motion.li>
    );
  },
);

export type BreadcrumbLinkProps = ComponentPropsWithRef<"a"> & {
  /** Render your router's Link, spreading these props onto it. */
  render?: (props: ComponentPropsWithRef<"a">) => ReactElement;
};

export function BreadcrumbLink({
  className,
  render,
  ...props
}: BreadcrumbLinkProps) {
  const linkProps = {
    ...props,
    className: cn(
      "inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-primary/55 transition-colors duration-150 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-third [&>svg]:size-3.5 [&>svg]:shrink-0",
      className,
    ),
  };
  return render ? render(linkProps) : <a {...linkProps} />;
}

export type BreadcrumbPageProps = ComponentPropsWithRef<"span">;

export function BreadcrumbPage({
  className,
  children,
  ...props
}: BreadcrumbPageProps) {
  return (
    <span
      {...props}
      aria-current="page"
      className={cn(
        "relative isolate inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-primary [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&>svg]:size-3.5 [&>svg]:shrink-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type BreadcrumbSeparatorProps = ComponentPropsWithRef<"span">;

/** Decorative separator, placed inside the following BreadcrumbItem. */
export function BreadcrumbSeparator({
  className,
  children,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      data-breadcrumb-separator=""
      className={cn(
        "inline-flex shrink-0 items-center text-primary/30 [&>svg]:size-3.5",
        className,
      )}
    >
      {children ?? <ChevronLeftIcon />}
    </span>
  );
}

export interface BreadcrumbEllipsisProps {
  /** Hidden BreadcrumbItems, in path order. */
  children: ReactNode;
  className?: string;
  label?: string;
}

/** Hover disclosure with click/touch toggle and keyboard access to ancestor links. */
export function BreadcrumbEllipsis({
  children,
  className,
  label,
}: BreadcrumbEllipsisProps) {
  const t = useBreadcrumbMessages();
  const [open, setOpen] = useState(false);
  const canHover = useHoverCapable();
  const present = useIsPresent();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLOListElement>(null);
  const focusOnOpen = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const leave = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (
        !panel.current?.contains(document.activeElement) &&
        document.activeElement !== trigger.current
      ) {
        setOpen(false);
      }
    }, 160);
  };
  useEffect(
    () => () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onFocus = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        event.target !== trigger.current &&
        !panel.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [open]);

  return (
    <Popover open={open && present} onOpenChange={setOpen}>
      <span
        className={cn(className)}
        onPointerEnter={(event) => {
          cancelClose();
          if (canHover && event.pointerType === "mouse") {
            focusOnOpen.current = false;
            setOpen(true);
          }
        }}
        onPointerLeave={leave}
      >
        <PopoverTrigger asChild>
          <button
            ref={trigger}
            type="button"
            aria-label={label ?? t("showHidden")}
            className="inline-flex size-8 items-center justify-center rounded-md text-primary/45 transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                focusOnOpen.current = true;
                setOpen(true);
                panel.current
                  ?.querySelector<HTMLElement>("a[href],button")
                  ?.focus();
              }
            }}
          >
            <MoreHorizontalIcon aria-hidden="true" className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-auto min-w-[10rem] max-w-[14rem] p-1.5"
          onPointerEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onPointerLeave={leave}
        >
          <BreadcrumbOverflowPaths
            ref={panel}
            focusOnOpen={focusOnOpen}
            onClick={(event) => {
              if ((event.target as Element).closest("a[href]")) setOpen(false);
            }}
          >
            {children}
          </BreadcrumbOverflowPaths>
        </PopoverContent>
      </span>
    </Popover>
  );
}

function BreadcrumbOverflowPaths({
  focusOnOpen,
  ref,
  ...props
}: ComponentPropsWithRef<"ol"> & { focusOnOpen: { current: boolean } }) {
  const localRef = useRef<HTMLOListElement>(null);
  useLayoutEffect(() => {
    if (!focusOnOpen.current) return;
    const focus = () =>
      localRef.current?.querySelector<HTMLElement>("a[href],button")?.focus();
    focus();
    const frame = requestAnimationFrame(() => {
      focus();
      focusOnOpen.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [focusOnOpen]);
  return (
    <ol
      {...props}
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      className="flex max-h-64 flex-col gap-0.5 overflow-y-auto [&>li]:w-full [&_a]:w-full [&_a]:py-1 [&_a]:[overflow-wrap:anywhere] [&_[data-breadcrumb-separator]]:hidden"
    />
  );
}
