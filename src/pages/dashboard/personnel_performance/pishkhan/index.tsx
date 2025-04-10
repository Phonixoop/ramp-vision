import { DownloadCloudIcon, FileBarChart2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { CSVLink } from "react-csv";
import { InPageMenu } from "~/features/menu";

import Table from "~/features/table";

import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";

import { SelectColumnFilter } from "~/features/checkbox-list";

import moment from "jalali-moment";

import {
  arrIncludeExcat,
  commify,
  countColumnValues,
  en,
  getEnglishToPersianCity,
  getPerformanceText,
  getPersianToEnglishCity,
} from "~/utils/util";
import H2 from "~/ui/heading/h2";

import { City_Levels } from "~/constants";

import { LayoutGroup } from "framer-motion";
import MyBarList from "~/features/bar-list";
import Gauge from "~/features/gauge";
import { ColumnDef } from "@tanstack/react-table";
import DatePickerPeriodic from "~/features/date-picker-periodic";

import { toast } from "sonner";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import {
  distinctPersonnelPerformanceData,
  calculatePerformance,
  getMonthNamesFromJOINED_date_strings,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import { FilterType, PeriodType } from "~/context/personnel-filter.context";
import { sortDates } from "~/lib/utils";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";

// const dataFormatter = (number: number) => {
//   return "$ " + Intl.NumberFormat("us").format(number).toString();
// };

// function filterColumn(rows, id, filterValue) {
//   return rows.filter((row) => {
//     const rowValue = row.values[id];
//     // console.log(rowValue, filterValue);
//     return filterValue.includes(rowValue);
//   });
// }

export default function PishkanPage() {
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

  const [toggleDistinctData, setToggleDistinctData] = useState<
    "Distincted" | "Pure"
  >("Distincted");
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("روزانه");

  const getInitialCities = api.personnelPerformance.getInitialCities.useQuery(
    undefined,
    {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    },
  );
  const getLastDate = api.personnelPerformance.getLastDate.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    setDataFilters((prev) => {
      return {
        ...prev,
        filter: {
          ...prev.filter,
          Start_Date: [getLastDate?.data ?? ""],
        },
      };
    });
  }, [getLastDate.data]);
  const [filters, setDataFilters] = useState<FilterType>({
    periodType: reportPeriod,
    filter: {
      CityName: getInitialCities.data?.Cities,
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
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
      onSuccess: (data) => {
        // setDataFilters((prev) => {
        //   return {
        //     ...prev,
        //     Role:
        //       data?.usersInfo?.map((a) => a.Role).filter((a) => a) ??
        //       defualtRoles,
        //   };
        // });
      },
      refetchOnWindowFocus: false,
    },
  );
  const deferredFilter = useDeferredValue(filters);

  const personnelPerformance = api.personnelPerformance.getAll.useQuery(
    deferredFilter,
    {
      enabled: sessionData?.user !== undefined && !initialFilters.isLoading,
      // select: (data) => {
      //   const dataWithThurdsdayEdit = data?.result?.map((item) => {
      //     const isThursday =
      //       moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

      //     // const count = item.COUNT > 0 ? item.COUNT : 1;
      //     return {
      //       ...item,
      //       TotalPerformance: isThursday
      //         ? calculatePerformance(item, 1, 2)
      //         : item.TotalPerformance,
      //     };
      //   });

      //   return {
      //     periodType: data.periodType,
      //     dateLength: data.dateLength,
      //     result: dataWithThurdsdayEdit,
      //   };
      // },
      refetchOnWindowFocus: true,
    },
  );

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
          "TownName",
          "BranchCode",
          "BranchName",
          "BranchType",
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
          "ArzyabiVisitDirectCount",
          "Role",
          "RoleType",
          "ContractType",
          "ProjectType",
          "TotalPerformance",
          "DirectPerFormance",
          "InDirectPerFormance",

          "Start_Date",
          "DateInfo",
          "HasTheDayOff",
        ],
        { HasTheDayOff: false },
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
          filterFn: arrIncludeExcat,
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
          header: "کاربر ایجاد کننده",
          hSticky: true,
          width: 200,
          accessorKey: "NameFamily",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <>
                <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">
                    کاربر ایجاد کننده
                  </span>
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
          header: "عملکرد کلی",
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
          header: "نام شهر",
          enablePinning: true,
          hSticky: false,
          accessorKey: "TownName",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نام شهر</span>
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
          header: "نام شعبه",
          enablePinning: true,
          hSticky: false,
          accessorKey: "BranchName",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نام شعبه</span>
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
          header: "کد شعبه",
          enablePinning: true,
          hSticky: false,
          accessorKey: "BranchCode",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">کد شعبه</span>
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
          header: "نوع شعبه",
          enablePinning: true,
          hSticky: false,
          accessorKey: "BranchType",
          filterFn: "arrIncludesSome",
          Filter: ({ column }) => {
            return (
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">نوع شعبه</span>
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
      ],
      [personnelPerformance.data],
    ) || [];

  return (
    <>
      <div
        className="flex  w-full flex-col items-center justify-center gap-5"
        dir="rtl"
      >
        <h1 className=" w-full py-5 text-center text-2xl text-primary underline underline-offset-[12px] ">
          جزئیات ورودی اسناد مستقیم شعب
        </h1>
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
              toggleDistinctData === "Distincted"
                ? distincedData
                : personnelPerformance?.data?.result
              // personnelPerformance?.data?.periodType === "روزانه"
              //   ? personnelPerformance?.data?.result
              //   : personnelPerformance?.data?.result
            }
            columns={columns}
            renderInFilterView={() => {
              return (
                <>
                  <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">بازه گزارش</span>
                    {getLastDate.isLoading ? (
                      <>
                        <div className="text-primary">
                          <ThreeDotsWave />
                        </div>
                      </>
                    ) : (
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
                    )}
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
                            data={(toggleDistinctData === "Distincted"
                              ? distincedData
                              : personnelPerformance?.data?.result
                            ).map((row: any) => {
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
                <div className="flex flex-col items-center justify-center gap-2">
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
                  <div className="w-full">
                    <Button
                      className="min-w-[150px]  bg-secbuttn text-primary"
                      onClick={() => {
                        setToggleDistinctData((prev) => {
                          if (prev === "Distincted") return "Pure";
                          return "Distincted";
                        });
                      }}
                    >
                      {toggleDistinctData === "Distincted"
                        ? "Distincted"
                        : "Pure"}
                    </Button>
                  </div>
                </div>
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
