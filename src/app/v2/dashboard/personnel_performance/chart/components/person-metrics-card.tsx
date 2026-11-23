/**
 * Person-level metric card for the v2 personnel-performance chart page.
 *
 * One card, four blocks, all from data the page already holds
 * (`selectedPerson`, `sparkData`, `periodLabel`) — no query, no filter change:
 *
 * 1. KPI tiles — value, target and status **as text** (never colour alone).
 * 2. Direct vs indirect — a genuine 2-slice part-to-whole, so a donut fits;
 *    it degrades to the 100% stacked bar when the two shares converge.
 * 3. Trend — the daily spark series as a labelled line/area chart with the
 *    4-point rule, stroke-pattern differentiation and a value table.
 * 4. Gauges — the per-band rings, with the target and the band thresholds
 *    written out beside them.
 */
"use client";

import { useMemo } from "react";

import { performanceLevels } from "~/constants/personnel-performance";
import { PerformanceGauge } from "~/components/bklit";
import { ChartCard, KpiStat, type KpiTone } from "./chart-card";
import {
  formatFaDecimal,
  formatFaNumber,
  formatFaPercent,
} from "./chart-format";
import {
  CompositionDonut,
  CompositionStackedBar,
  shouldUseStackedBar,
  type CompositionSlice,
} from "./composition-chart";
import { TrendChart, type TrendSeries } from "./trend-chart";

/** ok-max benchmark used across the page. */
export const TARGET_PERCENT = 100;
/** Below this the person is flagged. */
const AT_RISK_PERCENT = 70;

/**
 * Written-out band thresholds. They mirror `performanceLevels` but as Persian
 * text, because a colour swatch plus a bare number does not say which side of
 * the boundary a value falls on — and the bands are not evenly spaced.
 */
const BAND_RANGE: Record<string, string> = {
  Weak: "کمتر از ۷۰٪",
  Good: "۷۰٪ تا ۱۰۰٪",
  Excellent: "۱۰۰٪ تا ۱۳۰٪",
  NeedsReview: "بیش از ۱۳۰٪",
};

export type PersonMetricInput = {
  total?: number | null;
  direct?: number | null;
  indirect?: number | null;
  /** Daily rows; `TotalPerformance` / `Start_Date` at minimum. */
  sparkData?: Array<Record<string, unknown>> | null;
  periodLabel?: string;
  levelText?: string | null;
};

function toNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function statusFor(value: number | null): { text: string; tone: KpiTone } {
  if (value == null) return { text: "بدون داده", tone: "neutral" };
  if (value < AT_RISK_PERCENT) return { text: "ضعیف", tone: "negative" };
  if (value <= TARGET_PERCENT) return { text: "خوب", tone: "positive" };
  if (value <= 130) return { text: "عالی", tone: "positive" };
  return { text: "نیازمند بررسی", tone: "warning" };
}

