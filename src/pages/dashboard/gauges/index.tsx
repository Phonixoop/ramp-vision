import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import { CITIES, Reports_Period } from "~/constants";
import {
  FilterType,
  PeriodType,
  usePersonnelFilter,
} from "~/context/personnel-filter.context";
import Header from "~/features/header";
import { InPageMenu } from "~/features/menu";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { api } from "~/utils/api";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  DistinctData,
  calculateAggregateByFields,
  en,
  getPerformanceText,
} from "~/utils/util";
import { SelectControlled } from "~/features/checkbox-list";
import H2 from "~/ui/heading/h2";
import Gauge from "~/features/gauge";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
export default function GaugesPage() {
  const [selectedDates, setSelectedDates] = useState<string[]>([
    moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
  ]);

  const [reportPeriod, setReportPeriod] = useState<PeriodType>("روزانه");

  const [filters, setFilters] = useState<FilterType>({
    periodType: "روزانه",
    filter: {
      Start_Date: selectedDates,
    },
  });

  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: filters?.periodType,
        filter: {
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
          Role: filters?.filter?.Role ?? defualtRoles,
          ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
          RoleType: filters?.filter?.RoleType,
          DateInfo: filters?.filter?.DateInfo,
        },
      },
      {
        onSuccess: (data) => {},
        refetchOnWindowFocus: false,
      },
    );

  const getInitialFilters =
    api.personnelPerformance.getInitialFilters.useQuery();
  const operations = [
    { fieldName: "TotalPerformance", operation: "average" },
    { fieldName: "Start_Date", operation: "array" },
  ];

  const result = calculateAggregateByFields(
    getCitiesWithPerformance?.data,
    operations,
  );
  return (
    <>
      <BlurBackground />

      <div
        className="flex min-h-screen w-full flex-col gap-5 bg-secondary"
        dir="rtl"
      >
        <Header />
        <div className="mx-auto flex w-11/12 flex-col-reverse items-center justify-between  gap-5  py-5 md:flex-row-reverse md:items-start">
          <div className="grid grid-cols-1 gap-4  sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {getCitiesWithPerformance.isLoading ? (
              <>
                {Array.from(
                  Array(getInitialFilters?.data?.Cities?.lenght ?? 31).keys(),
                ).map((a) => {
                  return (
                    <>
                      <div className="flex h-36 w-36  flex-col items-center justify-between  gap-5 rounded-2xl bg-secbuttn "></div>
                    </>
                  );
                })}
              </>
            ) : (
              result.map((city: any) => {
                return (
                  <>
                    <div className="flex w-full  flex-col items-center  justify-between gap-5 rounded-2xl ">
                      <div className="flex w-full flex-col items-center justify-between gap-5  rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:w-auto  xl:p-5">
                        <H2>
                          {
                            CITIES.find((a) => a.EnglishName === city.CityName)
                              .PersianName
                          }
                        </H2>

                        <Gauge value={city.TotalPerformance} />
                        <p className="text-accent">
                          {getPerformanceText(city.TotalPerformance)}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })
            )}
          </div>
          <div className="sticky top-0 flex  flex-col ">
            <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
              <span className="font-bold text-primary">تاریخ</span>
              <LayoutGroup id="DateMenu">
                <InPageMenu
                  list={Object.keys(Reports_Period)}
                  startIndex={0}
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
                    filters?.periodType == "روزانه" ? " , " : " ~ ";
                  return (
                    <Button
                      className="min-w- border border-dashed border-accent text-center hover:bg-accent/20"
                      onClick={openCalendar}
                    >
                      {filters?.filter.Start_Date.join(seperator)}
                    </Button>
                  );
                }}
                inputClass="text-center"
                multiple={reportPeriod !== "ماهانه"}
                value={filters?.filter.Start_Date}
                calendar={persian}
                locale={persian_fa}
                weekPicker={reportPeriod === "هفتگی"}
                onlyMonthPicker={reportPeriod === "ماهانه"}
                plugins={[<DatePanel key={"00DatePanel"} />]}
                onClose={() => {
                  //@ts-ignore
                  setFilters((prev) => {
                    return {
                      periodType: reportPeriod,
                      filter: {
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
            {!getInitialFilters.isLoading && (
              <>
                <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">سمت</span>
                  <SelectControlled
                    title={"سمت"}
                    list={[
                      ...new Set(
                        getInitialFilters?.data?.usersInfo
                          ?.map((a) => a.Role)
                          .filter((a) => a),
                      ),
                    ]}
                    value={filters.filter.Role ?? defualtRoles}
                    onChange={(values) => {
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            Role: values,
                          },
                        };
                      });
                    }}
                  />
                </div>
                <div className="flex min-w-[15rem] max-w-sm  flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">نوع پروژه</span>
                  <SelectControlled
                    title={"نوع پروژه"}
                    list={[
                      ...new Set(
                        getInitialFilters?.data?.usersInfo
                          ?.map((a) => a.ProjectType)
                          .filter((a) => a),
                      ),
                    ]}
                    value={filters.filter.ProjectType ?? defaultProjectTypes}
                    onChange={(values) => {
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            ProjectType: values,
                          },
                        };
                      });
                    }}
                  />
                </div>

                <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">نوع قرار داد</span>
                  <SelectControlled
                    title={"نوع قرار داد"}
                    list={[
                      ...new Set(
                        getInitialFilters?.data?.usersInfo
                          ?.map((a) => a.ContractType)
                          .filter((a) => a),
                      ),
                    ]}
                    value={filters.filter.ContractType ?? defualtContractTypes}
                    onChange={(values) => {
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            ContractType: values,
                          },
                        };
                      });
                    }}
                  />
                </div>
                <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">نوع سمت</span>
                  <SelectControlled
                    title={"نوع سمت"}
                    list={[
                      ...new Set(
                        getInitialFilters?.data?.usersInfo
                          ?.map((a) => a.RoleType)
                          .filter((a) => a),
                      ),
                    ]}
                    value={filters.filter.RoleType ?? []}
                    onChange={(values) => {
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            RoleType: values,
                          },
                        };
                      });
                    }}
                  />
                </div>
                <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                  <span className="font-bold text-primary">
                    تاریخ گزارش پرسنل
                  </span>
                  <SelectControlled
                    title={"تاریخ گزارش پرنسل"}
                    list={[
                      ...new Set(
                        getInitialFilters?.data?.usersInfo
                          ?.map((a) => a.DateInfo)
                          .filter((a) => a),
                      ),
                    ]}
                    value={filters.filter.DateInfo ?? ["1402/03/31"]}
                    onChange={(values) => {
                      //@ts-ignore
                      setFilters((prev) => {
                        return {
                          periodType: reportPeriod,
                          filter: {
                            ...prev.filter,
                            DateInfo: values,
                          },
                        };
                      });
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
