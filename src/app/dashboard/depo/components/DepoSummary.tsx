"use client";

import { memo } from "react";
import { BarChart } from "@tremor/react";
import { ResponsiveContainer } from "recharts";
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
import { useTableData } from "~/context/table-data.context";

type DepoSummaryProps = {
  depo: any;
  depoEstimate?: any;
};

export const DepoSummary = memo(function DepoSummary({
  depo,
  depoEstimate,
}: DepoSummaryProps) {
  const { flatRows } = useTableData();
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
        <div className="flex w-full  flex-col items-center justify-center gap-5 xl:flex-row">
          <div className="flex w-full  flex-col items-stretch justify-between gap-5 xl:flex-row">
            <div className="flex w-full flex-col justify-center gap-5 rounded-2xl   bg-secbuttn py-5 xl:p-5">
              <H2 className="text-lg font-bold">نمودار به تفکیک فعالیت</H2>
              <Loading
                isLoading={depo.isLoading}
                LoadingComponent={BarChartSkeletonLoading}
              >
                <ResponsiveContainer width="99%" height={300}>
                  <BarChart
                    showAnimation={true}
                    data={(serviceData ?? []).map((row) => {
                      return {
                        name: ShortServiceNames[row.key.ServiceName],
                        "تعداد دپو": row.DepoCount,
                        "تعداد ورودی": row.EntryCount,
                        "تعداد رسیدگی": row.Capicity,
                      };
                    })}
                    index="name"
                    categories={["تعداد دپو", "تعداد ورودی", "تعداد رسیدگی"]}
                    colors={["rose", "cyan", "emerald"]}
                    valueFormatter={commify}
                    yAxisWidth={20}
                    showXAxis
                    showGridLines={false}
                    noDataText={Text.noData.fa}
                    intervalType="preserveStartEnd"
                  />
                </ResponsiveContainer>
              </Loading>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="flex w-full  items-center justify-center gap-5 laptopMax:flex-col">
            <div className="flex w-full  flex-col items-center justify-between gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 ">
                <div className="flex w-full shrink-0 flex-col justify-between gap-5 rounded-2xl  p-2 ">
                  <Loading
                    isLoading={depo.isLoading}
                    LoadingComponent={EntryHandlingSkeletonLoading}
                  >
                    <SimpleTable
                      className="flex h-full min-h-[300px] min-w-[300px] justify-center border-none"
                      data={{
                        title: "تعداد ورودی و رسیدگی شده مستقیم",
                        table: dataAsTable(entry_capacity_Direct),
                      }}
                    >
                      <ResponsiveContainer width={"100%"} height={300}>
                        <CustomPieChart
                          className="min-h-96 rounded-xl bg-secondary"
                          data={entry_capacity_Direct}
                          index="value"
                        />
                      </ResponsiveContainer>
                    </SimpleTable>
                  </Loading>
                </div>
                <div className="flex  w-full shrink-0  flex-col justify-between gap-5 rounded-2xl  p-2 ">
                  <Loading
                    isLoading={depo.isLoading}
                    LoadingComponent={EntryHandlingSkeletonLoading}
                  >
                    <SimpleTable
                      className="flex h-full justify-start border-none"
                      data={{
                        title: " تعداد ورودی و رسیدگی شده غیر مستقیم",
                        table: dataAsTable(entry_capacity_InDirect),
                      }}
                    >
                      <ResponsiveContainer width={"100%"} height={300}>
                        <CustomPieChart
                          className="rounded-xl bg-secondary"
                          data={entry_capacity_InDirect}
                          index="value"
                        />
                      </ResponsiveContainer>
                    </SimpleTable>
                  </Loading>
                </div>
                <div className="flex w-full shrink-0  flex-col justify-between gap-5 rounded-2xl  p-2">
                  <Loading
                    isLoading={depo.isLoading}
                    LoadingComponent={DepoSkeletonLoading}
                  >
                    <SimpleTable
                      className="flex h-full justify-start border-none"
                      data={{
                        title: "تعداد دپو",
                        table: dataAsTable(depo_BaseOnSabt),
                      }}
                    >
                      <ResponsiveContainer width={"100%"} height={300}>
                        <CustomPieChart
                          className="rounded-xl bg-secondary "
                          data={depo_BaseOnSabt}
                          index="value"
                        />
                      </ResponsiveContainer>
                    </SimpleTable>
                  </Loading>
                </div>
                <div className="flex w-full shrink-0  flex-col justify-between  gap-5 rounded-2xl  p-5 xl:max-w-md">
                  <Loading
                    isLoading={depoEstimate.isLoading}
                    LoadingComponent={DepoTimeSkeletonLoading}
                  >
                    <div className="flex h-full w-full flex-col justify-between gap-5 rounded-2xl bg-secbuttn p-5  text-primary xl:max-w-md">
                      <H2>
                        زمان کلی اتمام دپو{" "}
                        {depo.data?.periodType && (
                          <>
                            |{" "}
                            <span className="text-primbuttn">
                              {depo.data?.periodType}
                            </span>
                          </>
                        )}
                      </H2>

                      <SimpleTable
                        className="flex justify-start border-none"
                        data={{
                          title: "",
                          table: dataAsTable(depoEstimateData),
                        }}
                      >
                        <ResponsiveContainer width={"100%"} height={300}>
                          <CustomPieChart
                            className="rounded-xl bg-secondary "
                            data={depoEstimateData}
                            index="value"
                          />
                        </ResponsiveContainer>
                      </SimpleTable>
                      <p className="text-primary">
                        نتیجه عددی فرمول :{" "}
                        <span dir="ltr">
                          {" "}
                          {parseFloat(depoEstimate?.data?.estimate.toFixed(2))}
                        </span>
                      </p>
                      {depo.data?.periodType && (
                        <div className="w-full">
                          <div className="text-accent">
                            {depoEstimate?.data?.estimate <= 0 ? (
                              "دپو ای وجود ندارد"
                            ) : (
                              <p>
                                {humanizeDuration(
                                  depoEstimate?.data?.estimate,
                                  Reports_Period[depo.data?.periodType],
                                )}{" "}
                                <span className="text-primary">
                                  تا اتمام دپو
                                </span>
                              </p>
                            )}
                          </div>{" "}
                        </div>
                      )}
                    </div>
                  </Loading>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
