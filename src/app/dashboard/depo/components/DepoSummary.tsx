"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  commify,
  dataAsTable,
  humanizeDuration,
  processDataForChart,
  processDepoCompleteTimeData,
  sumColumnBasedOnRowValue,
} from "~/utils/util";
import { Reports_Period, Text } from "~/constants";
import { ServiceNames, ShortServiceNames } from "~/constants/depo";
import H2 from "~/ui/heading/h2";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";
import EntryHandlingSkeletonLoading from "~/features/loadings/depo/entry-handling-box";
import { Loading } from "~/features/loadings/loading";
import DepoSkeletonLoading from "~/features/loadings/depo/depo-box";
import DepoTimeSkeletonLoading from "~/features/loadings/depo/depo-time-box";
import CustomPieChart from "~/features/custom-charts/pie-chart";
import SimpleTable from "~/features/guide-table";

// Reusable DataDisplay Component
interface DataDisplayProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}

function DataDisplay({ data }: DataDisplayProps) {
  return (
    <div className="flex flex-col divide-y divide-primary/10 rounded-md bg-secondary p-1">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-1"
          style={{ color: item.fill }}
        >
          <span className="text-sm">{item.name}:</span>
          <span className="font-bold">{commify(item.value)}</span>
        </div>
      ))}
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
  const depoCompletionTime = processDepoCompleteTimeData(flatRows);

  const entryDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.DocumentType === "مستقیم"),
    "EntryCount",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const entryInDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.DocumentType === "غیر مستقیم"),
    "EntryCount",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const capacityDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.DocumentType === "مستقیم"),
    "Capicity",
    "ServiceName",
    [
      ServiceNames["ثبت ارزیابی با اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
      ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
    ],
  );

  const capacityInDirectBaseOnSabt = sumColumnBasedOnRowValue(
    flatRows.filter((a) => a.DocumentType === "غیر مستقیم"),
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
      fill: "#06B6D4",
      headClassName: "text-lg text-cyan-600 bg-secondary rounded-tr-xl",
      rowClassName: "text-lg  text-cyan-600 bg-secondary rounded-br-xl",
    },
    {
      name: "رسیدگی",
      value: capacityDirectBaseOnSabt,
      fill: "#059669",
      headClassName: "text-lg text-emerald-600 bg-secondary",
      rowClassName: "text-lg  text-emerald-600 bg-secondary",
    },
    {
      name: "مانده",
      value: entryDirectBaseOnSabt - capacityDirectBaseOnSabt,
      fill: "#65a30d",
      headClassName: "text-lg text-lime-600 bg-secondary rounded-tl-xl",
      rowClassName: "text-lg  text-lime-600 bg-secondary rounded-bl-xl",
    },
  ];

  const entry_capacity_InDirect = [
    {
      name: "ورودی",
      value: entryInDirectBaseOnSabt,
      fill: "#06B6D4",
      headClassName: "text-lg text-cyan-600 bg-secondary rounded-tr-xl",
      rowClassName: "text-lg  text-cyan-600 bg-secondary rounded-br-xl",
    },
    {
      name: "رسیدگی",
      value: capacityInDirectBaseOnSabt,
      fill: "#059669",
      headClassName: "text-lg text-emerald-600 bg-secondary",
      rowClassName: "text-lg  text-emerald-600 bg-secondary",
    },
    {
      name: "مانده",
      value: entryInDirectBaseOnSabt - capacityInDirectBaseOnSabt,
      fill: "#65a30d",
      headClassName: "text-lg text-lime-600 bg-secondary rounded-tl-xl",
      rowClassName: "text-lg  text-lime-600 bg-secondary rounded-bl-xl",
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
      fill: "#c026d3",
      headClassName: "text-lg text-fuchsia-600 bg-secondary rounded-tr-xl ",
      rowClassName: "text-lg  text-fuchsia-600 bg-secondary rounded-br-xl",
    },
    {
      name: "غیر مستقیم",
      value: depoBaseOnSabtInDirect,
      fill: "#0d9488",
      headClassName: "text-lg text-cyan-600 bg-secondary rounded-tl-xl ",
      rowClassName: "text-lg  text-cyan-600 bg-secondary rounded-bl-xl",
    },
  ];

  const depoEstimateData = [
    {
      name: "ورودی",
      value: depoEstimate?.data?.entryTotal ?? 0,
      fill: "#06B6D4",
      headClassName: "text-lg text-cyan-600 bg-secondary rounded-tr-xl",
      rowClassName: "text-lg  text-cyan-600 bg-secondary rounded-br-xl",
    },
    {
      name: "رسیدگی",
      value: depoEstimate?.data?.prevCapicity ?? 0,
      fill: "#059669",
      headClassName: "text-lg text-emerald-600 bg-secondary",
      rowClassName: "text-lg  text-emerald-600 bg-secondary",
    },
    {
      name: `دپو ${depoEstimate?.data?.depoDate}`,
      value: depoEstimate?.data?.latestDepo ?? 0,
      fill: "#65a30d",
      headClassName: "text-lg text-lime-600 bg-secondary rounded-tl-xl",
      rowClassName: "text-lg  text-lime-600 bg-secondary rounded-bl-xl",
    },
  ];
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="flex w-full flex-col justify-center gap-5 rounded-2xl bg-secbuttn p-5">
            <H2 className="text-center text-lg font-bold">
              نمودار به تفکیک فعالیت
            </H2>
            <Loading
              isLoading={depo.isLoading}
              LoadingComponent={BarChartSkeletonLoading}
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%" key="bar-chart">
                  <BarChart
                    data={(serviceData ?? []).map((row) => {
                      return {
                        name: ShortServiceNames[row.key.ServiceName],
                        "تعداد دپو": row.DepoCount,
                        "تعداد ورودی": row.EntryCount,
                        "تعداد رسیدگی": row.Capicity,
                      };
                    })}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      labelClassName="text-primary"
                      formatter={(value) => commify(value)}
                      contentStyle={{
                        backgroundColor: "rgb(var(--secondary))",
                        borderRadius: "8px",
                        border: "0px ",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="تعداد دپو" fill="#e11d48" />
                    <Bar dataKey="تعداد ورودی" fill="#06B6D4" />
                    <Bar dataKey="تعداد رسیدگی" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Loading>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {/* Direct Entry and Processing */}
            <div className="flex flex-col gap-3 rounded-2xl bg-secbuttn p-4">
              <Loading
                isLoading={depo.isLoading}
                LoadingComponent={EntryHandlingSkeletonLoading}
              >
                <div className="flex flex-col gap-3">
                  <H2 className="text-center text-lg font-bold">
                    تعداد ورودی و رسیدگی شده مستقیم
                  </H2>
                  <DataDisplay data={entry_capacity_Direct} />
                  <div className="flex h-64 w-full items-center justify-center">
                    <CustomPieChart
                      data={entry_capacity_Direct}
                      index="value"
                    />
                  </div>
                </div>
              </Loading>
            </div>

            {/* Indirect Entry and Processing */}
            <div className="flex flex-col gap-3 rounded-2xl bg-secbuttn p-4">
              <Loading
                isLoading={depo.isLoading}
                LoadingComponent={EntryHandlingSkeletonLoading}
              >
                <div className="flex flex-col gap-3">
                  <H2 className="text-md pb-1 text-center font-bold">
                    تعداد ورودی و رسیدگی شده غیر مستقیم
                  </H2>
                  <DataDisplay data={entry_capacity_InDirect} />
                  <div className="flex h-64 w-full items-center justify-center">
                    <CustomPieChart
                      data={entry_capacity_InDirect}
                      index="value"
                    />
                  </div>
                </div>
              </Loading>
            </div>

            {/* Depo Count */}
            <div className="flex flex-col gap-3 rounded-2xl bg-secbuttn p-4">
              <Loading
                isLoading={depo.isLoading}
                LoadingComponent={DepoSkeletonLoading}
              >
                <div className="flex flex-col gap-3">
                  <H2 className="text-center text-lg font-bold">تعداد دپو</H2>
                  <DataDisplay data={depo_BaseOnSabt} />
                  <div className="flex h-64 w-full items-center justify-center">
                    <CustomPieChart data={depo_BaseOnSabt} index="value" />
                  </div>
                </div>
              </Loading>
            </div>

            {/* Depo Estimate */}
            <div className="flex flex-col gap-3 rounded-2xl bg-secbuttn p-4">
              <Loading
                isLoading={depoEstimate.isLoading}
                LoadingComponent={DepoTimeSkeletonLoading}
              >
                <div className="flex flex-col gap-3">
                  <H2 className="text-center text-lg font-bold">
                    زمان کلی اتمام دپو
                    {depo.data?.periodType && (
                      <span className="block text-sm text-primbuttn">
                        {depo.data?.periodType}
                      </span>
                    )}
                  </H2>
                  <DataDisplay data={depoEstimateData} />
                  <div className="flex h-64 w-full items-center justify-center">
                    <CustomPieChart data={depoEstimateData} index="value" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-primary">
                      نتیجه عددی فرمول:{" "}
                      <span dir="ltr" className="font-bold">
                        {depoEstimate?.data?.estimate
                          ? parseFloat(depoEstimate.data.estimate.toFixed(2))
                          : "0.00"}
                      </span>
                    </p>
                    {depo.data?.periodType && (
                      <div className="mt-2">
                        <div className="text-sm text-accent">
                          {depoEstimate?.data?.estimate <= 0 ? (
                            "دپو ای وجود ندارد"
                          ) : (
                            <p>
                              {humanizeDuration(
                                depoEstimate?.data?.estimate,
                                Reports_Period[depo.data?.periodType],
                              )}{" "}
                              <span className="text-primary">تا اتمام دپو</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Loading>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
