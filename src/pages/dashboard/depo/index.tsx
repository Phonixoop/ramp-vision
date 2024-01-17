import {
  ArrowDownRightIcon,
  UserCog2,
  DownloadCloudIcon,
  FileBarChart2,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { CSVLink } from "react-csv";
import Menu, { InPageMenu } from "~/features/menu";

import Table from "~/features/table";

import { ThemeBoxHovery } from "~/features/theme-box";

import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";

import { useDeferredValue, useMemo, useState } from "react";
import { RouterOutputs, api } from "~/utils/api";
import {
  Title,
  BarChart,
  AreaChart,
  DonutChart,
  Tracker,
  Card,
  Metric,
  CategoryBar,
  Legend,
} from "@tremor/react";
import CheckboxList, {
  SelectColumnFilter,
  SelectControlled,
} from "~/features/checkbox-list";
import MultiBox from "~/ui/multi-box";
import moment from "jalali-moment";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/mobile.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  commify,
  convertNumberToBetterFormat,
  en,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
  getServiceNameColor,
  humanizeDuration,
  processDataForChart,
  processDepoCompleteTimeData,
  sumColumnBasedOnRowValue,
} from "~/utils/util";
import H2 from "~/ui/heading/h2";
import TrackerView from "~/features/tracker";
import { CITIES, City_Levels, Reports_Period, Text } from "~/constants";
import { cn } from "~/lib/utils";
import { Column } from "react-table";
import Header from "~/features/header";
import { LayoutGroup } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { Bar } from "react-chartjs-2";
import RadarGauge from "~/features/radar";
import TestPage from "~/pages/test";
import { ServiceNames, ShortServiceNames } from "~/constants/depo";
import ReBarChart from "~/features/rechart-ui/bar";
import { ResponsiveContainer } from "recharts";
import InputIcon from "react-multi-date-picker/components/input_icon";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import { date } from "zod";
import { twMerge } from "tailwind-merge";
import { calculateDepoCompleteTime } from "~/utils/date-utils";

const chartdata = [
  {
    name: "Amphibians",
    "Number of threatened species": 2488,
  },
  {
    name: "Birds",
    "Number of threatened species": 1445,
  },
  {
    name: "Crustaceans",
    "Number of threatened species": 743,
  },
];

const dataFormatter = (number: number) => {
  return "$ " + Intl.NumberFormat("us").format(number).toString();
};

// function filterColumn(rows, id, filterValue) {
//   if (rows.length <= 0) return [];
//   return rows.filter((row) => {
//     const rowValue = row.values[id];
//     // console.log(rowValue, filterValue);
//     return filterValue.includes(rowValue);
//   });
// }

const filterColumn = (row, columnId, value, addMeta) => {
  if (value === undefined || value.length === 0) {
    return false;
  } else {
    const { someProp, otherProp } = value;
    return (
      someProp.includes(row.original.myObj?.someProp) &&
      otherProp.includes(row.original.myObj?.otherProp)
    );
  }
};
type DepoGetAll = RouterOutputs["depo"]["getAll"][number];

export default function DeposPage() {
  // const users = api.example.getAll.useQuery();
  const { data: sessionData } = useSession();
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
          <DeposTable sessionData={sessionData} />
        </div>
      </div>
    </>
  );
}

