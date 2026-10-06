"use client";

import { memo, type ReactNode, useMemo } from "react";
import {
  commify,
  coerceAggregateValue,
  humanizeDuration,
  processDataForChart,
  sumColumnBasedOnRowValue,
} from "~/utils/util";
import { Reports_Period } from "~/constants";
import { ServiceNames, ShortServiceNames } from "~/constants/depo";
import H2 from "~/ui/heading/h2";
import EntryHandlingSkeletonLoading from "~/features/loadings/depo/entry-handling-box";
import { Loading } from "~/features/loadings/loading";
import DepoSkeletonLoading from "~/features/loadings/depo/depo-box";
import DepoTimeSkeletonLoading from "~/features/loadings/depo/depo-time-box";
import { ChartBarMultiple } from "~/components/shadcn/charts/bar/bar-chart-multiple";
import { ChartPieLabel } from "~/components/shadcn/charts/pie/pie-chart-label";
import {
  DEPO_CHART_COLORS,
  DEPO_CHART_HANDLED,
} from "~/constants/depo-chart-colors";
import { cn } from "~/lib/utils";

function toChartNumber(value: unknown): number {
  const coerced = coerceAggregateValue(value);
  return typeof coerced === "number" ? coerced : 0;
}

function SummaryCard({
  title,
  subtitle,
  children,
  className,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex h-full min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-2xl border border-primary/10 bg-secbuttn/80 p-3 shadow-sm transition-colors duration-200 hover:border-primary/20 sm:p-4",
        className,
      )}
    >
      <header className="min-w-0 space-y-1 text-center">
        <H2 className="text-balance text-base font-bold leading-snug text-primary sm:text-lg">
          {title}
        </H2>
        {subtitle ? (
          <div className="text-xs text-primary-muted sm:text-sm">{subtitle}</div>
        ) : null}
      </header>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {children}
      </div>
      {footer ? <footer className="min-w-0 pt-1">{footer}</footer> : null}
    </article>
  );
}

function KpiChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl border border-primary/10 bg-secondary/60 px-3 py-2.5">
      <span className="truncate text-xs text-primary-muted">{label}</span>
      <span
        className="text-lg font-bold tabular-nums leading-none"
        style={{ color: accent }}
      >
        {commify(value)}
      </span>
    </div>
  );
}

type DepoSummaryProps = {
  depo: any;
  depoEstimate?: any;
  flatRows?: any[];
};

