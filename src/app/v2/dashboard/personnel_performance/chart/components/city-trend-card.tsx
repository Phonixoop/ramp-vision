/**
 * City-level trend card for the v2 personnel-performance chart page.
 *
 * Data source: `useCitySession().getAll` — the query the page already runs for
 * the selected city. Nothing here issues a request, changes a filter or touches
 * an `enabled` flag; it only derives a daily mean from rows already in hand.
 *
 * Rules applied (see `trend-chart.tsx`):
 * - fewer than 4 days → stat cards, not a line
 * - area fill at 20%, series separated by colour *and* stroke pattern
 * - a value table and a one-line Persian trend summary are always present
 * - loading uses skeleton bars; empty uses a Persian message with a next step
 */
"use client";

import { useMemo } from "react";

import {
  dedupePersonnelPerformanceRows,
  isPersonnelWorkingDay,
} from "~/utils/personnel-performance";
import { formatFaNumber } from "./chart-format";
import { ChartCard } from "./chart-card";
import { TrendChart, type TrendSeries } from "./trend-chart";
import { useCitySession } from "../city-session-context";

type RawRow = Record<string, unknown>;

/**
 * Derives the daily series the trend chart draws: mean / direct / indirect.
 *
 * Rows are deduped with the shared personnel key first — the query returns one
 * row per person/branch/day and `users_info` role duplicates inflate a day if
 * left in, which would bend every mean.
 */
function buildSeries(rawRows: RawRow[]): TrendSeries[] {
  const rows = dedupePersonnelPerformanceRows(rawRows);
  const byDate = new Map<
    string,
    { total: number[]; direct: number[]; indirect: number[] }
  >();

  for (const row of rows) {
    const date = typeof row.Start_Date === "string" ? row.Start_Date : "";
    if (!date) continue;
    if (!isPersonnelWorkingDay(row.HasTheDayOff)) continue;

    const total = Number(row.TotalPerformance);
    if (!Number.isFinite(total)) continue;

    const bucket = byDate.get(date) ?? {
      total: [],
      direct: [],
      indirect: [],
    };
    bucket.total.push(total);

    const direct = Number(row.DirectPerFormance);
    if (Number.isFinite(direct)) bucket.direct.push(direct);

    const indirect = Number(row.InDirectPerFormance);
    if (Number.isFinite(indirect)) bucket.indirect.push(indirect);

    byDate.set(date, bucket);
  }

  // Jalali dates as `jYYYY/jMM/jDD` sort lexicographically.
  const dates = [...byDate.keys()].sort((a, b) => a.localeCompare(b, "fa"));

  const mean = (values: number[]) =>
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  const pointsFor = (
    pick: (bucket: {
      total: number[];
      direct: number[];
      indirect: number[];
    }) => number[],
  ) =>
    dates.map((date) => ({
      label: date,
      value: mean(pick(byDate.get(date)!)),
    }));

  return [
    { key: "total", label: "میانگین کلی", points: pointsFor((b) => b.total) },
    { key: "direct", label: "مستقیم", points: pointsFor((b) => b.direct) },
    { key: "indirect", label: "غیر مستقیم", points: pointsFor((b) => b.indirect) },
  ].filter((series) => series.points.some((point) => point.value > 0));
}

export function CityTrendCard({ className }: { className?: string }) {
  const { currentCity, getAll, pageLoading } = useCitySession();

  const rows = useMemo<RawRow[]>(() => {
    const result = (getAll?.data as { result?: unknown } | undefined)?.result;
    return Array.isArray(result) ? (result as RawRow[]) : [];
  }, [getAll?.data]);

  const series = useMemo(() => buildSeries(rows), [rows]);
  const hasData = series.length > 0;
  const loading = (getAll?.isLoading || pageLoading) && !hasData;

  return (
    <ChartCard
      className={className}
      isEmpty={!loading && !hasData}
      loading={loading}
      minHeightClassName="min-h-[20rem]"
      subtitle="میانگین عملکرد روزانه در این استان؛ خط‌چین و رنگ با هم سری‌ها را جدا می‌کنند"
      title={`روند عملکرد روزانه${currentCity ? ` — ${currentCity}` : ""}`}
      empty={
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="max-w-xs text-xs leading-relaxed text-primary/70">
            برای این استان در بازهٔ انتخابی داده‌ای ثبت نشده است. بازهٔ گزارش را
            گسترده‌تر کنید یا استان دیگری را انتخاب کنید.
          </p>
        </div>
      }
      actions={
        hasData ? (
          <span className="rounded-md bg-third px-2 py-0.5 text-[11px] tabular-nums text-primary/70">
            {formatFaNumber(series[0]?.points.length ?? 0)} روز
          </span>
        ) : null
      }
    >
      <TrendChart
        formatValue={(value) => formatFaNumber(value)}
        series={series}
        unit="٪"
      />
    </ChartCard>
  );
}
