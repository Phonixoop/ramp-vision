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

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { RouterOutputs, api } from "~/utils/api";

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
  DistinctData,
  commify,
  convertNumberToBetterFormat,
  countColumnValues,
  en,
  getEnglishToPersianCity,
  getPerformanceText,
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
import MyBarList from "~/features/bar-list";
import Gauge from "~/features/gauge";
import { ColumnDef } from "@tanstack/react-table";
import DatePickerPeriodic from "~/features/date-picker-periodic";

import { toast } from "sonner";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtDateInfos,
  defualtRoles,
} from "~/constants/personnel-performance";
import {
  distinctPersonnelPerformanceData,
  calculatePerformance,
  getMonthNamesFromJOINED_date_strings,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import { CitiesPerformanceBarChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import { FilterType, PeriodType } from "~/context/personnel-filter.context";

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

export default function PersonnelPerformancePage() {
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
          <PersonnelPerformanceTable sessionData={sessionData} />
        </div>
      </div>
    </>
  );
}

function PersonnelPerformanceTable({ sessionData }) {
  // const [selectedDates, setSelectedDates] = useState<string[]>([
  //   moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
  // ]);

  const [reportPeriod, setReportPeriod] = useState<PeriodType>("روزانه");

  const getInitialCities = api.personnelPerformance.getInitialCities.useQuery(
    undefined,
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );

  const [filters, setDataFilters] = useState<FilterType>({
    periodType: reportPeriod,
    filter: {
      CityName: getInitialCities.data?.Cities,
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
      ProjectType: defaultProjectTypes,
      Role: defualtRoles,
      ContractType: defualtContractTypes,
      RoleType: [],
      DateInfo: defualtDateInfos,
    },
  });
  const initialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        DateInfo: filters.filter.DateInfo,
        ProjectType: filters.filter.ProjectType,
      },
    },
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );
  const deferredFilter = useDeferredValue(filters);

  const personnelPerformance = api.personnelPerformance.getAll.useQuery(
    deferredFilter,
    {
      enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
      select: (data) => {
        const dataWithThurdsdayEdit = data?.result?.map((item) => {
          const isThursday =
            moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

          // const count = item.COUNT > 0 ? item.COUNT : 1;
          return {
            ...item,
            TotalPerformance: isThursday
              ? calculatePerformance(item, 1, 2)
              : item.TotalPerformance,
          };
        });

        return {
          periodType: data.periodType,
          dateLength: data.dateLength,
          result: dataWithThurdsdayEdit,
        };
      },
      refetchOnWindowFocus: true,
    },
  );

  const DateInfos: string[] =
    initialFilters?.data?.DateInfos?.map((a) => a.DateInfo) ?? [];

  const Roles = [
    ...new Set(
      initialFilters?.data?.usersInfo?.map((a) => a.Role).filter((a) => a),
    ),
  ];

  const ContractTypes = [
    ...new Set(
      initialFilters?.data?.usersInfo
        ?.map((a) => a.ContractType)
        .filter((a) => a),
    ),
  ];

  const distincedData = useMemo(
    () =>
      distinctPersonnelPerformanceData(
        personnelPerformance.data,
        ["NationalCode", "NameFamily", "CityName"],
        [
          "CityName",
          "NationalCode",
          "NameFamily",
          "SabtAvalieAsnad",
          "PazireshVaSabtAvalieAsnad",
          "ArzyabiAsanadBimarsetaniDirect",
          "ArzyabiAsnadBimarestaniIndirect",
          "ArzyabiAsnadDandanVaParaDirect",
          "ArzyabiAsnadDandanVaParaIndirect",
          "ArzyabiAsnadDaroDirect",
          "ArzyabiAsnadDaroIndirect",
          "WithScanCount",
          "WithoutScanCount",
          "WithoutScanInDirectCount",
          "ArchiveDirectCount",
          "ArchiveInDirectCount",
          "Role",
          "RoleType",
          "ContractType",
          "ProjectType",
          "TotalPerformance",
          "Start_Date",
          "DateInfo",
        ],
      ),
    [personnelPerformance.data],
  );

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
        // CityName,NameFamily, ProjectType,ContractType,Role,RoleType,DateInfo
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

                        // if (
                        //   (canFilterCities.length <= 0 ||
                        //     canFilterCities.length > 3) &&
                        //   reportPeriod === "ماهانه" &&
                        //   initialFilters.data.Cities.length > 1
                        // ) {
                        //   toast("فیلتر غیر مجاز", {
                        //     description:
                        //       "به دلیل حجم بالای دیتا، لطفا در گزارش ماهانه، بیش از 3 شهر فیلتر نکنید",
                        //     action: {
                        //       label: "باشه",
                        //       onClick: () => {},
                        //     },
                        //   });
                        //   //  return;
                        // }
                        setDataFilters((prev) => {
                          return {
                            ...prev,
                            filter: {
                              CityName: canFilterCities.map(
                                getPersianToEnglishCity,
                              ),
                              Start_Date: prev.filter.Start_Date,
                            },
                          };
                        });
                      }}
                    />
                  </LayoutGroup>
                }

                <SelectColumnFilter
                  column={column}
                  data={initialFilters.data?.Cities}
                  onChange={(filter) => {
                    // if (
                    //   (filter.values.length <= 0 || filter.values.length > 3) &&
                    //   reportPeriod === "ماهانه" &&
                    //   initialFilters.data.Cities.length > 1
                    // ) {
                    //   toast("فیلتر غیر مجاز", {
                    //     description:
                    //       "به دلیل حجم بالای دیتا، لطفا در گزارش ماهانه، بیش از 3 شهر فیلتر نکنید",
                    //     action: {
                    //       label: "باشه",
                    //       onClick: () => {},
                    //     },
                    //   });
                    //   // return;
                    // }
                    //@ts-ignore
                    setDataFilters((prev) => {
                      return {
                        ...prev,
                        filter: {
                          ...prev.filter,
                          CityName: filter.values.map(getPersianToEnglishCity),
                          Start_Date: prev.filter.Start_Date,
                        },
                      };
                    });
                  }}
                />
              </div>
            );
          },
        },
        {
          header: "کابران",
          hSticky: true,
          width: 200,
          accessorKey: "NameFamily",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <>
                <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">پرسنل</span>
                  <SelectColumnFilter
                    column={column}
                    data={personnelPerformance.data?.result}
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
          header: "نوع پروژه",
          hSticky: true,
          width: 200,
          accessorKey: "ProjectType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع پروژه</span>
                <SelectColumnFilter
                  initialFilters={
                    filters.filter.ProjectType ?? defaultProjectTypes
                  }
                  column={column}
                  data={initialFilters?.data?.ProjectTypes.map((a) => {
                    return {
                      ProjectType: a,
                    };
                  })}
                  onChange={(filter) => {
                    setDataFilters((prev) => {
                      return {
                        ...prev,
                        filter: {
                          ...prev.filter,
                          [filter.id]: filter.values,
                        },
                      };
                    });
                  }}
                />
              </div>
            );
          },
        },
        {
          header: "نوع قرارداد",
          hSticky: true,
          width: 200,
          accessorKey: "ContractType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع قرارداد</span>
                <SelectColumnFilter
                  initialFilters={
                    filters.filter.ContractType ??
                    defualtContractTypes.filter((item) =>
                      ContractTypes.includes(item),
                    )
                  }
                  column={column}
                  data={personnelPerformance.data?.result}
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
          header: "سمت",
          hSticky: true,
          width: 250,
          accessorKey: "Role",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">سمت</span>
                <SelectColumnFilter
                  initialFilters={
                    filters.filter.Role ??
                    defualtRoles.filter((item) => Roles.includes(item))
                  }
                  column={column}
                  data={personnelPerformance.data?.result}
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
          header: "نوع سمت",
          enablePinning: true,
          hSticky: true,
          accessorKey: "RoleType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع سمت</span>
                <SelectColumnFilter
                  column={column}
                  data={personnelPerformance.data?.result}
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
          header: "عملکرد",
          accessorKey: "TotalPerformance",
          cell: ({ row }) => (
            <span>{row.original.TotalPerformance.toFixed(2)}</span>
          ),
          footer: ({ table }) =>
            commify(
              Math.round(
                table
                  .getFilteredRowModel()
                  .rows.reduce(
                    (total, row) =>
                      (total as number) +
                      (row.getValue("TotalPerformance") as number),
                    0,
                  ),
              ),
            ),
        },
        {
          header: "ثبت اولیه اسناد",
          accessorKey: "SabtAvalieAsnad",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("SabtAvalieAsnad") as number),
                  0,
                ),
            ),
        },
        {
          header: "پذیرش و ثبت اولیه اسناد",
          accessorKey: "PazireshVaSabtAvalieAsnad",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("PazireshVaSabtAvalieAsnad") as number),
                  0,
                ),
            ),
        },
        {
          header: "ارزیابی اسناد بیمارستانی مستقیم",
          accessorKey: "ArzyabiAsanadBimarsetaniDirect",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArzyabiAsanadBimarsetaniDirect") as number),
                  0,
                ),
            ),
        },
        {
          header: "ارزیابی اسناد بیمارستانی غیر مستقیم",
          accessorKey: "ArzyabiAsnadBimarestaniIndirect",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArzyabiAsnadBimarestaniIndirect") as number),
                  0,
                ),
            ),
        },
        {
          header: "ارزیابی اسناد دندان و پارا مستقیم",
          accessorKey: "ArzyabiAsnadDandanVaParaDirect",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArzyabiAsnadDandanVaParaDirect") as number),
                  0,
                ),
            ),
        },
        {
          header: "ارزیابی اسناد دندان و پارا غیر مستقیم",
          accessorKey: "ArzyabiAsnadDandanVaParaIndirect",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue(
                      "ArzyabiAsnadDandanVaParaIndirect",
                    ) as number),
                  0,
                ),
            ),
        },
        {
          header: "ارزیابی اسناد دارو مستقیم",
          accessorKey: "ArzyabiAsnadDaroDirect",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArzyabiAsnadDaroDirect") as number),
                  0,
                ),
            ),
        },
        {
          header: "ازیابی اسناد دارو غیر مستقیم",
          accessorKey: "ArzyabiAsnadDaroIndirect",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArzyabiAsnadDaroIndirect") as number),
                  0,
                ),
            ),
        },
        {
          header: "ثبت ارزیابی با اسکن مدارک",
          accessorKey: "WithScanCount",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("WithScanCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
          accessorKey: "WithoutScanInDirectCount",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("WithoutScanInDirectCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "ثبت ارزیابی بدون اسکن مدارک",
          accessorKey: "WithoutScanCount",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("WithoutScanCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "بایگانی مستقیم",
          accessorKey: "ArchiveDirectCount",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArchiveDirectCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "بایگانی غیر مستقیم",
          accessorKey: "ArchiveInDirectCount",
          footer: ({ table }) =>
            commify(
              table
                .getFilteredRowModel()
                .rows.reduce(
                  (total, row) =>
                    (total as number) +
                    (row.getValue("ArchiveInDirectCount") as number),
                  0,
                ),
            ),
        },
        {
          header: "بازه گزارش",
          accessorKey: "Start_Date",
          filterFn: "arrIncludesSome",
          cell: ({ row }) => {
            if (personnelPerformance.data.periodType === "هفتگی")
              return (
                <>
                  {getMonthNamesFromJOINED_date_strings(
                    filters.filter.Start_Date.join(","),
                    personnelPerformance.data.periodType,
                  )}
                </>
              );

            if (personnelPerformance.data.periodType === "ماهانه")
              return (
                <>
                  {getMonthNamesFromJOINED_date_strings(
                    row.original.Start_Date,
                    personnelPerformance.data.periodType,
                  )}
                </>
              );

            if (personnelPerformance.data.periodType === "روزانه")
              return <>{filters.filter.Start_Date.join(",")}</>;
          },
        },
        {
          header: "تاریخ گزارش پرسنل",
          accessorKey: "DateInfo",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            if (initialFilters.isLoading) return;
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">
                  تاریخ گزارش پرسنل
                </span>

                <SelectColumnFilter
                  singleSelect
                  column={column}
                  initialFilters={filters.filter.DateInfo ?? [DateInfos[0]]}
                  data={DateInfos.map((a) => {
                    return {
                      DateInfo: a,
                    };
                  })}
                  onChange={(filter) => {
                    setDataFilters((prev) => {
                      return {
                        ...prev,
                        filter: {
                          ...prev.filter,
                          [filter.id]: filter.values.filter((a) => a),
                        },
                      };
                    });
                  }}
                />
              </div>
            );
          },
        },
      ],
      [personnelPerformance.data],
    ) || [];

  return (
    <>
      <div
        className="flex  w-full flex-col items-center justify-center gap-5"
        dir="rtl"
      >
        <div className="flex w-full items-center justify-center  rounded-lg  py-5 text-center ">
          <Table
            hasClickAction
            onClick={(row) => {
              const original = row.original;
              toast(original.NameFamily, {
                description: `
                عملکرد : ${Math.round(original.TotalPerformance)} | ${
                  getPerformanceMetric(original.TotalPerformance).tooltip.text
                }
                `,
                action: {
                  label: "باشه",
                  onClick: () => {},
                },
              });
            }}
            isLoading={personnelPerformance.isLoading}
            data={
              personnelPerformance?.data?.periodType === "روزانه"
                ? personnelPerformance?.data?.result
                : distincedData
            }
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
                  {!personnelPerformance.isLoading &&
                    personnelPerformance.data.result?.length > 0 && (
                      <div className="flex w-full flex-col items-center justify-center gap-5  rounded-2xl bg-secbuttn p-5 xl:flex-row">
                        <FileBarChart2 className="stroke-accent" />
                        <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-sm  font-semibold text-emerald-900">
                          <DownloadCloudIcon />
                          <CSVLink
                            filename="جزئیات عملکرد پرسنل.csv"
                            headers={columns
                              .map((item) => {
                                return {
                                  label: item.header,
                                  //@ts-ignore
                                  key: item.accessorKey,
                                };
                              })
                              .filter((f) => f.key != "Id")}
                            data={personnelPerformance.data.result.map(
                              (row: any) => {
                                let Start_Date = "";
                                if (
                                  personnelPerformance.data.periodType ===
                                  "هفتگی"
                                )
                                  Start_Date =
                                    getMonthNamesFromJOINED_date_strings(
                                      filters.filter.Start_Date.join(","),
                                      personnelPerformance.data.periodType,
                                    );

                                if (
                                  personnelPerformance.data.periodType ===
                                  "ماهانه"
                                )
                                  Start_Date =
                                    getMonthNamesFromJOINED_date_strings(
                                      row.Start_Date,
                                      personnelPerformance.data.periodType,
                                    );

                                if (
                                  personnelPerformance.data.periodType ===
                                  "روزانه"
                                )
                                  Start_Date =
                                    filters.filter.Start_Date.join(",");

                                return {
                                  ...row,
                                  Start_Date,
                                };
                              },
                            )}
                          >
                            دانلود دیتای کامل
                          </CSVLink>
                        </Button>
                        <Button className="font-bo font flex justify-center gap-1 rounded-3xl bg-amber-300 text-sm font-semibold text-amber-900">
                          <DownloadCloudIcon />
                          <CSVLink
                            filename="جزئیات عملکرد پرسنل (فیلتر شده).csv"
                            headers={columns
                              .map((item) => {
                                return {
                                  label: item.header,
                                  //@ts-ignore
                                  key: item.accessorKey,
                                };
                              })
                              .filter((f) => f.key != "Id")}
                            data={flatRows.map((row: any) => {
                              let Start_Date = "";
                              if (
                                personnelPerformance.data.periodType === "هفتگی"
                              )
                                Start_Date =
                                  getMonthNamesFromJOINED_date_strings(
                                    filters.filter.Start_Date.join(","),
                                    personnelPerformance.data.periodType,
                                  );

                              if (
                                personnelPerformance.data.periodType ===
                                "ماهانه"
                              )
                                Start_Date =
                                  getMonthNamesFromJOINED_date_strings(
                                    row.Start_Date,
                                    personnelPerformance.data.periodType,
                                  );

                              if (
                                personnelPerformance.data.periodType ===
                                "روزانه"
                              )
                                Start_Date =
                                  filters.filter.Start_Date.join(",");

                              return {
                                ...row,
                                Start_Date,
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
              const roleData = countColumnValues(
                flatRows,
                "Role",
                defualtRoles,
              );

              const sumOfPerformances = flatRows.reduce((acc, row) => {
                return acc + row.TotalPerformance;
              }, 0);

              const totalPerformance = sumOfPerformances / flatRows.length;
              return (
                <>
                  <div className="flex w-full flex-col items-center justify-center gap-5">
                    <div className="flex w-full  flex-col items-center justify-center gap-5 xl:flex-row">
                      <div className="flex w-full  flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn/50 py-4 sm:py-0 xl:flex-row">
                        <div className="flex flex-col justify-center gap-10 rounded-2xl py-4  sm:bg-secbuttn  xl:w-1/2 xl:p-5">
                          <H2 className="text-xl font-bold">
                            تعداد پرسنل به تفکیک سمت
                          </H2>
                          <MyBarList
                            data={(roleData ?? []).map((row) => {
                              return {
                                name: row.name,
                                value: row.count,
                              };
                            })}
                            //  categories={["پاراکلینیک", "بیمارستانی", "دارو"]}

                            // valueFormatter={commify}
                          />
                        </div>
                        <div className="flex w-full flex-col items-center  justify-between gap-5 rounded-2xl xl:w-1/2">
                          <div className="flex w-full flex-col items-center justify-between gap-5  rounded-2xl py-5 xl:w-auto  xl:p-5">
                            <H2>عملکرد</H2>

                            <Gauge value={totalPerformance} />
                            <p className="text-accent">
                              {getPerformanceText(totalPerformance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            }}
            // renderAfterTable={(flatRows) => {
            //   return (
            //     <>
            //       <div className="flex w-full flex-col items-center justify-center gap-5">
            //         <CitiesPerformanceBarChart
            //           filters={{
            //             ...filters,
            //             filter: {
            //               ...filters.filter,
            //               CityName: [],
            //             },
            //           }}
            //         />
            //       </div>
            //     </>
            //   );
            // }}
          />
        </div>
      </div>
    </>
  );
}
