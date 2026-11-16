"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { LinearSidebar } from "./linear-sidebar";

export const LINEAR_SHEET_RADIUS_PX = 24;
export const LINEAR_TABLE_RADIUS_PX = 16;
export const LINEAR_SHEET_PAD_PX = 8;

const SIDEBAR_EXPANDED_PX = 220;
const SIDEBAR_COLLAPSED_PX = 64;
const NARROW_MQ = "(max-width: 767px)";
const SPRING = { type: "spring" as const, stiffness: 380, damping: 36 };

type LinearShellProps = {
  children: ReactNode;
};

function useIsNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ);
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isNarrow;
}

/**
 * Linear-style chrome: dark outer frame, lighter rounded content sheet,
 * sidebar on the physical right (LTR flex order — independent of RTL text).
 */
export function LinearShell({ children }: LinearShellProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname() ?? "";
  const isNarrow = useIsNarrowViewport();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isNarrow) setMobileOpen(false);
  }, [isNarrow]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_PX : SIDEBAR_EXPANDED_PX;

  return (
    <div className="flex h-svh w-full overflow-hidden bg-secondary text-primary">
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col pb-8 pe-1 ps-2 pt-2">
        <motion.main
          dir="rtl"
          layout={!reduceMotion && !isNarrow}
          initial={reduceMotion ? false : { opacity: 0.94 }}
          animate={{ opacity: 1 }}
          transition={{
            layout: SPRING,
            opacity: { duration: 0.28, ease: "easeOut" },
          }}
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-third"
        >
          {children}
        </motion.main>

        <div className="pointer-events-none absolute inset-x-2 bottom-1.5 z-30 flex items-center justify-between md:hidden">
          <button
            type="button"
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] text-primary/55 transition-colors hover:bg-fourth hover:text-primary",
              mobileOpen && "bg-fourth text-primary",
            )}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XIcon className="size-3.5" />
            ) : (
              <MenuIcon className="size-3.5" />
            )}
            <span>منو</span>
          </button>
        </div>
      </div>

      <div
        className="hidden h-svh shrink-0 md:block"
        style={{ width: sidebarWidth }}
      >
        <LinearSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>

      <AnimatePresence>
        {isNarrow && mobileOpen ? (
          <motion.button
            key="linear-nav-backdrop"
            type="button"
            aria-label="بستن منو"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isNarrow && mobileOpen ? (
          <motion.div
            key="linear-mobile-nav"
            className="fixed inset-y-0 end-0 z-50 w-[220px] md:hidden"
            initial={reduceMotion ? false : { x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LinearSidebar
              collapsed={false}
              onCollapsedChange={() => setMobileOpen(false)}
              className="border-s-0 bg-third shadow-2xl"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
