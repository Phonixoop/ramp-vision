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
import { default as DatePickerButton } from "react-multi-date-picker/components/button";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  calculateDepoCompleteTime,
  commify,
  convertNumberToBetterFormat,
  en,
  getServiceNameColor,
  humanizeDuration,
  processDataForChart,
  processDepoCompleteTimeData,
  sumColumnBasedOnRowValue,
} from "~/utils/util";
import H2 from "~/ui/heading/h2";
import TrackerView from "~/features/tracker";
import { City_Levels, Reports_Period, Text } from "~/constants";
import { cn } from "~/lib/utils";
import { Column } from "react-table";
import Header from "~/features/header";
import { LayoutGroup } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";

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
        <Header />

        <div className="w-full sm:p-0  xl:w-11/12">
          <DeposTable sessionData={sessionData} />
        </div>
      </div>
    </>
  );
}
const cities = [
  {
    name: "New York",
    sales: 9800,
  },
  {
    name: "London",
    sales: 4567,
  },
  {
    name: "Hong Kong",
    sales: 3908,
  },
  {
    name: "San Francisco",
    sales: 2400,
  },
  {
    name: "Singapore",
    sales: 1908,
  },
  {
    name: "Zurich",
    sales: 1398,
  },
];

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
  const [trackerFilter, setTrackerFilter] = useState({
    cities: initialFilters.data?.Cities.map((a) => a.CityName),
  });
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
  const getTracker = api.depo.get30DaysTrack.useQuery(
    {
      filter: {
        CityName: trackerFilter.cities,
      },
    },
    {
      enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
      refetchOnWindowFocus: false,
    },
  );

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
          header: "نام فعالیت",
          accessorKey: "ServiceName",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <>
                <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">فعالیت ها</span>
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
              </>
            );
          },
        },
        {
          header: "شهر",
          accessorKey: "CityName",
          filterFn: "arrIncludesSome",

          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">شهر ها</span>
                {initialFilters.data?.Cities && (
                  <LayoutGroup id="CityLevelMenu">
                    <InPageMenu
                      list={City_Levels.map((a) => a.name)}
                      value={0}
                      onChange={(value) => {
                        const { setFilterValue } = column;
                        const cities = City_Levels.find(
                          (a) => a.name === value.item.name,
                        ).cities;

                        // beacuse our system is permission based we need to only filter allowed cities.
                        const canFilterCities = cities.filter((city) =>
                          initialFilters.data.Cities.map(
                            (a) => a.CityName,
                          ).includes(city),
                        );

                        if (cities.length <= 0) {
                          setFilterValue(
                            initialFilters.data.Cities.map((a) => a.CityName),
                          );
                        } else setFilterValue(canFilterCities);

                        setTrackerFilter({
                          cities: canFilterCities,
                        });
                      }}
                    />
                  </LayoutGroup>
                )}

                <SelectColumnFilter
                  column={column}
                  data={initialFilters.data?.Cities}
                  onChange={(filter) => {
                    setTrackerFilter({
                      cities: filter.values,
                    });
                  }}
                />
              </div>
            );
          },
        },

        {
          header: "نوع سند",
          accessorKey: "DocumentType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            console.log({ column });
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">سند ها</span>
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
          header: "تعداد بلاتکلیف",
          accessorKey: "DepoCount",
          cell: ({ row }) => <span>{commify(row.original.DepoCount)}</span>,
        },
        {
          header: "تعداد ورودی",
          accessorKey: "EntryCount",
          cell: ({ row }) => <span>{commify(row.original.EntryCount)}</span>,
        },
        {
          header: "تعداد رسیدگی شده",
          accessorKey: "Capicity",
          cell: ({ row }) => <span>{commify(row.original.Capicity)}</span>,
        },
        {
          header: "مدت زمان اتمام دپو",
          accessorKey: "MyDepoCompletionTime",
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
          header: "تاریخ",
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
                  <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">تاریخ</span>
                    <LayoutGroup id="DateMenu">
                      <InPageMenu
                        list={Object.keys(Reports_Period)}
                        value={0}
                        onChange={(value) => {
                          setReportPeriod(value.item.name);
                        }}
                      />
                    </LayoutGroup>
                    {/* {deferredFilter.filter.Start_Date} */}
                    <DatePicker
                      //@ts-ignore
                      render={(value, openCalendar) => {
                        const seperator =
                          deferredFilter.periodType == "روزانه" ? " , " : " ~ ";
                        return (
                          <Button
                            className="w-full border border-dashed border-accent text-center hover:bg-accent/20"
                            onClick={openCalendar}
                          >
                            {deferredFilter.filter.Start_Date.join(seperator)}
                          </Button>
                        );
                      }}
                      inputClass="text-center"
                      multiple={reportPeriod !== "ماهانه"}
                      value={deferredFilter.filter.Start_Date}
                      calendar={persian}
                      locale={persian_fa}
                      weekPicker={reportPeriod === "هفتگی"}
                      onlyMonthPicker={reportPeriod === "ماهانه"}
                      plugins={[<DatePanel key={"00DatePanel"} />]}
                      onClose={() => {
                        setDataFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              Start_Date: selectedDates,
                            },
                          };
                        });
                      }}
                      onChange={(date) => {
                        //@ts-ignore
                        if (!date) return;

                        if (Array.isArray(date) && date.length <= 0) return;
                        const dates = Array.isArray(date)
                          ? date.map((a) => en(a.format("YYYY/MM/DD")))
                          : [en(date.format("YYYY/MM/DD"))];
                        setSelectedDates(dates);

                        // setSelectedDates((prevState) => dates);
                      }}
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
                          filename="کامل.csv"
                          headers={columns
                            .map((item) => {
                              return {
                                label: item.header,
                                //@ts-ignore
                                key: item.accessorKey,
                              };
                            })
                            .filter((f) => f.key != "Id")}
                          data={depo.data.result}
                        >
                          دانلود دیتای کامل
                        </CSVLink>
                      </Button>
                      <Button className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-sm font-semibold text-amber-900">
                        <DownloadCloudIcon />
                        <CSVLink
                          filename="فیلتر شده.csv"
                          headers={columns
                            .map((item) => {
                              return {
                                label: item.header,
                                //@ts-ignore
                                key: item.accessorKey,
                              };
                            })
                            .filter((f) => f.key != "Id")}
                          data={flatRows}
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
              const dateDate = processDataForChart(flatRows, "Start_Date", [
                "DepoCount",
                "EntryCount",
                "Capicity",
              ]);
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
              const entryBaseOnSabt = sumColumnBasedOnRowValue(
                flatRows,
                "EntryCount",
                "ServiceName",
                [
                  "ثبت ارزیابی با اسکن مدارک",
                  "ثبت ارزیابی بدون اسکن مدارک",
                  "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
                ],
              );

              const capacityBaseOnSabt = sumColumnBasedOnRowValue(
                flatRows,
                "Capicity",
                "ServiceName",
                [
                  "ثبت ارزیابی با اسکن مدارک",
                  "ثبت ارزیابی بدون اسکن مدارک",
                  "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
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
              ];

              return (
                <>
                  <div className="flex w-full flex-col items-center justify-center gap-5">
                    <div className="flex w-full  flex-col items-center justify-center gap-5 xl:flex-row">
                      <div className="flex w-full  flex-col items-stretch justify-between gap-5 xl:flex-row">
                        <div className="flex w-full flex-col justify-center gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:p-5">
                          <H2>نمودار به تفکیک فعالیت</H2>
                          <BarChart
                            showAnimation={true}
                            data={(serviceData ?? []).map((row) => {
                              return {
                                name: row.key,
                                "تعداد بلاتکلیف": row.DepoCount,
                                "تعداد ورودی": row.EntryCount,
                                "تعداد رسیدگی": row.Capicity,
                              };
                            })}
                            index="name"
                            showXAxis={false}
                            //  categories={["پاراکلینیک", "بیمارستانی", "دارو"]}
                            categories={[
                              "تعداد بلاتکلیف",
                              "تعداد ورودی",
                              "تعداد رسیدگی",
                            ]}
                            colors={["blue", "red", "green"]}
                            valueFormatter={commify}
                            yAxisWidth={48}
                            noDataText={Text.noData.fa}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-5  rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:p-5">
                          <H2>نمودار زمانی</H2>
                          <AreaChart
                            showAnimation={true}
                            data={(dateDate ?? []).map((row) => {
                              return {
                                date: row.key,

                                "تعداد بلاتکلیف": row.DepoCount,
                                "تعداد ورودی": row.EntryCount,
                                "تعداد رسیدگی": row.Capicity,
                              };
                            })}
                            index="date"
                            //  categories={["پاراکلینیک", "بیمارستانی", "دارو"]}
                            categories={[
                              "تعداد بلاتکلیف",
                              "تعداد ورودی",
                              "تعداد رسیدگی",
                            ]}
                            colors={["blue", "red", "green"]}
                            valueFormatter={commify}
                            noDataText={Text.noData.fa}
                          />
                        </div>
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
                        <div className="flex w-full  items-stretch justify-between gap-5 laptopMax:flex-col-reverse">
                          <>
                            <TrackerView data={getTracker.data ?? []} />

                            <div
                              dir="ltr"
                              className="flex w-full flex-col   justify-center gap-5 rounded-2xl  border border-dashed border-accent/50 bg-secbuttn/50 p-5 xl:w-5/12"
                            >
                              <H2>تعداد ورودی و رسیدگی شده</H2>
                              <DonutChart
                                label={
                                  depo.data?.result.length > 0
                                    ? " مانده : " +
                                      commify(
                                        Math.abs(
                                          capacityBaseOnSabt - entryBaseOnSabt,
                                        ),
                                      ).toString()
                                    : "داده ای موجود نیست"
                                }
                                data={entry_capacity}
                                category="value"
                                index="name"
                                colors={["red", "green"]}
                                valueFormatter={commify}
                                noDataText={Text.noData.fa}
                              />
                            </div>
                            <div className="flex w-full flex-col  justify-center gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 p-5 xl:max-w-md">
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
                              {depo.data?.periodType && totalComplete > 0 && (
                                <p className="w-full">
                                  <span className="text-accent">
                                    {humanizeDuration(
                                      totalComplete,
                                      Reports_Period[depo.data?.periodType],
                                    )}
                                  </span>{" "}
                                  <span className="text-primary">
                                    تا اتمام دپو
                                  </span>
                                </p>
                              )}
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

function UsersSkeleton() {
  return (
    <>
      {[...Array(11).keys()].map((i) => {
        return (
          <>
            <span
              key={i}
              className="inline-block h-12 w-full animate-pulse rounded-xl bg-accent opacity-30"
              style={{
                animationDelay: `${i * 5}`,
                animationDuration: "1s",
              }}
            />
          </>
        );
      })}
    </>
  );
}
