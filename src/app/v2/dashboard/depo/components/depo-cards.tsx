/**
 * KPI + pie cards for the v2 depo page.
 *
 * Every number on this strip comes from `/api/v2/depo/charts` or
 * `/api/v2/depo/estimate` — both aggregate the **whole** filtered set in SQL.
 * That is what lets the grid below paginate independently: paging never
 * recomputes or invalidates a card.
 *
 * Card set mirrors v1's `DepoSummary`: total depo / entries / handled, the
 * direct-vs-indirect split, the service bars, and the completion projection.
 */
"use client";

import { useMemo } from "react";

import { cn } from "~/lib/utils";
import type {
  DepoChartsResponse,
  DepoEstimateResponse,
} from "~/server/ramp-performance/params";

const num = new Intl.NumberFormat("fa-IR");

function Card({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-2xl border border-border-color/10 bg-fourth p-3",
        className,
      )}
    >
      <header className="space-y-0.5">
        <h2 className="text-xs font-medium text-primary/70">{title}</h2>
        {subtitle ? (
          <p className="text-[11px] leading-relaxed text-primary/35">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-primary/45">{label}</span>
      <span className={cn("text-lg font-semibold tabular-nums", tone)}>
        {typeof value === "number" ? num.format(Math.round(value)) : value}
      </span>
    </div>
  );
}

/** Horizontal bar list — cheaper and more readable than a pie at this size. */
function ServiceBars({ services }: { services: DepoChartsResponse["services"] }) {
  const max = useMemo(
    () => Math.max(1, ...services.map((service) => service.EntryCount)),
    [services],
  );

  if (!services.length) {
    return <p className="text-xs text-primary/40">داده‌ای برای این بازه نیست.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {services.slice(0, 8).map((service) => {
        const pct = Math.round((service.EntryCount / max) * 100);
        return (
          <li key={service.ServiceName} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="truncate text-primary/70">{service.ServiceName}</span>
              <span className="shrink-0 tabular-nums text-primary/50">
                {num.format(service.EntryCount)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full rounded-full bg-accent/70"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Completion projection: depo count over the remaining capacity. */
function EstimateCard({ estimate }: { estimate: DepoEstimateResponse | undefined }) {
  const value = estimate?.estimate;
  const isFinite = typeof value === "number" && Number.isFinite(value);

  // Negative is meaningful, not an error: depo is accumulating faster than it
  // is being worked off (same reading as v1's status column).
  const insight = !isFinite
    ? "برای این بازه تخمینی محاسبه نشد."
    : value < 0
      ? "دپو در حال افزایش است؛ ظرفیت رسیدگی از ورودی عقب‌تر است."
      : value === 0
        ? "دپوی این بازه صفر است."
        : value <= 1
          ? "دپوی این بازه در همان دوره تکمیل می‌شود."
          : `برای اتمام دپو حدود ${num.format(Math.ceil(value))} دوره دیگر لازم است.`;

  return (
    <Card title="زمان اتمام دپو" subtitle={insight}>
      <Stat
        label="نسبت دپو به ظرفیت باقی‌مانده"
        value={isFinite ? value.toFixed(2) : "—"}
        tone={
          !isFinite || value < 0
            ? "text-red-400"
            : value === 0
              ? "text-amber-400"
              : "text-emerald-400"
        }
      />
      <dl className="grid grid-cols-3 gap-2 border-t border-border-color/10 pt-2 text-[11px]">
        <div>
          <dt className="text-primary/45">دپوی فعلی</dt>
          <dd className="tabular-nums text-primary/80">
            {estimate ? num.format(estimate.latestDepo) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-primary/45">ظرفیت قبلی</dt>
          <dd className="tabular-nums text-primary/80">
            {estimate ? num.format(estimate.prevCapicity) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-primary/45">ورودی دوره</dt>
          <dd className="tabular-nums text-primary/80">
            {estimate ? num.format(estimate.entryTotal) : "—"}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export function DepoCards({
  charts,
  estimate,
  loading,
}: {
  charts: DepoChartsResponse | undefined;
  estimate: DepoEstimateResponse | undefined;
  loading?: boolean;
}) {
  const totals = charts?.totals;
  const remaining = (totals?.Capicity ?? 0) - (totals?.EntryCount ?? 0);

  return (
    <div
      className={cn(
        "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
        loading && "opacity-60",
      )}
    >
      <Card title="مجموع دپو" subtitle="تعداد دپوی ثبت‌شده در بازه انتخابی">
        <Stat label="تعداد دپو" value={totals?.DepoCount ?? 0} />
        <Stat label="ظرفیت باقی‌مانده" value={remaining} tone="text-primary/60" />
      </Card>

      <Card title="ورودی و رسیدگی" subtitle="مقایسه ورودی با رسیدگی‌شده">
        <div className="flex gap-4">
          <Stat label="ورودی" value={totals?.EntryCount ?? 0} />
          <Stat label="رسیدگی شده" value={totals?.Capicity ?? 0} />
        </div>
        <Stat
          label="زمان اتمام (کل)"
          value={Number(totals?.DepoCompleteTime ?? 0).toFixed(2)}
        />
      </Card>

      <Card title="نمودار به تفکیک فعالیت" subtitle="بیشترین ورودی در هر فعالیت">
        <ServiceBars services={charts?.services ?? []} />
      </Card>

      <EstimateCard estimate={estimate} />
    </div>
  );
}
