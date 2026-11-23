"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  ChevronLeftIcon,
  PackageIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  TableIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

export type LinearNavLink = {
  href: string;
  label: string;
  icon: typeof UsersIcon;
  match?: (pathname: string) => boolean;
};

const DEFAULT_LINKS: LinearNavLink[] = [
  {
    href: "/v2/dashboard/personnels",
    label: "پرسنل",
    icon: UsersIcon,
    match: (pathname) => pathname.startsWith("/v2/dashboard/personnels"),
  },
  {
    href: "/v2/dashboard/personnel_performance/chart",
    label: "نمودار عملکرد",
    icon: BarChart3Icon,
    match: (pathname) =>
      pathname.startsWith("/v2/dashboard/personnel_performance/chart"),
  },
  {
    href: "/v2/dashboard/personnel_performance/table",
    label: "جدول عملکرد",
    icon: TableIcon,
    match: (pathname) =>
      pathname.startsWith("/v2/dashboard/personnel_performance/table"),
  },
  {
    href: "/v2/dashboard/depo",
    label: "دپو",
    icon: PackageIcon,
    match: (pathname) => pathname.startsWith("/v2/dashboard/depo"),
  },
];

type LinearSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  links?: LinearNavLink[];
  className?: string;
};

export function LinearSidebar({
  collapsed,
  onCollapsedChange,
  links = DEFAULT_LINKS,
  className,
}: LinearSidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      dir="rtl"
      className={cn(
        "flex h-full flex-col border-s border-border-color/10 bg-secondary px-2 py-3",
        className,
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center gap-2 px-1",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? (
          <p className="truncate px-1 text-xs font-semibold tracking-tight text-primary/70">
            رمپ v2
          </p>
        ) : null}
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md text-primary/55 transition-colors hover:bg-fourth hover:text-primary"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
        >
          {collapsed ? (
            <PanelRightOpenIcon className="size-4" />
          ) : (
            <PanelRightCloseIcon className="size-4" />
          )}
        </button>
      </div>

      <nav aria-label="بخش‌های داشبورد" className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.match
            ? link.match(pathname)
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-fourth text-primary"
                  : "text-primary/60 hover:bg-fourth/70 hover:text-primary",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed ? (
                <>
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                  {active ? (
                    <ChevronLeftIcon className="size-3.5 opacity-50" />
                  ) : null}
                </>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
