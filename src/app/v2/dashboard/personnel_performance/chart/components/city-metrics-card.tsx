/**
 * City-level KPI + part-to-whole card for the v2 personnel-performance chart.
 *
 * Reads only what `CitySessionProvider` already computed for the selected city
 * (`displayedList`, `pageLoading`) — it adds no query, no filter and no
 * `enabled` flag, so it cannot disturb the chart data wiring.
 *
 * The part-to-whole is the *performance-band* breakdown of the personnel in the
 * current city/filter (4 bands, from the shared `performanceLevels`). That is a
 * genuine part-to-whole, and it is small enough for a donut:
 * - ≤6 slices, largest first at 12 o'clock, direct `٪` labels, value table.
 * - Automatically degrades to a 100% stacked bar when the bands are within 5%
 *   of each other (a pie nobody can read) — see `shouldUseStackedBar`.
 */
"use client";

import { useMemo } from "react";

import { performanceLevels } from "~/constants/personnel-performance";
import { getPerformanceTextEn } from "~/utils/util";
import { useCitySession } from "../city-session-context";
import { ChartCard, KpiStat } from "./chart-card";
import { formatFaDecimal, formatFaNumber, formatFaPercent } from "./chart-format";
import {
  CompositionDonut,
  CompositionStackedBar,
  shouldUseStackedBar,
  type CompositionSlice,
} from "./composition-chart";

/**
 * Brand-tinted band fills; labels carry the meaning, colour only reinforces it.
 *
 * Alpha tints use the legacy comma form — the theme tokens are comma-separated
 * channel triplets, so `rgb(var(--primary) / 0.78)` is invalid CSS and painted
 * black. See the note in `composition-chart.tsx`.
 */
const BAND_FILLS: Record<string, string> = {
  Weak: "rgb(var(--accent))",
  Good: "rgba(var(--primary), 0.78)",
  Excellent: "rgba(var(--accent), 0.55)",
  NeedsReview: "rgba(var(--primary), 0.62)",
};

/** ok-max target from the shared performance bands. */
const TARGET_PERCENT = 100;

export function CityMetricsCard({ className }: { className?: string }) {
  const { currentCity, displayedList, pageLoading } = useCitySession();

  const stats = useMemo(() => {
    const rows = displayedList ?? [];
    const performances = rows
      .map((row) => Number(row.TotalPerformance))
      .filter((value) => Number.isFinite(value));

    const total = performances.length;
    const mean =
      total > 0
        ? performances.reduce((sum, value) => sum + value, 0) / total
        : 0;
    const atRisk = performances.filter((value) => value < 70).length;
    const onTarget = performances.filter(
      (value) => value >= 70 && value <= 100,
    ).length;

    const bucket = new Map<string, number>();
    for (const row of rows) {
      const enText = getPerformanceTextEn(row.TotalPerformance);
      if (!enText) continue;
      bucket.set(enText, (bucket.get(enText) ?? 0) + 1);
    }

    const slices: CompositionSlice[] = performanceLevels
      .map((level) => ({
        label: level.text,
        value: bucket.get(level.enText) ?? 0,
        color: BAND_FILLS[level.enText],
      }))
      .filter((slice) => slice.value > 0);

    return { rows, total, mean, atRisk, onTarget, slices };
  }, [displayedList]);

  const useStackedBar = useMemo(
    () => shouldUseStackedBar(stats.slices),
    [stats.slices],
  );

  const loading = pageLoading && stats.rows.length === 0;
  const isEmpty = !loading && stats.rows.length === 0;

  return (
    <ChartCard
      className={className}
      loading={loading}
      isEmpty={isEmpty}
      minHeightClassName="min-h-[15rem]"
      skeletonVariant="kpi"
      subtitle={`${formatFaNumber(stats.total)} نفر در این استان؛ پراکندگی سطح عملکرد`}
      title={`شاخص‌های استان${currentCity ? ` — ${currentCity}` : ""}`}
      empty={
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-xs leading-relaxed text-primary/70">
            برای این استان با فیلترهای فعلی پرسنلی ثبت نشده است. بازه گزارش یا
            سطح عملکرد را تغییر دهید.
          </p>
        </div>
      }
    >
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="grid min-w-0 grid-cols-2 gap-2 self-start">
          <KpiStat
            label="میانگین عملکرد"
            progress={stats.mean}
            statusText={
              stats.mean >= 70 ? "در محدوده هدف" : "زیر هدف"
            }
            targetLabel={`هدف: ${formatFaPercent(TARGET_PERCENT)}`}
            tone={stats.mean >= 70 ? "positive" : "negative"}
            unit="٪"
            value={formatFaDecimal(Math.round(stats.mean * 10) / 10)}
          />
          <KpiStat
            label="در محدوده هدف"
            progress={
              stats.total > 0 ? (stats.onTarget / stats.total) * 100 : null
            }
            statusText={`${formatFaNumber(stats.onTarget)} نفر`}
            targetLabel="بازه ۷۰ تا ۱۰۰ درصد"
            tone="positive"
            unit="٪"
            value={formatFaPercent(
              stats.total > 0 ? (stats.onTarget / stats.total) * 100 : 0,
            )}
          />
          <KpiStat
            className="col-span-2"
            label="زیر آستانه ۷۰٪"
            progress={
              stats.total > 0 ? (stats.atRisk / stats.total) * 100 : null
            }
            statusText={stats.atRisk > 0 ? "نیازمند بررسی" : "بدون مورد"}
            targetLabel="کمتر از ۳۰٪ نفرات"
            tone={stats.atRisk > 0 ? "warning" : "positive"}
            unit="نفر"
            value={formatFaNumber(stats.atRisk)}
          />
        </div>

        <div className="min-w-0">
          {useStackedBar ? (
            <div className="flex min-w-0 flex-col gap-2">
              <p className="text-xs leading-relaxed text-primary/70">
                اختلاف سهم سطح‌ها کمتر از ۵٪ است؛ برای مقایسهٔ دقیق، نمایش
                پشته‌ای جای نمودار دایره‌ای را گرفته است.
              </p>
              <CompositionStackedBar
                formatValue={(value) => `${formatFaNumber(value)} نفر`}
                slices={stats.slices}
              />
            </div>
          ) : (
            <CompositionDonut
              formatTotal={(value) => `${formatFaNumber(value)} نفر`}
              formatValue={(value) => formatFaNumber(value)}
              slices={stats.slices}
              totalLabel="کل نفرات"
            />
          )}
        </div>
      </div>
    </ChartCard>
  );
}
