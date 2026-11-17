"use client";

import { useMemo, useState } from "react";
import {
  Contact2Icon,
  SearchIcon,
  ArrowUpDownIcon,
  ArrowDownAZIcon,
  ArrowUpAZIcon,
} from "lucide-react";
import SegmentedControl from "~/components/arc/segmented-control/segmented-control";
import { MultiSelect } from "~/components/arc/multi-select/multi-select";
import { rampArcStyle } from "~/components/arc/ramp-tokens";
import { PerformanceSpark } from "~/components/bklit";
import { LinearEmptyState } from "~/components/linear-shell";
import { TEHRAN_SUB_CITIES } from "~/constants";
import { performanceLevels } from "~/constants/personnel-performance";
import { TrendDecider } from "~/features/trend-decider";
import { cn } from "~/lib/utils";
import {
  getPersonnelDisplayName,
  sparkChartForPersonnel,
} from "~/utils/personnel-performance";
import { getPerformanceTextEn } from "~/utils/util";
import {
  useCitySession,
  type PersonRecord,
  type Rating,
  type TehranSubCity,
} from "../city-session-context";
import { useChartFilters } from "../filters-context";

const TEHRAN_LABELS: Record<Exclude<TehranSubCity, null>, string> = {
  "Tehran Jobran": "جبران",
  "Tehran Not Jobran": "غیر جبران",
  "Tehran InDirect": "غیر مستقیم",
};

function personKey(person: PersonRecord | null | undefined) {
  if (!person) return "";
  return [
    person.NationalCode,
    person.NameFamily,
    person.Role,
    person.CityName || person.key?.CityName,
  ].join("|");
}

