"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPinnedIcon } from "lucide-react";
import SegmentedControl from "~/components/arc/segmented-control/segmented-control";
import { rampArcStyle } from "~/components/arc/ramp-tokens";
import { Layout, LinearEmptyState } from "~/components/linear-shell";
import { cn } from "~/lib/utils";
import { getEnglishToPersianCity } from "~/utils/util";
import { ChartTopToolbar } from "./components/top-toolbar";
import { CitiesPanel } from "./components/cities-panel";
import { CityDetailPane } from "./components/city-detail-pane";
import { PersonnelCalendarRail } from "./components/personnel-calendar-rail";
import { PersonnelPanel } from "./components/personnel-panel";
import { CitySessionProvider } from "./city-session-context";
import { useChartFilters } from "./filters-context";

const LIST_COMPACT_SCROLL_THRESHOLD = 24;

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

  const detailScrollRef = useRef<HTMLDivElement>(null);
  const [listsCompact, setListsCompact] = useState(false);

  const activeCity = useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  useEffect(() => {
    setListsCompact(false);
    const el = detailScrollRef.current;
    if (!el || !activeCity) return;

    const onScroll = () => {
      setListsCompact(el.scrollTop > LIST_COMPACT_SCROLL_THRESHOLD);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeCity]);

  const statusText = !canFetch
    ? "در انتظار فیلترهای لازم…"
    : isCitiesLoading
      ? "در حال بارگذاری استان‌ها…"
      : useWorkDays && totalWorkDays
        ? `روز کاری: ${totalWorkDays}`
        : "آماده";

  const railWidth = listsCompact ? "lg:w-[5.25rem]" : "lg:w-[300px]";

  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChartTopToolbar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Layout.InnerTopBar>
          <Layout.InnerTopBar.Title>
            {activeCity
              ? getEnglishToPersianCity(activeCity)
              : "انتخاب استان"}
          </Layout.InnerTopBar.Title>
          <Layout.InnerTopBar.Filters>
            <div className="flex items-center gap-2" style={rampArcStyle}>
              <span className="text-[11px] text-primary/55">روز کاری</span>
              <SegmentedControl
                value={filters.work_days ? "on" : "off"}
                onValueChange={(value) =>
                  updateFilter("work_days", value === "on")
                }
                options={[
                  { value: "off", label: "خاموش" },
                  { value: "on", label: "روشن" },
                ]}
              />
            </div>
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
                    ref={detailScrollRef}
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
                  listsCompact ? "lg:w-[5.25rem]" : "lg:w-[340px]",
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
