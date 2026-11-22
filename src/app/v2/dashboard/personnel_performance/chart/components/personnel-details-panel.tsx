"use client";

import React, { useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { Badge } from "~/components/arc/badge/badge";
import { MetricCard } from "~/components/arc/metric-card/metric-card";
import { rampArcStyle } from "~/components/arc/ramp-tokens";
import { PerformanceGauge, PerformanceSpark } from "~/components/bklit";
import PerformanceBadgesLazy from "~/components/main/performance-badges";
import {
  PersonnelPerformanceGroups,
  PersonnelPerformanceTranslate,
  performanceLevels,
  type PersonnelPerformanceGroup,
} from "~/constants/personnel-performance";
import { ButtonWithModal } from "~/ui/button-with-modal";
import type { PeriodType } from "~/context/personnel-filter.context";
import {
  getMonthNamesFromJOINED_date_strings,
  getPersonnelDisplayName,
  normalizeNationalCode,
} from "~/utils/personnel-performance";
import { getPerformanceTextEn } from "~/utils/util";
import {
  useCitySession,
  type PersonRecord,
} from "../city-session-context";
import { NumericalMetricsPanel } from "./numerical-metrics-panel";

const SUMMARY_KEYS = new Set([
  "TotalPerformance",
  "DirectPerFormance",
  "InDirectPerFormance",
]);

const META_BADGE_BASE_KEYS = ["Role", "ContractType"] as const;
const META_BADGE_EXTRA_KEYS = ["RoleType", "ProjectType"] as const;

const META_CELL_BASE_KEYS = ["CityName", "TownName"] as const;

const META_CELL_EXTRA_KEYS = [
  "BranchCode",
  "BranchName",
  "BranchType",
  "DateInfo",
  "Start_Date",
] as const;

const BADGE_COLORS = [
  "teal",
  "sky",
  "orchid",
  "violet",
  "rose",
  "amber",
] as const;

function personField(
  person: PersonRecord,
  key: string,
): string | number | null | undefined {
  const raw =
    person[key] ?? (person.key as Record<string, unknown> | undefined)?.[key];
  if (raw == null || raw === "") return null;
  return raw as string | number;
}

function formatMetricValue(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return 0;
  const n = Number(value);
  return Number.isInteger(n) ? n : Number(n.toFixed(2));
}

/**
 * v2 personnel detail sheet — Linear-styled grid composed from Arc MetricCard /
 * Badge, beUI AnimatedNumber, and Bklit gauges/sparks. Keeps v1 PersonnelDetails intact.
 */
export function PersonnelDetailsPanel() {
  const {
    currentCity,
    selectedPerson,
    setSelectedPerson,
    getAll,
  } = useCitySession();
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const getAllData = getAll?.data as
    | {
        periodType?: string;
        dateLength?: unknown;
        result?: any[];
      }
    | undefined;

  const metaBadgeKeys = showExtraDetails
    ? [...META_BADGE_BASE_KEYS, ...META_BADGE_EXTRA_KEYS]
    : [...META_BADGE_BASE_KEYS];
  const metaCellKeys = showExtraDetails
    ? [...META_CELL_BASE_KEYS, ...META_CELL_EXTRA_KEYS]
    : [...META_CELL_BASE_KEYS];

  const numericItemsMap = useMemo(() => {
    if (!selectedPerson) return new Map<string, number | null>();
    const map = new Map<string, number | null>();
    Object.entries(selectedPerson).forEach(([k, v]) => {
      if (typeof v === "number" || k === "Empty") {
        map.set(k, v as number | null);
      }
    });
    return map;
  }, [selectedPerson]);

  const groupedMetrics = useMemo(() => {
    const items: Array<{
      group: PersonnelPerformanceGroup;
      items: Array<[string, number | null]>;
    }> = [];

    PersonnelPerformanceGroups.forEach((group) => {
      const groupItems: Array<[string, number | null]> = [];
      group.keys.forEach((key) => {
        if (SUMMARY_KEYS.has(key) || key === "Empty") return;
        if (numericItemsMap.has(key)) {
          groupItems.push([key, numericItemsMap.get(key)!]);
        }
      });
      if (groupItems.length > 0) {
        items.push({ group, items: groupItems });
      }
    });

    return items;
  }, [numericItemsMap]);

  const flatMetrics = useMemo(
    () => groupedMetrics.flatMap((g) => g.items),
    [groupedMetrics],
  );

  const numericalItems = useMemo(
    () =>
      flatMetrics
        .filter(([key]) => key !== "Empty")
        .map(([key, value]) => ({
          key,
          value: formatMetricValue(value),
        })),
    [flatMetrics],
  );

  const dateLength = useMemo(() => {
    const fromKey = Number(
      (selectedPerson as { key?: { rowCount?: number } } | null)?.key
        ?.rowCount,
    );
    if (Number.isFinite(fromKey) && fromKey > 0) return fromKey;
    return 1;
  }, [selectedPerson]);

  const displayName = useMemo(() => {
    if (!selectedPerson) return "";
    return getPersonnelDisplayName(
      String(selectedPerson.NameFamily ?? selectedPerson.key?.NameFamily ?? ""),
      String(selectedPerson.CityName ?? selectedPerson.key?.CityName ?? ""),
      selectedPerson.RealCityName as string | null | undefined,
    );
  }, [selectedPerson]);

  const level = useMemo(() => {
    if (!selectedPerson) return null;
    const en = getPerformanceTextEn(selectedPerson.TotalPerformance ?? 0);
    return performanceLevels.find((l) => l.enText === en) ?? null;
  }, [selectedPerson]);

  const sparkData = (selectedPerson as any)?.sparkData as any[] | undefined;

  if (!selectedPerson || !currentCity) {
    return null;
  }

  const total = formatMetricValue(selectedPerson.TotalPerformance);
  const direct = formatMetricValue(selectedPerson.DirectPerFormance);
  const indirect = formatMetricValue(selectedPerson.InDirectPerFormance);
  const periodLabel =
    (selectedPerson as any).periodType || getAllData?.periodType || "بازه";
  const personnelCode = personField(selectedPerson, "PersonnelCode");
  const nationalCodeRaw = personField(selectedPerson, "NationalCode");
  const nationalCode =
    nationalCodeRaw != null
      ? normalizeNationalCode(nationalCodeRaw) || String(nationalCodeRaw)
      : null;

  return (
    <div
      className="flex flex-col gap-4 p-3 sm:p-4"
      dir="rtl"
      style={rampArcStyle}
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border-color/10 pb-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight text-primary">
              {displayName}
            </h2>
            {personnelCode != null || nationalCode != null ? (
              <div
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-primary/50"
                dir="ltr"
              >
                {personnelCode != null ? (
                  <span
                    className="font-mono tabular-nums"
                    title={PersonnelPerformanceTranslate.PersonnelCode}
                  >
                    {String(personnelCode)}
                  </span>
                ) : null}
                {personnelCode != null && nationalCode != null ? (
                  <span className="text-primary/25" aria-hidden>
                    ·
                  </span>
                ) : null}
                {nationalCode != null ? (
                  <span
                    className="font-mono tabular-nums"
                    title={PersonnelPerformanceTranslate.NationalCode}
                  >
                    {nationalCode}
                  </span>
                ) : null}
              </div>
            ) : null}
            {level ? (
              <Badge
                size="sm"
                tone={
                  level.enText === "Excellent" || level.enText === "Good"
                    ? "success"
                    : level.enText === "Weak"
                      ? "danger"
                      : level.enText === "NeedsReview"
                        ? "warning"
                        : "neutral"
                }
                dot
              >
                {level.text}
              </Badge>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {metaBadgeKeys.map((key, index) => {
              const value = personField(selectedPerson, key);
              if (value == null) return null;
              return (
                <Badge
                  key={key}
                  size="sm"
                  color={BADGE_COLORS[index % BADGE_COLORS.length]}
                  outline
                >
                  {String(value)}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {sparkData && sparkData.length > 0 ? (
            <PerformanceSpark
              className="h-8 w-24 opacity-90"
              data={sparkData}
              height={32}
              interactive={false}
            />
          ) : null}
          <button
            type="button"
            onClick={() => setSelectedPerson(null)}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border-color/10 bg-fourth text-primary/55 transition-colors hover:bg-primary/5 hover:text-primary"
            aria-label="بستن جزئیات پرسنل"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Numerical metrics (Cloud Spend–style) — prominent at top */}
      <NumericalMetricsPanel
        items={numericalItems}
        dateLength={dateLength}
        totalPerformance={selectedPerson.TotalPerformance}
        className="min-w-0"
      />

      {/* Summary KPI metric cards */}
      <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <MetricCard
          label={PersonnelPerformanceTranslate.TotalPerformance}
          value={total}
          suffix="%"
          context={periodLabel}
          change={level?.text}
        />
        <MetricCard
          label={PersonnelPerformanceTranslate.DirectPerFormance}
          value={direct}
          suffix="%"
          context="مستقیم"
        />
        <MetricCard
          label={PersonnelPerformanceTranslate.InDirectPerFormance}
          value={indirect}
          suffix="%"
          context="غیر مستقیم"
        />
      </section>

      {/* Gauges */}
      <section className="rounded-2xl border border-border-color/10 bg-fourth/60 p-3">
        <PerformanceBadgesLazy />
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-start">
          <PerformanceGauge
            className="min-w-0"
            label="کلی"
            value={selectedPerson.TotalPerformance}
          />
          <PerformanceGauge
            className="min-w-0"
            label="مستقیم"
            value={selectedPerson.DirectPerFormance}
          />
          <PerformanceGauge
            className="min-w-0"
            label="غیر مستقیم"
            value={selectedPerson.InDirectPerFormance}
          />
        </div>
      </section>

      {/* Meta */}
      <aside className="flex min-w-0 flex-col gap-3">
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-medium tracking-wide text-primary/45">
              مشخصات
            </h3>
            <button
              type="button"
              onClick={() => setShowExtraDetails((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-border-color/10 bg-fourth px-2 py-1 text-[10px] text-primary/65 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              {showExtraDetails ? (
                <ChevronUpIcon className="size-3" />
              ) : (
                <ChevronDownIcon className="size-3" />
              )}
              {showExtraDetails ? "مخفی کردن اطلاعات بیشتر" : "نمایش اطلاعات بیشتر"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {metaCellKeys.map((key) => {
              let value = personField(selectedPerson, key);
              if (value == null) return null;
              if (key === "Start_Date") {
                value = getMonthNamesFromJOINED_date_strings(
                  String(value),
                  getAllData?.periodType as PeriodType | undefined,
                );
              }
              return (
                <div
                  key={key}
                  className="rounded-xl border border-border-color/10 bg-fourth px-2.5 py-2"
                >
                  <div className="text-[10px] text-primary/45">
                    {PersonnelPerformanceTranslate[key] ?? key}
                  </div>
                  <div className="mt-0.5 break-words text-xs font-medium text-primary">
                    {String(value)}
                  </div>
                </div>
              );
            })}
          </div>
          <RolesByBranchModal selectedPerson={selectedPerson} />
        </section>
      </aside>
    </div>
  );
}

function RolesByBranchModal({
  selectedPerson,
}: {
  selectedPerson: PersonRecord;
}) {
  const grouped = useMemo(() => {
    if (!selectedPerson?.sparkData)
      return [] as {
        key: string;
        branch: string;
        role: string;
        startDates: string[];
      }[];
    const map = new Map<
      string,
      { branch: string; role: string; startDates: string[] }
    >();
    for (const day of selectedPerson.sparkData) {
      const k = `${day.BranchName}-${day.Role}`;
      if (!map.has(k))
        map.set(k, { branch: day.BranchName, role: day.Role, startDates: [] });
      map.get(k)!.startDates.push(day.Start_Date);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
  }, [selectedPerson?.sparkData]);

  return (
    <ButtonWithModal
      buttonProps={{
        className:
          "w-full rounded-xl border border-border-color/15 bg-fourth px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/5",
      }}
      buttonChildren={<span>واحد پذیرش / نقش‌ها</span>}
      modalProps={{
        title: `نقش‌های ${getPersonnelDisplayName(
          selectedPerson?.NameFamily ?? "",
          selectedPerson?.CityName ?? selectedPerson?.key?.CityName,
          selectedPerson?.RealCityName,
        )}`,
        size: "sm",
        center: true,
        className: "bg-third",
      }}
    >
      {() => (
        <div className="flex flex-col gap-2 p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-color/15">
                <th className="p-2 text-right font-medium text-primary/70">
                  شعبه
                </th>
                <th className="p-2 text-right font-medium text-primary/70">
                  نقش
                </th>
                <th className="p-2 text-right font-medium text-primary/70">
                  تاریخ
                </th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => (
                <tr key={row.key} className="border-b border-border-color/10">
                  <td className="p-2 text-primary/80">
                    {row.branch || "نامشخص"}
                  </td>
                  <td className="p-2 text-primary/80">{row.role || "نامشخص"}</td>
                  <td className="p-2 text-primary/80">
                    {row.startDates.length > 1 ? (
                      <ButtonWithModal
                        buttonProps={{
                          className:
                            "rounded-md bg-fourth px-2 py-1 text-[11px] text-primary/70 hover:bg-primary/5",
                        }}
                        buttonChildren={<span>تاریخ‌ها</span>}
                        modalProps={{
                          title: "تاریخ",
                          size: "sm",
                          center: true,
                          className: "bg-third",
                        }}
                      >
                        {() => (
                          <div className="flex flex-col gap-2 p-4 text-xs text-primary/70">
                            {row.startDates.slice(1).map((date, i) => (
                              <div key={i}>{date}</div>
                            ))}
                          </div>
                        )}
                      </ButtonWithModal>
                    ) : row.startDates.length > 0 ? (
                      row.startDates[0]
                    ) : (
                      "نامشخص"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ButtonWithModal>
  );
}
