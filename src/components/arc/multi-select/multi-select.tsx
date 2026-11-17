"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { motionTokens } from "../lib/motion-tokens";
import { rampArcStyle } from "../ramp-tokens";
import styles from "./multi-select.module.css";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  /** Visible label; also names the listbox. Hidden visually when `hideLabel` is set. */
  label: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
  /** Visually hide the label (still used for accessibility). */
  hideLabel?: boolean;
  /** Compact trigger for toolbar / filter popovers. */
  size?: "md" | "sm";
  /** Cap rendered options; search still runs over the full list. */
  itemsPerPage?: number;
  /** Replace multi-select with single choice (closes after pick). */
  singleSelect?: boolean;
  searchPlaceholder?: string;
  clearLabel?: string;
  emptyLabel?: string;
  prevPageLabel?: string;
  nextPageLabel?: string;
}

const DEFAULT_ITEMS_PER_PAGE = 50;

const enter = motionTokens.ease.enter;
const standard = motionTokens.ease.standard;

const slot: Variants = {
  hidden: { width: 0, opacity: 0 },
  shown: {
    width: "auto",
    opacity: 1,
    transition: {
      width: motionTokens.spring.smooth,
      opacity: { duration: motionTokens.duration.fast, ease: enter },
    },
  },
  gone: {
    width: 0,
    opacity: 0,
    transition: {
      width: motionTokens.spring.smooth,
      opacity: { duration: motionTokens.duration.instant, ease: standard },
    },
  },
};

const chip: Variants = {
  hidden: { scale: 0.9, filter: `blur(${motionTokens.blur.soft}px)` },
  shown: {
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...motionTokens.spring.snappy,
      filter: { duration: motionTokens.duration.standard, ease: enter },
    },
  },
  gone: {
    scale: 0.9,
    filter: `blur(${motionTokens.blur.subtle}px)`,
    transition: { duration: motionTokens.duration.instant, ease: standard },
  },
};

const fade: Variants = {
  hidden: { opacity: 0 },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionTokens.duration.instant },
  },
  gone: {
    opacity: 0,
    transition: { duration: motionTokens.duration.instant },
  },
};

const slotFade: Variants = {
  hidden: { opacity: 0 },
  shown: {
    width: "auto",
    opacity: 1,
    transition: { duration: motionTokens.duration.instant },
  },
  gone: {
    opacity: 0,
    transition: { duration: motionTokens.duration.instant },
  },
};

const chipStill: Variants = {
  hidden: { scale: 1, filter: "blur(0px)" },
  shown: { scale: 1, filter: "blur(0px)" },
  gone: { scale: 1, filter: "blur(0px)" },
};

const roll: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: `${direction * 0.5}em`,
    filter: `blur(${motionTokens.blur.subtle}px)`,
  }),
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionTokens.duration.standard, ease: enter },
  },
  gone: (direction: number) => ({
    opacity: 0,
    y: `${direction * -0.5}em`,
    filter: `blur(${motionTokens.blur.subtle}px)`,
    transition: { duration: motionTokens.duration.instant, ease: standard },
  }),
};

function CheckMark({ reduce }: { reduce: boolean | null }) {
  return (
    <svg
      className={styles.check}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d="M4 12.5 9 17.5 20 6.5"
        initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
        transition={
          reduce
            ? { duration: motionTokens.duration.instant }
            : {
                pathLength: {
                  duration: motionTokens.duration.standard,
                  ease: enter,
                },
                opacity: { duration: motionTokens.duration.instant },
              }
        }
      />
    </svg>
  );
}

/**
 * Arc multi-select (https://uiarc.dev/components/multi-select), adapted for Ramp:
 * controlled filters, RTL, single-select, search + pagination for large option lists,
 * and a portaled menu so it works inside overflow-clipped Linear filter popovers.
 */
