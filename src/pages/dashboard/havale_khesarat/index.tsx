import { ColumnDef } from "@tanstack/react-table";
import { BarChart } from "@tremor/react";
import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { memo, useDeferredValue, useMemo, useState } from "react";
import { Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { City_Levels, Text } from "~/constants";
import { FilterType } from "~/context/personnel-filter.context";
import { SelectColumnFilter, SelectControlled } from "~/features/checkbox-list";
import CustomBarChart from "~/features/custom-charts/bar-chart";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import { BarChartSkeletonLoading } from "~/features/loadings/bar-chart";
import { Loading } from "~/features/loadings/loading";
import { InPageMenu } from "~/features/menu";
import Table from "~/features/table";
import { groupBy, uniqueArrayWithCounts } from "~/lib/utils";
import BlurBackground from "~/ui/blur-backgrounds";
import H2 from "~/ui/heading/h2";
import { api } from "~/utils/api";
import {
  distinctDataAndCalculatePerformance,
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import {
  commify,
  en,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
  processDataForChart,
} from "~/utils/util";

function FilterView({
  data = [],
  column = undefined,
  title = "",
  onChange = (filter) => {},
}) {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
        <span className="font-bold text-primary">{title}</span>
        <SelectColumnFilter column={column} data={data} />
      </div>
    </>
  );
}

export default function HavaleKhesaratPage() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [filters, setDataFilters] = useState({
    periodType: "ماهانه",
    filter: {
      CityName: [],
      Start_Date: [moment().locale("fa").subtract(1, "M").format("YYYY/MM/DD")],
    },
  });
  const deferredFilter = useDeferredValue(filters);
  const havaleKhesarat = api.havaleKhesarat.getAll.useQuery(deferredFilter, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });

  const initialFilters = api.havaleKhesarat.getInitialCities.useQuery(
    undefined,
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );

  const columns =
    useMemo<ColumnDef<any>[]>(
      () => [
        {
          header: "ردیف",
          accessorKey: "Id",
          cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.index + 1}
              </div>
            );
          },
        },
        {
          header: "استان",
          accessorKey: "CityName",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">استان</span>
                {
                  <LayoutGroup id="CityLevelMenu">
                    <InPageMenu
                      list={City_Levels.map((a) => a.name)}
                      startIndex={-1}
                      onChange={(value) => {
                        const { setFilterValue } = column;
                        const cities = City_Levels.find(
                          (a) => a.name === value.item.name,
                        ).cities;

                        // beacuse our system is permission based we need to show only allowed cities.
                        const canFilterCities = cities
                          .filter(
                            (city) =>
                              initialFilters?.data?.Cities.map((initCity) =>
                                getPersianToEnglishCity(initCity.CityName),
                              ).includes(city),
                          )
                          .map((cityName) => getEnglishToPersianCity(cityName));

                        if (cities.length <= 0) {
                          setFilterValue(
                            initialFilters?.data?.Cities.map((a) => a.CityName),
                          );
                        } else setFilterValue(canFilterCities);
                      }}
                    />
                  </LayoutGroup>
                }

                <SelectColumnFilter
                  column={column}
                  data={havaleKhesarat?.data}
                />
              </div>
            );
          },
        },
        {
          header: "نوع فعالیت",
          accessorKey: "ServiceName",
          filterFn: "arrIncludesSome",

          Filter: ({ column }) => {
            return (
              <>
                <FilterView
                  column={column}
                  data={havaleKhesarat?.data}
                  title="نوع فعالیت"
                />
              </>
            );
          },
        },
        {
          header: "نوع حواله",
          accessorKey: "HavaleType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <>
                <FilterView
                  column={column}
                  data={havaleKhesarat?.data}
                  title="نوع حواله"
                />
              </>
            );
          },
        },
        {
          header: "صدور شده",
          accessorKey: "SodorShode",
        },
        {
          header: "ابطال شده",
          accessorKey: "EbtalShode",
        },
        {
          header: "صادر شده",
          accessorKey: "SaderShode",
        },
        {
          header: "درصد عودتی",
          accessorKey: "OdatPercentage",
          cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.original.OdatPercentage.toFixed(2)}%
              </div>
            );
          },
        },
        {
          header: "درصد انحراف",
          accessorKey: "DeviationPercentage",
          cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.original.DeviationPercentage.toFixed(2)}%
              </div>
            );
          },
        },
        {
          header: "تاریخ گزارش دریافتی",
          accessorKey: "Start_Date",
        },
      ],
      [havaleKhesarat.data],
    ) || [];

  return (
    <>
      <Head>
        <title>RAMP | Vision</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlurBackground />
      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000 ">
        <div className="w-full sm:p-0  xl:w-11/12">
          <div
            className="flex  w-full flex-col items-center justify-center gap-5"
            dir="rtl"
          >
            <div className="flex w-full items-center justify-center  rounded-lg  py-5 text-center ">
              <Table
                isLoading={havaleKhesarat.isLoading}
                columns={columns}
                data={havaleKhesarat.data}
                renderChild={(flatRows) => {
                  const serviceData = processDataForChart(
                    flatRows,
                    ["ServiceName"],
                    ["SodorShode", "EbtalShode", "SaderShode"],
                  );

                  return (
                    <>
                      {" "}
                      <Loading
                        isLoading={havaleKhesarat.isLoading}
                        LoadingComponent={BarChartSkeletonLoading}
                      >
                        <ResponsiveContainer width="99%" height={300}>
                          <BarChart
                            showAnimation={true}
                            data={(serviceData ?? []).map((row) => {
                              return {
                                name: row.key.ServiceName,
                                "صدور شده": row.SodorShode,
                                "ابطال شده": row.EbtalShode,
                                "صادر شده": row.SaderShode,
                              };
                            })}
                            index="name"
                            categories={["صدور شده", "ابطال شده", "صادر شده"]}
                            colors={["cyan", "rose", "emerald"]}
                            yAxisWidth={20}
                            showXAxis
                            showGridLines={false}
                            noDataText={Text.noData.fa}
                            intervalType="preserveStartEnd"
                          />
                        </ResponsiveContainer>
                      </Loading>
                    </>
                  );
                }}
                renderAfterTable={(flatRows) => (
                  <ChartsView
                    flatRows={flatRows}
                    isLoading={havaleKhesarat.isLoading}
                  />
                )}
                renderInFilterView={() => {
                  return (
                    <>
                      <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
                        <span className="font-bold text-primary">
                          بازه گزارش
                        </span>

                        <DatePickerPeriodic
                          hidePeriodSelection
                          filter={filters}
                          reportPeriod={"ماهانه"}
                          onChange={(date) => {
                            if (!date) return;

                            if (Array.isArray(date) && date.length <= 0) return;
                            let dates = [];
                            if (Array.isArray(date)) {
                              dates = date
                                .filter((a) => a.format() != "")
                                .map((a) => en(a.format("YYYY/MM/DD")));
                            } else {
                              if (date.format() != "")
                                dates = [en(date.format("YYYY/MM/DD"))];
                            }
                            if (dates.length <= 0) return;
                            console.log(dates);
                            setDataFilters((prev) => {
                              return {
                                periodType: prev.periodType,
                                filter: {
                                  ...prev.filter,
                                  Start_Date: dates,
                                },
                              };
                            });
                          }}
                        />
                      </div>
                    </>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
const ChartsView = memo(Charts);
function Charts({ flatRows, isLoading }) {
  const router = useRouter();
  const result = groupBy(flatRows, (item: any) => item.Start_Date);
  const r = Object.entries(result).map(([key, value]) => {
    const result2 = processDataForChart(
      value,
      ["Start_Date"],
      [
        "SodorShode",
        "EbtalShode",
        "SaderShode",
        "OdatPercentage",
        "DeviationPercentage",
      ],
    );

    console.log(result2);
    return {
      COUNT: value.length,
      Start_Date: key,
      ...result2,
    };
  });

  console.log(r);
  return (
    <>
      <ResponsiveContainer width="99%" height="auto">
        <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl  bg-secbuttn/50 py-5 xl:p-5">
          <H2 className="font-bold">نمودار عملکرد شهر ها</H2>

          <CustomBarChart
            width={500}
            height={500}
            data={(r.flat() ?? []).map((row) => {
              return {
                تاریخ: row.Start_Date,
                // "ابطال شده": Math.round(row[0].EbtalShode),
                // "صدور شده": Math.round(row[0].SodorShode),
                // "صادر شده": Math.round(row[0].SaderShode),
                "درصد عودتی": row[0].OdatPercentage.toFixed(2),
              };
            })}
            bars={[
              // {
              //   name: "صدور شده",
              //   className: "fill-primary cursor-pointer",
              //   labelClassName: "fill-secondary",
              //   angle: 0,
              // },
              // {
              //   name: "ابطال شده",
              //   className: "fill-primary cursor-pointer",
              //   labelClassName: "fill-secondary",
              //   angle: 0,
              // },
              // {
              //   name: "صادر شده",
              //   className: "fill-primary cursor-pointer",
              //   labelClassName: "fill-secondary",
              //   angle: 0,
              // },
              {
                name: "درصد عودتی",
                className: "fill-primary cursor-pointer",
                labelClassName: "fill-secondary",
                angle: 0,
              },
            ]}
            keys={["تاریخ"]}
            nameClassName="fill-primary"
            customXTick
            customYTick
            formatter={commify}
            onBarClick={(data, index) => {
              // window.open(
              //   "/dashboard/personnel_performance/cities/" + data.CityName_En,
              //   "_blank",
              // );

              router.push(
                {
                  href: router.pathname,
                  query: {
                    performance_CityName: data.CityName_En,
                  },
                },
                undefined,
                {
                  scroll: false,
                  shallow: true,
                },
              );
            }}
            customBars={(data) => {
              if (data.length <= 0) return <></>;

              return (
                <>
                  {data.map((item, index) => {
                    return (
                      <>
                        {/* <Cell
                          key={`cell-${index}`}
                          fill={getPerformanceMetric(item["صدور شده"]).color}
                        /> */}
                      </>
                    );
                  })}
                </>
              );
            }}
          />
        </div>
      </ResponsiveContainer>
    </>
  );
}
