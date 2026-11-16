"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BuildingIcon,
  SearchIcon,
  ArrowUpDownIcon,
  ArrowDownAZIcon,
  ArrowUpAZIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { TEHRAN_RELATED_CITIES } from "~/constants";
import { LinearEmptyState } from "~/components/linear-shell";
import { cn } from "~/lib/utils";
import type { CityWithPerformanceData } from "~/types";
import {
  distinctDataAndCalculatePerformance,
  sparkChartForCity,
} from "~/utils/personnel-performance";
import { getPersianToEnglishCity } from "~/utils/util";
import { useChartFilters } from "../filters-context";
import { CityRailRow } from "./city-button";

export function CitiesPanel({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const params = useParams<{ city?: string }>();
  const {
    citiesQuery,
    isCitiesLoading,
    canFetch,
    useWorkDays,
    totalWorkDays,
  } = useChartFilters();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "original">(
    "original",
  );
  const [navigatingToCity, setNavigatingToCity] = useState<string | null>(null);

  const activeCity = useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  useEffect(() => {
    setNavigatingToCity(null);
  }, [activeCity]);

  const distincedData: CityWithPerformanceData[] = useMemo(
    () =>
      distinctDataAndCalculatePerformance(
        citiesQuery.data,
        ["CityName"],
        [
          "SabtAvalieAsnad",
          "PazireshVaSabtAvalieAsnad",
          "ArzyabiAsanadBimarsetaniDirect",
          "ArzyabiAsnadBimarestaniIndirect",
          "ArzyabiAsnadDandanVaParaDirect",
          "ArzyabiAsnadDandanVaParaIndirect",
          "ArzyabiAsnadDandanDirect",
          "ArzyabiAsnadDandanIndirect",
          "ArzyabiAsnadDaroDirect",
          "ArzyabiAsnadDaroIndirect",
          "WithScanCount",
          "WithoutScanCount",
          "WithoutScanInDirectCount",
          "ArchiveDirectCount",
          "ArchiveInDirectCount",
          "ArzyabiVisitDirectCount",
          "ArzyabiVisitInDirectCount",
          "COUNT",
          "TotalPerformance",
          "DirectPerFormance",
          "InDirectPerFormance",
        ],
        {},
        useWorkDays ? totalWorkDays : null,
      ) ?? [],
    [citiesQuery.data, useWorkDays, totalWorkDays],
  );

  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let next = distincedData;
    if (q) {
      next = next.filter((row) =>
        (row.CityName_Fa ?? "").toString().toLowerCase().includes(q),
      );
    }
    if (sortOrder === "original") return next;
    const sorted = [...next];
    sorted.sort((a, b) => {
      const aa = (a.CityName_Fa ?? "").toString();
      const bb = (b.CityName_Fa ?? "").toString();
      const comparison = aa.localeCompare(bb, "fa", { numeric: true });
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [distincedData, searchQuery, sortOrder]);

  function handleNavigate(cityName: string) {
    setNavigatingToCity(cityName);
    if (activeCity === cityName) {
      setTimeout(() => setNavigatingToCity(null), 100);
      return;
    }
    const query = typeof window !== "undefined" ? window.location.search : "";
    router.push(
      `/v2/dashboard/personnel_performance/chart/${encodeURIComponent(cityName)}${query}`,
      { scroll: false },
    );
  }

  const skeleton = isCitiesLoading && filteredSorted.length === 0;
  const rows = skeleton
    ? Array.from(
        { length: 8 },
        () => undefined as CityWithPerformanceData | undefined,
      )
    : filteredSorted;

  const citiesResult =
    (citiesQuery.data as { result?: any[] } | undefined)?.result ?? [];

  if (!canFetch) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-fourth">
        <LinearEmptyState
          icon={BuildingIcon}
          title="در انتظار فیلترها"
          description="پس از آماده‌شدن بازه گزارش و تاریخ گزارش پرسنل، فهرست استان‌ها بارگذاری می‌شود."
          className="py-10"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-fourth">
      {!compact ? (
        <div className="shrink-0 space-y-2.5 border-b border-border-color/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <BuildingIcon
                className={cn(
                  "size-4 text-primary/60",
                  skeleton && "animate-pulse",
                )}
              />
              استان
            </div>
            <span className="rounded-md bg-third px-2 py-0.5 text-[11px] tabular-nums text-primary/55">
              {filteredSorted.length}
            </span>
          </div>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-primary/40" />
            <input
              type="search"
              dir="rtl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی استان…"
              disabled={skeleton}
              className="h-8 w-full rounded-lg border border-border-color/10 bg-third pe-8 ps-2.5 text-xs text-primary outline-none transition-colors placeholder:text-primary/35 focus:border-border-color/25 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "original"
                    ? "asc"
                    : prev === "asc"
                      ? "desc"
                      : "original",
                )
              }
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-color/10 bg-third px-2 text-[11px] text-primary/70 transition-colors hover:bg-primary/5"
            >
              مرتب‌سازی
              {sortOrder === "original" ? (
                <ArrowUpDownIcon className="size-3.5" />
              ) : sortOrder === "asc" ? (
                <ArrowDownAZIcon className="size-3.5" />
              ) : (
                <ArrowUpAZIcon className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-center border-b border-border-color/10 px-1 py-2">
          <BuildingIcon className="size-4 text-primary/55" />
        </div>
      )}

      <div className="rail-scroll min-h-0 flex-1 overflow-y-auto p-1.5">
        {rows.length === 0 && !skeleton ? (
          <LinearEmptyState
            icon={BuildingIcon}
            title="استانی یافت نشد"
            description="با فیلترهای فعلی داده‌ای برای استان‌ها وجود ندارد."
            className="py-8"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {rows.map((item, index) => {
              if (!item?.CityName_En) {
                return (
                  <li key={`skeleton-${index}`}>
                    <div
                      className={cn(
                        "animate-pulse rounded-xl bg-third",
                        compact ? "h-9" : "h-14",
                      )}
                    />
                  </li>
                );
              }

              const isActive = item.CityName_En === activeCity;
              const relatedCities =
                item.CityName_En === "Tehran"
                  ? [...TEHRAN_RELATED_CITIES]
                  : undefined;

              const cityPerformances = citiesResult
                .filter((row: { CityName?: string }) =>
                  relatedCities
                    ? relatedCities.includes(
                        getPersianToEnglishCity(row?.CityName),
                      )
                    : getPersianToEnglishCity(row?.CityName) ===
                      item.CityName_En,
                )
                .map(
                  (row: { TotalPerformance?: number }) =>
                    row?.TotalPerformance,
                );

              return (
                <li key={`${item.CityName_En}-${index}`}>
                  <CityRailRow
                    item={item}
                    isActive={isActive}
                    isNavigating={navigatingToCity === item.CityName_En}
                    compact={compact}
                    sparkChartData={sparkChartForCity(
                      citiesResult,
                      "CityName",
                      item.CityName_En,
                      relatedCities,
                    )}
                    cityPerformances={cityPerformances}
                    onNavigate={handleNavigate}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