export const DepoSummary = memo(function DepoSummary({
  depo,
  depoEstimate,
  flatRows = [],
}: DepoSummaryProps) {
  const serviceData = processDataForChart({
    rawData: flatRows,
    groupBy: ["ServiceName"],
    values: ["DepoCount", "EntryCount", "Capicity"],
  });
  const chartData = useMemo(
    () =>
      (serviceData ?? []).map((row) => ({
        name:
          ShortServiceNames[row.key.ServiceName] ?? row.key.ServiceName ?? "",
        depoCount: toChartNumber(row.DepoCount),
        entryCount: toChartNumber(row.EntryCount),
        capacityCount: toChartNumber(row.Capicity),
      })),
    [serviceData],
  );
  const kpiTotals = useMemo(() => {
    return chartData.reduce(
      (acc, row) => {
        acc.depo += row.depoCount;
        acc.entry += row.entryCount;
        acc.capacity += row.capacityCount;
        return acc;
      },
      { depo: 0, entry: 0, capacity: 0 },
    );
  }, [chartData]);

  const entryDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.BillType === "مستقیم"),
    "EntryCount",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const entryInDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.BillType === "غیر مستقیم"),
    "EntryCount",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const capacityDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.BillType === "مستقیم"),
    "Capicity",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const capacityInDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.BillType === "غیر مستقیم"),
    "Capicity",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const entry_capacity_Direct = [
    {
      name: "ورودی",
      value: entryDirectBaseOnSabt,
      fill: DEPO_CHART_COLORS.entry,
    },
    {
      name: "رسیدگی",
      value: capacityDirectBaseOnSabt,
      fill: DEPO_CHART_HANDLED,
    },
    {
      name: "مانده",
      value: Math.max(0, entryDirectBaseOnSabt - capacityDirectBaseOnSabt),
      fill: DEPO_CHART_COLORS.remaining,
    },
  ];

  const entry_capacity_InDirect = [
    {
      name: "ورودی",
      value: entryInDirectBaseOnSabt,
      fill: DEPO_CHART_COLORS.entry,
    },
    {
      name: "رسیدگی",
      value: capacityInDirectBaseOnSabt,
      fill: DEPO_CHART_HANDLED,
    },
    {
      name: "مانده",
      value: Math.max(0, entryInDirectBaseOnSabt - capacityInDirectBaseOnSabt),
      fill: DEPO_CHART_COLORS.remaining,
    },
  ];

  const depoBaseOnSabtDirect = sumColumnBasedOnRowValue(
    flatRows,
    "DepoCount",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
    ],
  );
  const depoBaseOnSabtInDirect = sumColumnBasedOnRowValue(
    flatRows,
    "DepoCount",
    "ServiceName",
    [ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"]],
  );

  const depo_BaseOnSabt = [
    {
      name: "مستقیم",
      value: depoBaseOnSabtDirect,
      fill: DEPO_CHART_COLORS.direct,
    },
    {
      name: "غیر مستقیم",
      value: depoBaseOnSabtInDirect,
      fill: DEPO_CHART_COLORS.indirect,
    },
  ];

  const depoEstimateData = [
    {
      name: "ورودی",
      value: depoEstimate?.data?.entryTotal ?? 0,
      fill: DEPO_CHART_COLORS.entry,
    },
    {
      name: "رسیدگی",
      value: depoEstimate?.data?.prevCapicity ?? 0,
      fill: DEPO_CHART_HANDLED,
    },
    {
      name: `دپو ${depoEstimate?.data?.depoDate ?? "—"}`,
      value: depoEstimate?.data?.latestDepo ?? 0,
      fill: DEPO_CHART_COLORS.depo,
    },
  ];
  const estimateValue =
    typeof depoEstimate?.data?.estimate === "number" &&
    Number.isFinite(depoEstimate.data.estimate)
      ? depoEstimate.data.estimate
      : 0;

  const estimateInsight =
    estimateValue <= 0 ? (
      <p className="text-sm text-primary-muted">دپویی برای اتمام وجود ندارد</p>
    ) : (
      <p className="text-sm leading-relaxed text-primary">
        <span className="font-bold text-accent" dir="ltr">
          {parseFloat(estimateValue.toFixed(2))}
        </span>
        {depo.data?.periodType ? (
          <>
            {" · "}
            <span className="font-semibold">
              {humanizeDuration(
                estimateValue,
                Reports_Period[depo.data?.periodType],
              )}
            </span>
            <span className="text-primary-muted"> تا اتمام دپو</span>
          </>
        ) : null}
      </p>
    );

  return (
    <section
      className="flex w-full min-w-0 max-w-full flex-col gap-4"
      aria-label="خلاصه دپو"
    >
      <SummaryCard
        className="p-4 sm:p-5"
        title="نمودار به تفکیک فعالیت"
        subtitle="مقایسه دپو، ورودی و رسیدگی در هر فعالیت"
      >
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KpiChip
            accent={DEPO_CHART_COLORS.depo}
            label="مجموع دپو"
            value={kpiTotals.depo}
          />
          <KpiChip
            accent={DEPO_CHART_COLORS.entry}
            label="مجموع ورودی"
            value={kpiTotals.entry}
          />
          <KpiChip
            accent={DEPO_CHART_COLORS.capacity}
            label="مجموع رسیدگی"
            value={kpiTotals.capacity}
          />
        </div>
        <ChartBarMultiple data={chartData} isLoading={depo.isLoading} />
      </SummaryCard>

      <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard title="ورودی و رسیدگی مستقیم">
          <Loading
            isLoading={depo.isLoading}
            LoadingComponent={EntryHandlingSkeletonLoading}
          >
            <ChartPieLabel
              ariaLabel="نسبت ورودی و رسیدگی مستقیم"
              centerLabel="مجموع"
              data={entry_capacity_Direct}
            />
          </Loading>
        </SummaryCard>

        <SummaryCard title="ورودی و رسیدگی غیر مستقیم">
          <Loading
            isLoading={depo.isLoading}
            LoadingComponent={EntryHandlingSkeletonLoading}
          >
            <ChartPieLabel
              ariaLabel="نسبت ورودی و رسیدگی غیر مستقیم"
              centerLabel="مجموع"
              data={entry_capacity_InDirect}
            />
          </Loading>
        </SummaryCard>

        <SummaryCard title="تعداد دپو">
          <Loading
            isLoading={depo.isLoading}
            LoadingComponent={DepoSkeletonLoading}
          >
            <ChartPieLabel
              ariaLabel="نسبت دپو مستقیم و غیر مستقیم"
              centerLabel="مجموع"
              data={depo_BaseOnSabt}
            />
          </Loading>
        </SummaryCard>

        <SummaryCard
          title="زمان اتمام دپو"
          subtitle={
            depo.data?.periodType ? (
              <span className="text-primbuttn">{depo.data.periodType}</span>
            ) : null
          }
          footer={
            <div className="rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-center">
              {estimateInsight}
            </div>
          }
        >
          <Loading
            isLoading={depoEstimate?.isLoading}
            LoadingComponent={DepoTimeSkeletonLoading}
          >
            <ChartPieLabel
              ariaLabel="ترکیب برآورد اتمام دپو"
              centerLabel="مجموع"
              data={depoEstimateData}
            />
          </Loading>
        </SummaryCard>
      </div>
    </section>
  );
});
