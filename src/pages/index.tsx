import { ArrowDownRightIcon, UserCog2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import Menu, { InPageMenu } from "~/features/menu";

import Table from "~/features/table";

import { ThemeBoxHovery } from "~/features/theme-box";

import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";

import { useDeferredValue, useMemo, useState } from "react";
import { api } from "~/utils/api";
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
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  calculateDepoCompleteTime,
  en,
  getServiceNameColor,
  processDataForChart,
  processDepoCompleteTimeData,
} from "~/utils/util";
import H2 from "~/ui/heading/h2";
import TrackerView from "~/features/tracker";
import { Reports_Period } from "~/constants";
import { cn } from "~/lib/utils";
import { Column } from "react-table";
const menu = [
  {
    value: "خانه",
    link: "/",
  },
  {
    value: "درباره ویژن",
    link: "atysa.ir",
  },
  {
    value: "داشبورد",
    link: "/dashboard",
  },
];

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
function filterColumn(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    // console.log(rowValue, filterValue);
    return filterValue.includes(rowValue);
  });
}
export default function Home() {
  // const users = api.example.getAll.useQuery();
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <title>RAMP | Vision</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlurBackground />
      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000 ">
        <Container
          className="flex  flex-col items-center justify-between py-5 sm:p-0 "
          rtl={true}
        >
          <div className="flex items-center justify-center gap-4 py-5 ">
            <AuthShowcase />
            <Menu rootPath="/" list={menu} />
          </div>
        </Container>

        {/* <div className="grid max-h-screen w-11/12 grid-cols-4 grid-rows-3 gap-4">
          <div className="bg-red-300">1</div>
          <div className="bg-red-300">2</div>
          <div className="bg-red-300">3</div>
          <div className="col-start-1 row-start-2  bg-green-300">4</div>
          <div className="col-start-2 row-start-2  bg-green-300">5</div>
          <div className="col-start-3 row-start-2  bg-green-300">6</div>
          <div className="col-span-3 col-start-1 row-start-3  overflow-hidden ">
            <div className=" w-full "></div>
          </div>
          <div className="col-start-4 row-span-3 row-start-1"></div>
        </div> */}

        <Container className="sm:p-0 ">
          <DeposTable sessionData={sessionData} />
        </Container>
        <div className=" pt-9">
          <ThemeBoxHovery />
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
  const [selectedDates, setSelectedDates] = useState<string[]>([
    moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
  ]);

  const [reportPeriod, setReportPeriod] = useState<string>("روزانه");
  const initialFilters = api.depo.getInitialFilters.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });

  const [filters, setDataFilters] = useState({
    periodType: reportPeriod,
    filter: {
      CityName: initialFilters.data?.Cities.map((a) => a.CityName),
      DocumentType: undefined,
      ServiceName: undefined,
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
  });
  const deferredFilter = useDeferredValue(filters);
  const getTracker = api.depo.get30DaysTrack.useQuery(
    {
      filter: {
        CityName: deferredFilter.filter.CityName,
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
    useMemo<Column<any>[]>(
      () => [
        {
          Header: "#",
          accessor: "number",
          Cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.index + 1}
              </div>
            );
          },
        },
        {
          Header: "نام سرویس",
          accessor: "ServiceName",
          filter: filterColumn,
          Filter: ({ column }) => {
            return (
              <SelectColumnFilter
                column={column}
                data={depo.data}
                onChange={(filter) => {
                  // setDataFilters((prev) => {
                  //   return {
                  //     ...prev,
                  //     [filter.id]: filter.values,
                  //   };
                  // });
                }}
              />
            );
          },
        },
        {
          Header: "شهر",
          accessor: "CityName",
          filter: filterColumn,
          Filter: ({ column }) => {
            return (
              <SelectColumnFilter
                column={column}
                data={initialFilters.data?.Cities}
                onChange={(filter) => {
                  // setDataFilters((prev) => {
                  //   return {
                  //     ...prev,
                  //     [filter.id]: filter.values,
                  //   };
                  // });
                }}
              />
            );
          },
        },

        {
          Header: "نوع سند",
          accessor: "DocumentType",
          filter: filterColumn,
          Filter: ({ column }) => {
            return (
              <SelectColumnFilter
                column={column}
                data={depo.data}
                onChange={(filter) => {
                  // setDataFilters((prev) => {
                  //   return {
                  //     ...prev,
                  //     [filter.id]: filter.values,
                  //   };
                  // });
                }}
              />
            );
          },
        },
        {
          Header: "تعداد بلاتکلیف",
          accessor: "DepoCount",
        },
        {
          Header: "تعداد ورودی",
          accessor: "EntryCount",
        },
        {
          Header: "تعداد رسیدگی شده",
          accessor: "Capicity",
        },
        {
          Header: "مدت زمان اتمام دپو",
          accessor: "MyDepoCompletionTime",
          Cell: ({ row }) => {
            const data = row.original;
            var result = calculateDepoCompleteTime(data);
            if (result <= 0)
              return (
                <span className="text-red-400">دپو در حال افزایش است</span>
              );
            return result;
          },
        },
        {
          Header: "تاریخ",
          accessor: "Start_Date",
          filter: filterColumn,
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
        <div className="w-full  rounded-lg  bg-secondary py-5 text-center ">
          <Table
            isLoading={depo.isLoading}
            data={depo.data ?? []}
            columns={columns}
            renderInFilterView={() => {
              return (
                <>
                  <div className="flex flex-col gap-2 rounded-xl bg-secbuttn p-5">
                    <InPageMenu
                      className=" rounded-xl "
                      list={Reports_Period}
                      value={0}
                      onChange={(value) => {
                        setReportPeriod(value.item.name);
                      }}
                    />

                    <DatePicker
                      inputClass="text-center"
                      multiple={reportPeriod !== "ماهانه"}
                      value={deferredFilter.filter.Start_Date}
                      calendar={persian}
                      locale={persian_fa}
                      weekPicker={reportPeriod === "هفتگی"}
                      onlyMonthPicker={reportPeriod === "ماهانه"}
                      plugins={[<DatePanel />]}
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
            renderChild={(rows) => {
              const flatRows = rows.map((row) => row.original);
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

              return (
                <>
                  <div className="flex w-full flex-col items-center justify-center gap-5">
                    <div className="flex w-full  items-center justify-center gap-5 laptopMax:flex-col">
                      <div className="flex w-11/12  items-stretch justify-between gap-5 laptopMax:flex-col">
                        <div className="flex w-full flex-col justify-center gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 p-5">
                          <H2>نمودار دپو</H2>
                          <BarChart
                            showAnimation={true}
                            dir="rtl"
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
                            // valueFormatter={dataFormatter}
                            yAxisWidth={48}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-5  rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 p-5">
                          <H2>نمودار زمانی </H2>
                          <AreaChart
                            dir="rtl"
                            showAnimation={true}
                            data={(dateDate ?? []).map((row) => {
                              return {
                                date: moment(row.key, "YYYY/MM/DD").format(
                                  "M/D",
                                ),

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
                            // valueFormatter={dataFormatter}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full  items-center justify-center gap-5 laptopMax:flex-col">
                      <div className="flex w-11/12  flex-col items-stretch justify-between gap-5 rounded-2xl border border-dashed  border-accent/50 bg-secbuttn/50 p-5">
                        <H2>زمان اتمام دپو | {reportPeriod}</H2>
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
                                  />
                                </div>
                              </>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-center justify-center gap-5">
                      <div className="flex w-full  items-center justify-center gap-5 laptopMax:flex-col">
                        <div className="flex w-11/12  items-center justify-center gap-5 laptopMax:flex-col">
                          {!getTracker.isLoading && (
                            <>
                              <div className="w-full max-w-md ">
                                <TrackerView data={getTracker.data} />
                              </div>
                              <div className="relative w-full max-w-md rounded-2xl  border-primary bg-secondary p-6 text-right  ring-1 ring-accent/20  ">
                                <H2>تمامی شعبه ها</H2>
                                <span className="text-3xl">10,483</span>
                                <CategoryBar
                                  className="mt-4"
                                  values={[6724, 3621]}
                                  colors={["emerald", "red"]}
                                />
                                <Legend
                                  dir="ltr"
                                  className="mt-3"
                                  categories={["شعب فعال", "شعب غیر فعال"]}
                                  colors={["emerald", "red"]}
                                />
                              </div>
                            </>
                          )}
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

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <>
      <Button
        className="flex items-stretch justify-center gap-2 rounded-full bg-secbuttn stroke-accent px-3 text-accent"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span className="pt-1">
          {sessionData ? sessionData.user?.username : "ورود"}
        </span>
        <span>
          <UserCog2 />
        </span>
      </Button>
    </>
  );
}