export function PersonnelPanel({ compact = false }: { compact?: boolean }) {
  const {
    currentCity,
    isTehran,
    selectedPerson,
    levelFilter,
    setLevelFilter,
    tehranSubCities,
    displayedList,
    pageLoading,
    getAll,
    setTehranSubCities,
    onSelectPerson,
  } = useCitySession();
  const {
    personnelSort: sortOrder,
    setPersonnelSort: setSortOrder,
  } = useChartFilters();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let next = displayedList;
    if (q) {
      next = next.filter((row) =>
        (row.NameFamily ?? "").toString().toLowerCase().includes(q),
      );
    }
    if (sortOrder === "original") return next;
    const sorted = [...next];
    sorted.sort((a, b) => {
      const aa = (a.NameFamily ?? "").toString();
      const bb = (b.NameFamily ?? "").toString();
      const comparison = aa.localeCompare(bb, "fa", { numeric: true });
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [displayedList, searchQuery, sortOrder]);

  const levelOptions = useMemo(
    () => [
      { value: "ALL", label: "همه" },
      ...performanceLevels.map((level) => ({
        value: level.enText,
        label: level.text,
      })),
    ],
    [],
  );

  const tehranOptions = useMemo(
    () =>
      TEHRAN_SUB_CITIES.map((city) => ({
        value: city,
        label: TEHRAN_LABELS[city],
      })),
    [],
  );

  const skeleton = pageLoading && filteredSorted.length === 0;
  const rows = skeleton
    ? Array.from({ length: 8 }, () => undefined as PersonRecord | undefined)
    : filteredSorted;

  if (!currentCity) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-fourth">
      {!compact ? (
        <div className="shrink-0 space-y-2.5 border-b border-border-color/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Contact2Icon
                className={cn(
                  "size-4 text-primary/60",
                  skeleton && "animate-pulse",
                )}
              />
              پرسنل
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
              placeholder="جستجوی نام…"
              disabled={skeleton}
              className="h-8 w-full rounded-lg border border-border-color/10 bg-third pe-8 ps-2.5 text-xs text-primary outline-none transition-colors placeholder:text-primary/35 focus:border-border-color/25 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSortOrder(
                  sortOrder === "original"
                    ? "asc"
                    : sortOrder === "asc"
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

          <div className="space-y-2" style={rampArcStyle}>
            {isTehran ? (
              <MultiSelect
                label="زیرمجموعه تهران"
                hideLabel
                size="sm"
                placeholder="زیرمجموعه تهران"
                options={tehranOptions}
                value={tehranSubCities}
                onValueChange={(values) =>
                  setTehranSubCities(values as TehranSubCity[])
                }
              />
            ) : null}
            <SegmentedControl
              label="سطح عملکرد"
              fullWidth
              value={levelFilter}
              onValueChange={(value) => setLevelFilter(value as Rating)}
              options={levelOptions}
            />
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-center border-b border-border-color/10 px-1 py-2">
          <Contact2Icon className="size-4 text-primary/55" />
        </div>
      )}

      <div className="rail-scroll min-h-0 flex-1 overflow-y-auto p-1.5">
        {rows.length === 0 && !skeleton ? (
          <LinearEmptyState
            icon={Contact2Icon}
            title="پرسنلی نیست"
            description="با فیلترهای فعلی کسی در این استان نیست."
            className="py-8"
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {rows.map((user, index) => {
              if (!user?.NationalCode) {
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

              const isActive = personKey(selectedPerson) === personKey(user);
              return (
                <li key={`${personKey(user)}-${index}`}>
                  <PersonnelRailRow
                    user={user}
                    isActive={isActive}
                    compact={compact}
                    getAllData={
                      (getAll?.data as { result?: any[] } | undefined)
                        ?.result ?? []
                    }
                    onSelect={(sparkData) =>
                      onSelectPerson(
                        user,
                        sparkData,
                        "",
                        (
                          getAll?.data as
                            | { periodType?: string }
                            | undefined
                        )?.periodType,
                      )
                    }
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

function PersonnelRailRow({
  user,
  isActive,
  compact,
  getAllData,
  onSelect,
}: {
  user: PersonRecord;
  isActive: boolean;
  compact: boolean;
  getAllData: any[];
  onSelect: (sparkData: any[]) => void;
}) {
  const displayName = getPersonnelDisplayName(
    user.NameFamily ?? "",
    user.CityName || user.key?.CityName,
    user.RealCityName,
  );

  const userPerformances = useMemo(
    () =>
      (getAllData || [])
        .filter((x: any) => x.NameFamily === user.NameFamily)
        .map((m: any) => m.TotalPerformance),
    [getAllData, user.NameFamily],
  );

  const sparkData = useMemo(
    () =>
      sparkChartForPersonnel(
        getAllData,
        "NameFamily",
        user.NameFamily,
        ["BranchName", "Role"],
        {
          NationalCode: user.NationalCode,
          CityName: user.CityName || user.key?.CityName,
        },
      ),
    [
      getAllData,
      user.NameFamily,
      user.NationalCode,
      user.CityName,
      user.key?.CityName,
    ],
  );

  const levelColor = performanceLevels.find(
    (level) => level.enText === getPerformanceTextEn(user.TotalPerformance),
  )?.color;

  return (
    <button
      type="button"
      title={displayName}
      onClick={() => onSelect(sparkData)}
      className={cn(
        "group flex w-full items-center rounded-xl border text-right transition-colors",
        compact ? "justify-center px-1 py-2" : "gap-2 px-2.5 py-2",
        isActive
          ? "border-accent/35 bg-accent/10 text-primary"
          : "border-transparent bg-third/70 text-primary hover:border-border-color/15 hover:bg-third",
      )}
    >
      {compact ? (
        <span className="w-full break-words text-center text-[11px] leading-tight">
          {displayName}
        </span>
      ) : (
        <>
          <span
            className="mt-0.5 size-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor:
                levelColor ?? "rgb(var(--primary) / 0.25)",
            }}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium leading-5">
              {displayName}
            </span>
            <span className="block truncate text-[10px] text-primary/45">
              {user.Role || "—"}
            </span>
          </span>
          <span className="hidden w-16 shrink-0 sm:block xl:block">
            <PerformanceSpark
              className="pointer-events-none h-7 w-16 opacity-80"
              data={sparkData}
              height={28}
              interactive={false}
            />
          </span>
          <span className="flex shrink-0 flex-col items-center gap-0.5 text-[11px] tabular-nums text-primary/70">
            <TrendDecider values={userPerformances} />
            {Math.round(user.TotalPerformance || 0)}%
          </span>
        </>
      )}
    </button>
  );
}