function DeposTable({ sessionData }) {
  const utils = api.useContext();

  const [selectedDates, setSelectedDates] = useState<string[]>([
    moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
  ]);

  const [reportPeriod, setReportPeriod] = useState<string>("روزانه");

  const initialFilters = api.depo.getInitialFilters.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });
  // const [trackerFilter, setTrackerFilter] = useState({
  //   cities: initialFilters.data?.Cities.map((a) => a.CityName),
  // });
  const [filters, setDataFilters] = useState({
    periodType: reportPeriod,
    filter: {
      CityName: initialFilters.data?.Cities.map((a) => a.CityName),
      DocumentType: undefined,
      ServiceName: undefined,
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
    },
  });

  const deferredFilter = useDeferredValue(filters);
  // const getTracker = api.depo.get30DaysTrack.useQuery(
  //   {
  //     filter: {
  //       CityName: trackerFilter.cities,
  //     },
  //   },
  //   {
  //     enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
  //     refetchOnWindowFocus: false,
  //   },
  // );

  const depo = api.depo.getAll.useQuery(deferredFilter, {
    enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
    refetchOnWindowFocus: false,
  });

  // const depo.data: any = useMemo(() => {
  //   return depo.data?.pages.map((page) => page).flat(1) || [];
  // }, [depo]);
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
                {initialFilters.data?.Cities && (
                  <LayoutGroup id="CityLevelMenu">
                    <InPageMenu
                      list={City_Levels.map((a) => a.name)}
                      startIndex={-1}
                      index={
                        column.getFilterValue()?.length ==
                        [
                          ...new Set(
                            initialFilters.data?.Cities.map(
                              (a) => a[column.id],
                            ),
                          ),
                        ].filter((item) => item != undefined)
                          ? -1
                          : undefined
                      }
                      onChange={(value) => {
                        const { setFilterValue } = column;
                        const cities = City_Levels.find(
                          (a) => a.name === value.item.name,
                        ).cities;

                        // beacuse our system is permission based we need to only show cities that are allowed to filter.
                        const canFilterCities = cities
                          .filter((city) =>
                            initialFilters.data.Cities.map((initCity) =>
                              getPersianToEnglishCity(initCity.CityName),
                            ).includes(city),
                          )
                          .map((cf) => getEnglishToPersianCity(cf));

                        if (cities.length <= 0) {
                          setFilterValue(
                            initialFilters.data.Cities.map((a) => a.CityName),
                          );
                        } else setFilterValue(canFilterCities);

                        // setTrackerFilter({
                        //   cities: canFilterCities,
                        // });
                      }}
                    />
                  </LayoutGroup>
                )}

                <SelectColumnFilter
                  column={column}
                  data={initialFilters.data?.Cities}
                  onChange={(filter) => {
                    // setTrackerFilter({
                    //   cities: filter.values,
                    // });
                  }}
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
                <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">نوع فعالیت</span>
                  <SelectColumnFilter
                    column={column}
                    data={depo.data?.result}
                    // translate={ServiceNames}
                    onChange={(filter) => {
                      // setDataFilters((prev) => {
                      //   return {
                      //     ...prev,
                      //     [filter.id]: filter.values,
                      //   };
                      // });
                    }}
                  />
                </div>
              </>
            );
          },
        },
        {
          header: "نوع پرونده",
          accessorKey: "DocumentType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع پرونده</span>
                <SelectColumnFilter
                  column={column}
                  data={depo.data?.result}
                  onChange={(filter) => {
                    // setDataFilters((prev) => {
                    //   return {
                    //     ...prev,
                    //     [filter.id]: filter.values,
                    //   };
                    // });
                  }}
                />
              </div>
            );
          },
        },
        {
          header: "تعداد دپو",
          accessorKey: "DepoCount",
          cell: ({ row }) => <span>{commify(row.original.DepoCount)}</span>,
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) + (row.getValue("DepoCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "تعداد ورودی",
          accessorKey: "EntryCount",
          cell: ({ row }) => <span>{commify(row.original.EntryCount)}</span>,
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) + (row.getValue("EntryCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "تعداد رسیدگی شده",
          accessorKey: "Capicity",
          cell: ({ row }) => <span>{commify(row.original.Capicity)}</span>,
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) + (row.getValue("Capicity") as number),
                  0,
                ),
            ),
        },
        {
          header: "مدت زمان اتمام دپو",
          accessorKey: "MyDepoCompletionTime",
          cell: ({ row }) => {
            const data = row.original;
            const result: number = calculateDepoCompleteTime(data);

            return <span dir="ltr">{result.toFixed(2)}</span>;
          },
        },
        {
          header: "وضعیت دپو",
          accessorKey: "DepoStatus",
          cell: ({ row }) => {
            const data = row.original;
            const result = calculateDepoCompleteTime(data);

            if (result < 0)
              return (
                <span className="text-red-400">دپو در حال افزایش است</span>
              );
            else if (result == 0)
              return <span className="text-amber-400">دپو صفر است</span>;
            // > 0
            else
              return (
                <span className="text-emerald-400 ">دپو در حال کاهش است</span>
              );
          },
        },
        {
          header: "بازه گزارش",
          accessorKey: "Start_Date",
          filterFn: "arrIncludesSome",
        },
      ],
      [depo.data],
    ) || [];

  return (
    <>
      <div
        className="flex  w-full flex-col items-center justify-center gap-5"
        dir="rtl"
      >
        <div className="flex w-full items-center justify-center  rounded-lg  py-5 text-center ">
          <Table
            isLoading={depo.isLoading}
            data={depo.data?.result ?? []}
            columns={columns}
            renderInFilterView={() => {
              return (
                <>
                  <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">بازه گزارش</span>

                    <DatePickerPeriodic
                      filter={deferredFilter}
                      reportPeriod={reportPeriod}
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
                        setDataFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              Start_Date: dates,
                            },
                          };
                        });
                      }}
                      setReportPeriod={setReportPeriod}
                    />
                  </div>
                </>
              );
            }}
            renderAfterFilterView={(flatRows) => {
              return (
                <>
                  {!depo.isLoading && depo.data.result.length > 0 && (
                    <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl bg-secbuttn p-5 xl:flex-row">
                      <FileBarChart2 className="stroke-accent" />
                      <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-sm  font-semibold text-emerald-900">
                        <DownloadCloudIcon />
                        <CSVLink
                          filename="جزئیات عملکرد شعب.csv"
                          headers={columns
                            .map((item) => {
                              return {
                                label: item.header,
                                //@ts-ignore
                                key: item.accessorKey,
                              };
                            })
                            .filter((f) => f.key != "Id")}
                          data={depo.data.result.map((item) => {
                            const depo: number =
                              calculateDepoCompleteTime(item);

                            let depoStatus = "";
                            if (depo < 0) depoStatus = "دپو در حال افزایش است";
                            else if (depo == 0) depoStatus = "دپو صفر است";
                            else depoStatus = "دپو در حال کاهش است";

                            return {
                              ...item,
                              MyDepoCompletionTime: depo.toFixed(2),
                              DepoStatus: depoStatus,
                            };
                          })}
                        >
                          دانلود دیتای کامل
                        </CSVLink>
                      </Button>
                      <Button className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-sm font-semibold text-amber-900">
                        <DownloadCloudIcon />
                        <CSVLink
                          filename="جزئیات عملکرد شعب (فیلتر شده).csv"
                          headers={columns
                            .map((item) => {
                              return {
                                label: item.header,
                                //@ts-ignore
                                key: item.accessorKey,
                              };
                            })
                            .filter((f) => f.key != "Id")}
                          data={flatRows.map((item) => {
                            const depo: number =
                              calculateDepoCompleteTime(item);

                            let depoStatus = "";
                            if (depo < 0) depoStatus = "دپو در حال افزایش است";
                            else if (depo == 0) depoStatus = "دپو صفر است";
                            else depoStatus = "دپو در حال کاهش است";

                            return {
                              ...item,
                              MyDepoCompletionTime: depo.toFixed(2),
                              DepoStatus: depoStatus,
                            };
                          })}
                        >
                          دانلود دیتای فیلتر شده
                        </CSVLink>
                      </Button>
                    </div>
                  )}
                </>
              );
            }}
            renderChild={(flatRows) => {
              // const dateDate = processDataForChart(flatRows, "Start_Date", [
              //   "DepoCount",
              //   "EntryCount",
              //   "Capicity",
              // ]);
              const serviceData = processDataForChart(flatRows, "ServiceName", [
                "DepoCount",
                "EntryCount",
                "Capicity",
              ]);
              const depoCompletionTime = processDepoCompleteTimeData(flatRows);

              const totalComplete =
                depoCompletionTime.reduce((accumulator, currentObject) => {
                  return accumulator + currentObject.DepoCompleteTime;
                }, 0) / flatRows.length;

              const maxDepoTime = Math.max(
                ...flatRows.map((row) => calculateDepoCompleteTime(row)),
              );

              const entryBaseOnSabt = sumColumnBasedOnRowValue(
                flatRows,
                "EntryCount",
                "ServiceName",
                [
                  ServiceNames["ثبت ارزیابی با اسکن مدارک"],
                  ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
                  ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
                ],
              );

              const capacityBaseOnSabt = sumColumnBasedOnRowValue(
                flatRows,
                "Capicity",
                "ServiceName",
                [
                  ServiceNames["ثبت ارزیابی با اسکن مدارک"],
                  ServiceNames["ثبت ارزیابی بدون اسکن مدارک"],
                  ServiceNames["ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)"],
                ],
              );
              const entry_capacity = [
                {
                  name: "ورودی",
                  value: entryBaseOnSabt,
                },
                {
                  name: "رسیدگی",
                  value: capacityBaseOnSabt,
                },
                {
                  name: "مانده",
                  value: entryBaseOnSabt - capacityBaseOnSabt,
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
                },
                {
                  name: "غیر مستقیم",
                  value: depoBaseOnSabtInDirect,
                },
              ];

              return (
                <>
                  <div className="flex w-full flex-col items-center justify-center gap-5">
                    <div className="flex w-full  flex-col items-center justify-center gap-5 xl:flex-row">
                      <div className="flex w-full  flex-col items-stretch justify-between gap-5 xl:flex-row">
                        <div className="flex w-full flex-col justify-center gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:p-5">
                          <H2 className="text-lg font-bold">
                            نمودار به تفکیک فعالیت
                          </H2>
                          {/* <ReBarChart
                            data={(serviceData ?? []).map((row) => {
                              return {
                                name: row.key,
                                "تعداد دپو": row.DepoCount,
                                "تعداد ورودی": row.EntryCount,
                                "تعداد رسیدگی": row.Capicity,
                              };
                            })}
                            index="name"
                            categories={[
                              "تعداد دپو",
                              "تعداد ورودی",
                              "تعداد رسیدگی",
                            ]}
                          /> */}
                          <ResponsiveContainer width="99%" height={300}>
                            <BarChart
                              showAnimation={true}
                              data={(serviceData ?? []).map((row) => {
                                return {
                                  name: ShortServiceNames[row.key],
                                  "تعداد دپو": row.DepoCount,
                                  "تعداد ورودی": row.EntryCount,
                                  "تعداد رسیدگی": row.Capicity,
                                };
                              })}
                              index="name"
                              categories={[
                                "تعداد دپو",
                                "تعداد ورودی",
                                "تعداد رسیدگی",
                              ]}
                              colors={["cyan", "rose", "emerald"]}
                              valueFormatter={commify}
                              yAxisWidth={20}
                              showXAxis
                              showGridLines={false}
                              noDataText={Text.noData.fa}
                              intervalType="preserveStartEnd"
                            />
                          </ResponsiveContainer>
                        </div>
                        {/* <div className="flex w-full flex-col gap-5  rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:p-5">
                          <H2>نمودار زمانی</H2>
                          <AreaChart
                            showAnimation={true}
                            data={(dateDate ?? []).map((row) => {
                              return {
                                date: row.key,

                                "تعداد دپو": row.DepoCount,
                                "تعداد ورودی": row.EntryCount,
                                "تعداد رسیدگی": row.Capicity,
                              };
                            })}
                            index="date"
                            //  categories={["پاراکلینیک", "بیمارستانی", "دارو"]}
                            categories={[
                              "تعداد دپو",
                              "تعداد ورودی",
                              "تعداد رسیدگی",
                            ]}
                            colors={["blue", "red", "green"]}
                            valueFormatter={commify}
                            noDataText={Text.noData.fa}
                          />
                        </div> */}
                      </div>
                    </div>

                    {/* <div className="flex w-full  items-center justify-center gap-5 laptopMax:flex-col">
                      <div className="flex w-full  flex-col items-stretch justify-between gap-5 rounded-2xl border border-dashed  border-accent/50 bg-secbuttn/50 p-5">
                        <H2>
                          زمان اتمام دپو |{" "}
                          <span className="text-primbuttn">{reportPeriod}</span>
                        </H2>
                        <div className="flex w-full items-stretch justify-between gap-5   laptopMax:flex-col">
                          {depoCompletionTime.map((t) => {
                            return (
                              <>
                                <div
                                  dir="ltr"
                                  className="flex w-full flex-col justify-center gap-5 rounded-2xl border border-dashed border-accent/10 bg-secondary/50 p-5"
                                >
                                  <H2>{t.ServiceName}</H2>
                                  <DonutChart
                                    data={[t]}
                                    category={"DepoCompleteTime"}
                                    index="ServiceName"
                                    colors={[
                                      getServiceNameColor(t.ServiceName),
                                    ]}
                                    valueFormatter={commify}
                                    noDataText={Text.noData.fa}
                                  />
                                </div>
                              </>
                            );
                          })}
                        </div>
                      </div>
                    </div> */}

                    <div className="flex w-full flex-col items-center justify-center gap-5">
                      <div className="flex w-full  items-center justify-center gap-5 laptopMax:flex-col">
                        <div className="flex w-full  flex-col items-center justify-between gap-5">
                          <>
                            {/* <TrackerView data={getTracker.data ?? []} /> */}

                            {/* <RadarGauge CityName={trackerFilter.cities} /> */}
                            <div className="flex w-full flex-col items-stretch justify-between gap-5 2xl:flex-row">
                              <div className="flex w-full flex-col justify-between gap-5 rounded-2xl border border-dashed border-primary bg-secbuttn p-2 ">
                                <H2>تعداد ورودی و رسیدگی شده</H2>
                                <ResponsiveContainer
                                  width="99%"
                                  height={"100%"}
                                >
                                  <DonutChart
                                    label={
                                      // depo.data?.result.length > 0
                                      //   ? " مانده : " +
                                      //     commify(
                                      //       entryBaseOnSabt -
                                      //         capacityBaseOnSabt,
                                      //     ).toString()
                                      //   : "داده ای موجود نیست"
                                      " "
                                    }
                                    data={entry_capacity}
                                    category="value"
                                    index="name"
                                    colors={["rose", "emerald", "lime"]}
                                    valueFormatter={commify}
                                    noDataText={Text.noData.fa}
                                  />
                                </ResponsiveContainer>

                                <div className="flex justify-stretch gap-2 ">
                                  <div className=" flex w-full flex-col justify-between gap-2 rounded-xl bg-rose-200 p-1 text-center font-bold text-accent ">
                                    <span className="text-rose-900">ورودی</span>
                                    <span className="text-rose-900">
                                      {commify(entryBaseOnSabt)}
                                    </span>
                                  </div>
                                  <div className=" flex w-full flex-col justify-between gap-2 rounded-xl bg-emerald-200 p-1 text-center font-bold text-accent ">
                                    <span className="  text-emerald-900">
                                      رسیدگی شده
                                    </span>
                                    <span className="text-emerald-900">
                                      {commify(capacityBaseOnSabt)}
                                    </span>
                                  </div>
                                  <div className=" flex w-full flex-col justify-between gap-2 rounded-xl bg-lime-200 p-1 text-center font-bold text-accent ">
                                    <span className="text-lime-900">مانده</span>
                                    <span className="text-lime-900">
                                      {commify(
                                        entryBaseOnSabt - capacityBaseOnSabt,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex w-full flex-col justify-between gap-5 rounded-2xl border border-dashed border-primary bg-secbuttn p-2">
                                <H2>تعداد دپو</H2>
                                <ResponsiveContainer
                                  width="99%"
                                  height={"100%"}
                                >
                                  <DonutChart
                                    data={depo_BaseOnSabt}
                                    category="value"
                                    index="name"
                                    colors={["fuchsia", "cyan"]}
                                    valueFormatter={commify}
                                    noDataText={Text.noData.fa}
                                  />
                                </ResponsiveContainer>
                                <div className="flex justify-stretch gap-2 ">
                                  <div className=" flex w-full justify-between rounded-xl bg-fuchsia-200 p-2 text-center font-bold text-accent ">
                                    <span className="text-fuchsia-900">
                                      دپو مستقیم
                                    </span>
                                    <span className="text-fuchsia-900">
                                      {commify(depoBaseOnSabtDirect)}
                                    </span>
                                  </div>
                                  <div className=" flex w-full justify-between rounded-xl bg-cyan-200 p-2 text-center font-bold text-accent ">
                                    <span className="  text-cyan-900">
                                      دپو غیر مستقیم
                                    </span>
                                    <span className="text-cyan-900">
                                      {commify(depoBaseOnSabtInDirect)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex w-full flex-col  justify-center gap-5 rounded-2xl border  bg-secbuttn/50 p-5 xl:max-w-md">
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
                                <ResponsiveContainer
                                  width="99%"
                                  height={"100%"}
                                >
                                  <DonutChart
                                    label={totalComplete.toFixed(2)}
                                    data={depoCompletionTime}
                                    category={"DepoCompleteTime"}
                                    index="ServiceName"
                                    colors={[
                                      "emerald",
                                      "yellow",
                                      "cyan",
                                      "red",
                                      "orange",
                                      "fuchsia",
                                    ]}
                                    valueFormatter={commify}
                                    noDataText={Text.noData.fa}
                                  />
                                </ResponsiveContainer>
                                {depo.data?.periodType && totalComplete > 0 && (
                                  <p className="w-full">
                                    <span className="text-accent">
                                      {Math.round(maxDepoTime)}{" "}
                                      {Reports_Period[depo.data?.periodType]}{" "}
                                      {/* {humanizeDuration(
                                        maxDepoTime,
                                        Reports_Period[depo.data?.periodType],
                                      )} */}
                                    </span>
                                    <span className="text-primary">
                                      تا اتمام دپو
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            }}
          />
        </div>
      </div>
    </>
  );
}

// type DetailType = {
//   label: string;
//   value: number;
//   bgColor: string;
//   foreColor: string;
// };
// function DetailsView({ data = [] }: { data: DetailType[] }) {
//   return (
//     <>
//       <div className="flex justify-stretch gap-2 ">
//         {data.map((item: DetailType) => {
//           return (
//             <>
//               <DetailItem
//                 label={item.label}
//                 value={item.value}
//                 bgColor={item.bgColor}
//                 foreColor={item.foreColor}
//               />
//             </>
//           );
//         })}
//       </div>
//     </>
//   );
// }

// function DetailItem({ label, value, bgColor, foreColor }: DetailType) {
//   return (
//     <>
//       <div
//         className={twMerge(
//           "flex w-full justify-between rounded-xl  p-2 text-center font-bold text-accent",
//           bgColor,
//         )}
//       >
//         <span className={twMerge(foreColor)}>{label}</span>
//         <span className={twMerge(foreColor)}>{commify(value)}</span>
//       </div>
//     </>
//   );
// }
