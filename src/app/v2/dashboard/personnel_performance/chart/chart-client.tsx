"use client";

import { useMemo } from "react";
// import { useEffect, useMemo, useState } from "react"; // scroll-shrink needs useEffect + useState
import { useParams, useRouter } from "next/navigation";
import { MapPinnedIcon } from "lucide-react";
import { Layout, LinearEmptyState } from "~/components/linear-shell";
import { SwitchControl } from "~/components/shadcn/switch-control";
import { cn } from "~/lib/utils";
import { ChartBreadcrumb } from "./components/chart-breadcrumb";
import { ChartTopToolbar } from "./components/top-toolbar";
import { CitiesPanel } from "./components/cities-panel";
import { CityDetailPane } from "./components/city-detail-pane";
import { PersonnelCalendarRail } from "./components/personnel-calendar-rail";
import { PersonnelPanel } from "./components/personnel-panel";
import { CitySessionProvider } from "./city-session-context";
import { useChartFilters } from "./filters-context";

// --- Scroll-shrink side panels (disabled; uncomment to restore) ---
// const LIST_COMPACT_SCROLL_THRESHOLD = 24;

export function ChartClient() {
  const params = useParams<{ city?: string }>();
  const router = useRouter();
  const {
    filters,
    totalWorkDays,
    useWorkDays,
    canFetch,
    isCitiesLoading,
    updateFilter,
  } = useChartFilters();

  // Scroll-shrink: keep panels expanded. Restore listsCompact + detailScrollEl + effects below to re-enable.
  const listsCompact = false;
  // const [listsCompact, setListsCompact] = useState(false);
  // // Callback-ref node so the scroll listener re-binds when the detail pane mounts
  // // (a plain useRef + [activeCity] effect can miss the element or go stale).
  // const [detailScrollEl, setDetailScrollEl] = useState<HTMLDivElement | null>(
  //   null,
  // );

  const activeCity = useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  // useEffect(() => {
  //   setListsCompact(false);
  // }, [activeCity]);

  // useEffect(() => {
  //   const el = detailScrollEl;
  //   if (!el || !activeCity) return;

  //   const onScroll = () => {
  //     const { scrollTop, scrollHeight, clientHeight } = el;
  //     setListsCompact((prev) => {
  //       // Shrinking the rails widens the detail pane; content can reflow so
  //       // overflow disappears and scrollTop clamps to 0. Stay compact then;
  //       // only expand when the pane can scroll and the user is back at top.
  //       if (prev) {
  //         const canScroll = scrollHeight > clientHeight + 1;
  //         return canScroll ? scrollTop > 0 : true;
  //       }
  //       return scrollTop > LIST_COMPACT_SCROLL_THRESHOLD;
  //     });
  //   };

  //   onScroll();
  //   el.addEventListener("scroll", onScroll, { passive: true });
  //   return () => el.removeEventListener("scroll", onScroll);
  // }, [detailScrollEl, activeCity]);

  const statusText = !canFetch
    ? "در انتظار فیلترهای لازم…"
    : isCitiesLoading
      ? "در حال بارگذاری استان‌ها…"
      : useWorkDays && totalWorkDays
        ? `روز کاری: ${totalWorkDays}`
        : "آماده";

  const railWidth = "lg:w-[300px]";
  // const railWidth = listsCompact ? "lg:w-[5.25rem]" : "lg:w-[300px]";

  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChartTopToolbar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Layout.InnerTopBar>
          <Layout.InnerTopBar.Leading className="min-w-0 max-w-[min(100%,32rem)] shrink">
            <ChartBreadcrumb />
          </Layout.InnerTopBar.Leading>
          <Layout.InnerTopBar.Filters>
            <label className="inline-flex h-8 items-center gap-2 rounded-md px-1 text-[11px] text-primary/55">
              <span className="whitespace-nowrap">روز کاری</span>
              <SwitchControl
                checked={!!filters.work_days}
                onCheckedChange={(checked) =>
                  updateFilter("work_days", checked)
                }
                disabled={!totalWorkDays}
                aria-label="محاسبه بر اساس روز کاری"
              />
              {totalWorkDays ? (
                <span className="tabular-nums text-primary/45">
                  ({totalWorkDays})
                </span>
              ) : (
                <span className="hidden text-primary/40 sm:inline">
                  فقط ماهانه
                </span>
              )}
            </label>
          </Layout.InnerTopBar.Filters>
          <Layout.InnerTopBar.Actions>
            <span className="text-[11px] text-primary/50" aria-live="polite">
              {statusText}
            </span>
            {activeCity ? (
              <button
                type="button"
                className="inline-flex h-8 items-center rounded-md border border-border-color/15 px-2.5 text-xs text-primary/70 transition-colors hover:bg-primary/5"
                onClick={() => {
                  const query =
                    typeof window !== "undefined"
                      ? window.location.search
                      : "";
                  router.push(
                    `/v2/dashboard/personnel_performance/chart${query}`,
                    { scroll: false },
                  );
                }}
              >
                بازگشت
              </button>
            ) : null}
          </Layout.InnerTopBar.Actions>
        </Layout.InnerTopBar>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 md:p-4">
          {activeCity ? (
            <CitySessionProvider>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
                {/* RTL: physical right = first in DOM — city, personnel, calendar, then detail */}
                <aside
                  className={cn(
                    "flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-fourth transition-[width] duration-300 ease-out",
                    "lg:sticky lg:top-0 lg:self-stretch",
                    railWidth,
                  )}
                >
                  <CitiesPanel compact={listsCompact} />
                </aside>

                <aside
                  className={cn(
                    "flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-fourth transition-[width] duration-300 ease-out",
                    "lg:sticky lg:top-0 lg:self-stretch",
                    railWidth,
                  )}
                >
                  <PersonnelPanel compact={listsCompact} />
                </aside>

                <aside
                  className={cn(
                    "flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-fourth",
                    "lg:sticky lg:top-0 lg:w-[272px] lg:self-stretch",
                  )}
                >
                  <PersonnelCalendarRail />
                </aside>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-fourth">
                  <div
                    // ref={setDetailScrollEl} // scroll-shrink
                    className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4"
                  >
                    <CityDetailPane />
                  </div>
                </div>
              </div>
            </CitySessionProvider>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
              <aside
                className={cn(
                  "flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-fourth transition-[width] duration-300 ease-out",
                  "lg:sticky lg:top-0 lg:self-stretch",
                  "lg:w-[340px]",
                  // listsCompact ? "lg:w-[5.25rem]" : "lg:w-[340px]", // scroll-shrink
                )}
              >
                <CitiesPanel compact={listsCompact} />
              </aside>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-color/10 bg-fourth">
                <LinearEmptyState
                  icon={MapPinnedIcon}
                  title="استانی انتخاب نشده"
                  description="برای دیدن جزئیات عملکرد، یک استان را از فهرست سمت راست انتخاب کنید. فیلترها با آدرس صفحه همگام‌اند."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