export function MultiSelect({
  label,
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "انتخاب کنید",
  description,
  maxVisible = 2,
  disabled = false,
  className,
  hideLabel = false,
  size = "md",
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  singleSelect = false,
  searchPlaceholder = "جستجو...",
  clearLabel = "پاک کردن انتخاب‌ها",
  emptyLabel = "موردی یافت نشد",
  prevPageLabel = "قبلی",
  nextPageLabel = "بعدی",
}: MultiSelectProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const selected = value ?? internal;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const labelFor = (item: string) =>
    options.find((option) => option.value === item)?.label ?? item;
  const visible = selected
    .slice(0, maxVisible)
    .map((item) => ({ value: item, label: labelFor(item) }));
  const remaining = Math.max(0, selected.length - visible.length);

  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setActiveIndex(-1);
      setSearchTerm("");
      setCurrentPage(1);
    }
  }

  const [previousRemaining, setPreviousRemaining] = useState(remaining);
  const [countDirection, setCountDirection] = useState(1);
  if (previousRemaining !== remaining) {
    setPreviousRemaining(remaining);
    setCountDirection(remaining > previousRemaining ? 1 : -1);
  }

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [options, searchTerm]);

  const needsPagination = options.length > itemsPerPage;
  const showSearch = true;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOptions.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * itemsPerPage;
  // Cap DOM nodes for huge lists (BranchName etc.); small lists render in full.
  const pageOptions = needsPagination
    ? filteredOptions.slice(pageStart, pageStart + itemsPerPage)
    : filteredOptions;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, options]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const gap = 8;
      const viewportPadding = 8;
      const preferredHeight = Math.min(360, window.innerHeight * 0.55);
      const spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
      const spaceAbove = rect.top - gap - viewportPadding;
      const placeAbove =
        spaceBelow < Math.min(220, preferredHeight) && spaceAbove > spaceBelow;
      const maxHeight = Math.max(
        160,
        Math.min(preferredHeight, placeAbove ? spaceAbove : spaceBelow),
      );
      // Floor width so long option labels (branch names) can wrap readably.
      const width = Math.max(rect.width, 260);

      setMenuStyle({
        position: "fixed",
        left: Math.min(
          Math.max(viewportPadding, rect.left),
          window.innerWidth - width - viewportPadding,
        ),
        width,
        top: placeAbove ? undefined : rect.bottom + gap,
        bottom: placeAbove
          ? window.innerHeight - rect.top + gap
          : undefined,
        maxHeight,
        zIndex: 90,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, pageOptions.length, needsPagination, totalPages]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const update = (next: string[]) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const toggle = (option: MultiSelectOption) => {
    if (disabled || option.disabled) return;
    if (singleSelect) {
      const next = selectedSet.has(option.value) ? [] : [option.value];
      update(next);
      setOpen(false);
      return;
    }
    update(
      selectedSet.has(option.value)
        ? selected.filter((item) => item !== option.value)
        : [...selected, option.value],
    );
  };

  const clear = () => {
    update([]);
    setOpen(false);
  };

  const enabledPageIndexes = pageOptions
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      const option = pageOptions[activeIndex];
      if (option) toggle(option);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      enabledPageIndexes.length
    ) {
      event.preventDefault();
      setOpen(true);
      const current = enabledPageIndexes.indexOf(activeIndex);
      const next =
        current < 0
          ? event.key === "ArrowDown"
            ? 0
            : enabledPageIndexes.length - 1
          : event.key === "ArrowDown"
            ? (current + 1) % enabledPageIndexes.length
            : (current - 1 + enabledPageIndexes.length) %
              enabledPageIndexes.length;
      setActiveIndex(enabledPageIndexes[next]!);
    }
  };

  const reduce = useReducedMotion();

  const menuNode = (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="menu"
          ref={menuRef}
          id={`${id}-listbox`}
          className={styles.menu}
          role="listbox"
          data-arc-multi-select-menu=""
          aria-label={label}
          aria-multiselectable={singleSelect ? undefined : "true"}
          style={{ ...rampArcStyle, ...menuStyle }}
          onPointerDown={(event) => event.stopPropagation()}
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: reduce
              ? { duration: motionTokens.duration.instant }
              : {
                  ...motionTokens.spring.snappy,
                  opacity: {
                    duration: motionTokens.duration.fast,
                    ease: enter,
                  },
                },
          }}
          exit={{
            opacity: 0,
            ...(reduce ? {} : { y: -4, scale: 0.98 }),
            transition: {
              duration: motionTokens.duration.instant,
              ease: standard,
            },
          }}
        >
          {showSearch ? (
            <input
              type="search"
              className={styles.search}
              value={searchTerm}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            />
          ) : null}
          <div className={styles.options}>
            {pageOptions.length === 0 ? (
              <div className={styles.empty}>{emptyLabel}</div>
            ) : (
              pageOptions.map((option, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedSet.has(option.value)}
                  aria-disabled={option.disabled || undefined}
                  key={option.value}
                  className={styles.option}
                  data-active={activeIndex === index}
                  disabled={option.disabled}
                  onPointerMove={() => {
                    if (activeIndex !== index) setActiveIndex(index);
                  }}
                  onClick={() => toggle(option)}
                >
                  <span title={option.label}>{option.label}</span>
                  <AnimatePresence initial={false}>
                    {selectedSet.has(option.value) ? (
                      <CheckMark key="check" reduce={reduce} />
                    ) : null}
                  </AnimatePresence>
                </button>
              ))
            )}
          </div>
          {needsPagination && totalPages > 1 ? (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                onMouseDown={(event) => event.preventDefault()}
              >
                {prevPageLabel}
              </button>
              <div className={styles.pageMeta}>
                <strong>{safePage}</strong>
                <span>از</span>
                <strong>{totalPages}</strong>
              </div>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                onMouseDown={(event) => event.preventDefault()}
              >
                {nextPageLabel}
              </button>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div
      ref={rootRef}
      className={[styles.field, className].filter(Boolean).join(" ")}
      style={rampArcStyle}
      data-size={size}
    >
      <span
        id={labelId}
        className={hideLabel ? styles.srOnly : styles.label}
      >
        {label}
      </span>
      <div className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${selected.length ? styles.hasClear : ""}`}
          disabled={disabled}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={onKeyDown}
        >
          <span id={valueId} className={styles.srOnly}>
            {selected.length ? selected.map(labelFor).join("، ") : placeholder}
          </span>
          <span className={styles.value} aria-hidden="true">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <motion.span
                  key={`chip-${item.value}`}
                  className={styles.slot}
                  variants={reduce ? slotFade : slot}
                  initial="hidden"
                  animate="shown"
                  exit="gone"
                >
                  <motion.span
                    className={styles.chip}
                    variants={reduce ? chipStill : chip}
                    title={item.label}
                  >
                    {item.label}
                  </motion.span>
                </motion.span>
              ))}
              {remaining > 0 ? (
                <motion.span
                  key="more"
                  className={styles.slot}
                  variants={reduce ? slotFade : slot}
                  initial="hidden"
                  animate="shown"
                  exit="gone"
                >
                  <motion.span
                    className={styles.more}
                    variants={reduce ? chipStill : chip}
                  >
                    +
                    <span className={styles.count}>
                      <AnimatePresence initial={false} custom={countDirection}>
                        <motion.span
                          key={remaining}
                          custom={countDirection}
                          variants={reduce ? fade : roll}
                          initial="hidden"
                          animate="shown"
                          exit="gone"
                        >
                          {remaining}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </motion.span>
                </motion.span>
              ) : null}
              {!selected.length ? (
                <motion.span
                  key="placeholder"
                  className={styles.placeholder}
                  variants={fade}
                  initial="hidden"
                  animate="shown"
                  exit="gone"
                >
                  {placeholder}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </span>
          <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {selected.length > 0 && !disabled ? (
            <motion.button
              type="button"
              aria-label={clearLabel}
              className={styles.clear}
              onClick={clear}
              initial={
                reduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.7,
                      filter: `blur(${motionTokens.blur.subtle}px)`,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: reduce
                  ? { duration: motionTokens.duration.instant }
                  : {
                      ...motionTokens.spring.snappy,
                      opacity: { duration: motionTokens.duration.fast },
                    },
              }}
              exit={{
                opacity: 0,
                ...(reduce
                  ? {}
                  : {
                      scale: 0.7,
                      filter: `blur(${motionTokens.blur.subtle}px)`,
                    }),
                transition: {
                  duration: motionTokens.duration.instant,
                  ease: standard,
                },
              }}
              whileTap={{
                scale: reduce ? 1 : 0.96,
                transition: {
                  duration: motionTokens.duration.instant,
                  ease: standard,
                },
              }}
            >
              <X size={14} aria-hidden="true" />
            </motion.button>
          ) : null}
        </AnimatePresence>
        {mounted ? createPortal(menuNode, document.body) : null}
      </div>
      {description ? (
        <span className={styles.description}>{description}</span>
      ) : null}
    </div>
  );
}
