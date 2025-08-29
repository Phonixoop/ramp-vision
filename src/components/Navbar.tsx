"use client";

import * as React from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { NAV_MENUS, STATIC_LINKS, type NavMenu } from "./navData";

type ActiveKey = NavMenu["key"] | null;

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Variants for smooth sliding content with fade effects
const contentVariants = {
  enter: (dir: number) => ({
    x: dir * 100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: -dir * 100,
    opacity: 0,
  }),
};

export function Navbar() {
  const [active, setActive] = React.useState<ActiveKey>(null);
  const [lastIndex, setLastIndex] = React.useState<number>(-1);
  const [isOverViewport, setIsOverViewport] = React.useState(false);
  const isOpen = active !== null;

  const activeIndex = active
    ? NAV_MENUS.findIndex((m) => m.key === active)
    : -1;
  const direction =
    lastIndex === -1 || activeIndex === -1
      ? 1
      : activeIndex > lastIndex
      ? 1
      : -1;

  // close menu when leaving both triggers and viewport
  React.useEffect(() => {
    if (!isOpen) return;
    if (isOverViewport) return;
    const onDocMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest("[data-nav-root]") ||
        target.closest("[data-nav-viewport]")
      ) {
        // still within nav
      } else {
        setActive(null);
        setLastIndex(-1);
      }
    };
    document.addEventListener("mousemove", onDocMove);
    return () => document.removeEventListener("mousemove", onDocMove);
  }, [isOpen, isOverViewport]);

  return (
    <div
      data-nav-root
      className="relative z-50 w-full border-b border-white/10 bg-red-50 backdrop-blur supports-[backdrop-filter]:bg-secondary/60"
      onMouseLeave={() => {
        if (!isOverViewport) {
          setActive(null);
          setLastIndex(-1);
        }
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2">
        <a href="/" className="mr-2 font-semibold text-primary">
          Brand
        </a>
        <nav className="relative">
          <ul className="flex items-center gap-1">
            {NAV_MENUS.map((menu, idx) => {
              const isActive = active === menu.key;
              return (
                <li key={menu.key}>
                  <button
                    type="button"
                    aria-expanded={isActive}
                    onMouseEnter={() => {
                      setLastIndex((prev) => (prev === -1 ? idx : prev));
                      setActive(menu.key);
                    }}
                    onFocus={() => setActive(menu.key)}
                    className={classNames(
                      "group relative  rounded-full px-3 py-1 text-sm/6 transition-colors",
                      "text-primary/80 hover:bg-secbuttn hover:text-primary focus:outline-none",
                      isActive && "text-primary",
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      {menu.label}
                      <svg
                        aria-hidden
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        className={classNames(
                          "transition-transform duration-200",
                          isActive ? "rotate-180" : "rotate-0",
                        )}
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.0607 6.75L11.5303 7.2803 8.7071 10.1035c-.3905.3906-1.0237.3906-1.4142 0L4.4697 7.2803 3.9393 6.75 5 5.6893l.5303.5304L8 8.6893l2.4697-2.4696L11 5.6893 12.0607 6.75Z"
                        />
                      </svg>
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="trigger-pill"
                        className="bg-[var(--accent)]/10 absolute inset-0 z-0 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                  </button>

                  <AnimatePresence mode="wait">
                    <Viewport
                      onPointerEnter={() => setIsOverViewport(true)}
                      onPointerLeave={() => {
                        setIsOverViewport(false);
                        setActive(null);
                        setLastIndex(-1);
                      }}
                      isOpen={isOpen}
                    >
                      <motion.div
                        key={menu.key}
                        custom={direction}
                        variants={contentVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          ease: "linear",
                          duration: 0.6,
                          height: { duration: 0.6, ease: "linear" },
                          width: { duration: 0.6, ease: "linear" },
                        }}
                        className="w-full"
                        style={{ overflow: "hidden" }}
                        layout
                      >
                        <MenuGrid menuKey={menu.key} />
                      </motion.div>
                    </Viewport>
                  </AnimatePresence>
                </li>
              );
            })}

            {STATIC_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="rounded-full px-3 py-1.5 text-sm/6 text-primary/80 hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="#"
            className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-primary/80 hover:text-primary"
          >
            Sign in
          </a>
          <a
            href="#"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-black"
          >
            Start now
          </a>
        </div>
      </div>
    </div>
  );
}

function Viewport({
  children,
  onPointerEnter,
  onPointerLeave,
  isOpen,
}: React.PropsWithChildren<{
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  isOpen: boolean;
}>) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      data-nav-viewport
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      initial={{ opacity: 0, scale: 0.92, display: isOpen ? "block" : "none" }}
      animate={{ opacity: 1, scale: 1, display: isOpen ? "block" : "none" }}
      exit={{ opacity: 0, scale: 0.92, display: "none" }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { duration: 0.2 },
        scale: { duration: 0.25 },
      }}
      className="absolute left-0 top-full mt-2 origin-top-left overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-2xl shadow-black/50"
      style={{
        willChange: isPresent ? ("opacity, transform" as any) : undefined,
        minWidth: "min(92vw, 720px)",
        maxWidth: "min(92vw, 720px)",
      }}
      layout
      layoutRoot
    >
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

function MenuGrid({ menuKey }: { menuKey: string }) {
  const menu = NAV_MENUS.find((m) => m.key === menuKey)!;
  return (
    <div className="grid grid-cols-2 gap-8">
      {menu.sections.map((section) => (
        <div key={section.heading}>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary/60">
            {section.heading}
          </div>
          <ul className="space-y-2">
            {section.items.map((it) => (
              <li key={it.title}>
                <a
                  href={it.href}
                  className="hover:bg-[var(--accent)]/5 group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 text-primary/80">
                    ■
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-primary group-hover:text-[var(--accent)]">
                      {it.title}
                    </span>
                    <span className="block text-xs text-primary/60">
                      {it.description}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Navbar;