export function PersonMetricsCard({
  className,
  ...input
}: PersonMetricInput & { className?: string }) {
  const { total, direct, indirect, sparkData, periodLabel, levelText } = input;

  const totalValue = toNumber(total);
  const directValue = toNumber(direct);
  const indirectValue = toNumber(indirect);

  const composition = useMemo<CompositionSlice[]>(() => {
    const slices: CompositionSlice[] = [];
    if (directValue != null && directValue > 0) {
      slices.push({ label: "عملکرد مستقیم", value: directValue });
    }
    if (indirectValue != null && indirectValue > 0) {
      slices.push({ label: "عملکرد غیر مستقیم", value: indirectValue });
    }
    return slices;
  }, [directValue, indirectValue]);

  const useStackedBar = useMemo(
    () => shouldUseStackedBar(composition),
    [composition],
  );

  const series = useMemo<TrendSeries[]>(() => {
    const rows = (sparkData ?? []).filter(
      (row) => typeof row?.Start_Date === "string",
    );
    if (rows.length === 0) return [];

    const build = (key: string, label: string): TrendSeries => ({
      key,
      label,
      points: rows.map((row) => ({
        label: String(row.Start_Date ?? ""),
        value: toNumber(row[key]) ?? 0,
      })),
    });

    return [
      build("TotalPerformance", "عملکرد کلی"),
      build("DirectPerFormance", "مستقیم"),
      build("InDirectPerFormance", "غیر مستقیم"),
    ];
  }, [sparkData]);

  const totalStatus = statusFor(totalValue);

  if (
    totalValue == null &&
    directValue == null &&
    indirectValue == null &&
    series.length === 0
  ) {
    return (
      <ChartCard
        className={className}
        isEmpty
        minHeightClassName="min-h-[12rem]"
        subtitle="شاخصی برای این دوره ثبت نشده است"
        title="شاخص‌های عملکرد"
        empty={
          <p className="max-w-xs text-center text-xs leading-relaxed text-primary/70">
            برای این نفر در دورهٔ انتخابی شاخصی ثبت نشده است. دوره یا روز دیگری
            را از تقویم انتخاب کنید.
          </p>
        }
      />
    );
  }

  return (
    <ChartCard
      className={className}
      minHeightClassName="min-h-0"
      subtitle={`${periodLabel ?? "بازه"} · هدف ${formatFaPercent(TARGET_PERCENT)}${
        levelText ? ` · ${levelText}` : ""
      }`}
      title="شاخص‌های عملکرد"
    >
      <div className="flex flex-col gap-3">
        {/* 1 — KPI tiles: value, target and status as text. */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KpiStat
            label="عملکرد کلی"
            progress={totalValue}
            statusText={totalStatus.text}
            targetLabel={`هدف: ${formatFaPercent(TARGET_PERCENT)}`}
            tone={totalStatus.tone}
            unit="٪"
            value={
              totalValue == null ? "—" : formatFaDecimal(Math.round(totalValue * 10) / 10)
            }
          />
          <KpiStat
            label="عملکرد مستقیم"
            progress={directValue}
            statusText={statusFor(directValue).text}
            targetLabel="سهم از عملکرد کلی"
            tone={statusFor(directValue).tone}
            unit="٪"
            value={
              directValue == null
                ? "—"
                : formatFaDecimal(Math.round(directValue * 10) / 10)
            }
          />
          <KpiStat
            label="عملکرد غیر مستقیم"
            progress={indirectValue}
            statusText={statusFor(indirectValue).text}
            targetLabel="سهم از عملکرد کلی"
            tone={statusFor(indirectValue).tone}
            unit="٪"
            value={
              indirectValue == null
                ? "—"
                : formatFaDecimal(Math.round(indirectValue * 10) / 10)
            }
          />
        </div>

        {/* 2 — Direct vs indirect: two slices, so a donut is the right shape. */}
        {composition.length > 0 ? (
          <div className="rounded-xl border border-border-color/10 bg-third/40 p-2.5">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium text-primary/70">
                ترکیب عملکرد
              </span>
              <span className="text-[11px] text-primary/70">
                سهم مستقیم و غیر مستقیم از کل
              </span>
            </div>
            {useStackedBar ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] leading-relaxed text-primary/70">
                  سهم دو بخش تقریباً برابر است؛ نمایش پشته‌ای دقیق‌تر از نمودار
                  دایره‌ای است.
                </p>
                <CompositionStackedBar
                  formatValue={(value) =>
                    `${formatFaDecimal(Math.round(value * 10) / 10)}٪`
                  }
                  slices={composition}
                />
              </div>
            ) : (
              <CompositionDonut
                formatTotal={(value) => formatFaPercent(value)}
                formatValue={(value) =>
                  `${formatFaDecimal(Math.round(value * 10) / 10)}٪`
                }
                size={168}
                slices={composition}
                totalLabel="عملکرد کلی"
              />
            )}
          </div>
        ) : null}

        {/* 3 — Trend: 4-point rule, stroke patterns, 20% fill, table fallback. */}
        {series.length > 0 ? (
          <div className="rounded-xl border border-border-color/10 bg-third/40 p-2.5">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium text-primary/70">
                روند روزانه
              </span>
              <span className="text-[11px] text-primary/70">
                هر خط: کلی / مستقیم / غیر مستقیم
              </span>
            </div>
            <TrendChart
              formatValue={(value) =>
                formatFaDecimal(Math.round(value * 10) / 10)
              }
              series={series}
              unit="٪"
            />
          </div>
        ) : null}

        {/* 4 — Gauges: ring + number + target + written band thresholds. */}
        <div className="rounded-xl border border-border-color/10 bg-third/40 p-2.5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium text-primary/70">
              پیشرفت تا هدف
            </span>
            <span className="text-[11px] tabular-nums text-primary/70">
              هدف: {formatFaPercent(TARGET_PERCENT)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-start">
            <PerformanceGauge
              className="min-w-0"
              label="کلی"
              value={totalValue ?? undefined}
            />
            <PerformanceGauge
              className="min-w-0"
              label="مستقیم"
              value={directValue ?? undefined}
            />
            <PerformanceGauge
              className="min-w-0"
              label="غیر مستقیم"
              value={indirectValue ?? undefined}
            />
          </div>

          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border-color/10 pt-2 text-[11px] text-primary/70">
            {performanceLevels.map((level) => (
              <li className="inline-flex items-center gap-1.5" key={level.enText}>
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: level.color }}
                />
                <span>
                  {level.text}: {BAND_RANGE[level.enText] ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ChartCard>
  );
}
