"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import moment from "jalali-moment";
import { CSVLink } from "react-csv";
import { DownloadCloudIcon, FileBarChart2 } from "lucide-react";

import Table from "~/features/table";

import { usePishkhan } from "../context";
import { PishkhanTableProps } from "../types";
import UseUserManager from "~/hooks/userManager";
import { TableFiltersContainerSkeleton } from "./TableFilterSkeleton";
import { getPerformanceMetric } from "~/utils/personnel-performance";
import { distinctPersonnelPerformanceData } from "~/utils/personnel-performance";
import { commify, en } from "~/utils/util";
import { defualtRoles } from "~/constants/personnel-performance";
import { countColumnValues } from "~/utils/util";
import { getPerformanceText } from "~/utils/util";
import MyBarList from "~/features/bar-list";
import Gauge from "~/features/gauge";
import H2 from "~/ui/heading/h2";
import Button from "~/ui/buttons";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import { getMonthNamesFromJOINED_date_strings } from "~/utils/personnel-performance";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { PishkhanColumns } from "~/app/dashboard/personnel_performance/pishkhan/components/PishkhanColumns";

// Helper functions to avoid ternary operators
function getPeriodType(reportPeriod: string): "daily" | "weekly" | "monthly" {
  if (reportPeriod === "روزانه") return "daily";
  if (reportPeriod === "هفتگی") return "weekly";
  return "monthly";
}

function getPersianPeriod(period: string): "روزانه" | "هفتگی" | "ماهانه" {
  if (period === "daily") return "روزانه";
  if (period === "weekly") return "هفتگی";
  return "ماهانه";
}

export function PishkhanTable({ sessionData }: PishkhanTableProps) {
  const { hasManagePersonnelAccess } = UseUserManager();
  const {
    filters,
    setFilters,
    reportPeriod,
    setReportPeriod,
    toggleDistinctData,
    setToggleDistinctData,
  } = usePishkhan();

  // API Queries
  const getInitialCities =
    api.personnelPerformance.getInitialCityNames.useQuery(undefined, {
      enabled: sessionData?.user !== undefined,
      refetchOnWindowFocus: false,
    });

  const getLastDate = api.personnelPerformance.getLastDate.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
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
      refetchOnWindowFocus: true,
    },
  );

  // Update filters when getLastDate data is available
  useEffect(() => {
    if (getLastDate?.data) {
      setFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          Start_Date: [getLastDate.data],
        },
      }));
    }
  }, [getLastDate.data, setFilters]);

  // Update filters when getInitialCities data is available
  useEffect(() => {
    if (getInitialCities?.data?.CityNames) {
      setFilters((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          CityName: getInitialCities.data.CityNames.map(
            (city: any) => city.CityName,
          ),
        },
      }));
    }
  }, [getInitialCities.data, setFilters]);

  const distincedData = useMemo(
    () =>
      distinctPersonnelPerformanceData(
        personnelPerformance.data?.result,
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
          "ArzyabiAsnadDandanDirect",
          "ArzyabiAsnadDandanIndirect",
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
    [personnelPerformance.data?.result],
  );

  const columns = PishkhanColumns({
    personnelPerformance,
    initialFilters,
    filters,
    setFilters,
    reportPeriod,
  });

  if (getInitialCities.isLoading || getLastDate.isLoading) {
    return <TableFiltersContainerSkeleton />;
  }

  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-5"
      dir="rtl"
    >
      <h1 className="w-full py-5 text-center text-2xl text-primary underline underline-offset-[12px]">
        جزئیات ورودی اسناد مستقیم شعب
      </h1>

      <div className="flex w-full items-center justify-center rounded-lg py-5 text-center">
        <Table
          hasClickAction
          onClick={(row) => {
            const original = row as any;
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
          }
          columns={columns}
          renderInFilterView={() => {
            return (
              <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">بازه گزارش</span>
                {getLastDate.isLoading ? (
                  <div className="text-primary">
                    <ThreeDotsWave />
                  </div>
                ) : (
                  <CalendarButton
                    selectedDates={filters.filter.Start_Date || []}
                    periodType={getPeriodType(reportPeriod)}
                    onSelect={(data) => {
                      const persianPeriod = getPersianPeriod(data.reportPeriod);
                      setReportPeriod(persianPeriod);
                      setFilters((prev) => ({
                        periodType: persianPeriod,
                        filter: {
                          ...prev.filter,
                          Start_Date: data.selectedDates,
                        },
                      }));
                    }}
                    placeholder="انتخاب تاریخ"
                    allowMultiSelection={true}
                    isLoading={getLastDate.isLoading}
                    className="w-full"
                  />
                )}
              </div>
            );
          }}
          renderAfterFilterView={(flatRows) => {
            return (
              <>
                {!personnelPerformance.isLoading &&
                  personnelPerformance.data?.result?.length > 0 && (
                    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn p-5 xl:flex-row">
                      <FileBarChart2 className="stroke-accent" />
                      <Button className="flex justify-center gap-1 rounded-3xl bg-emerald-300 text-sm font-semibold text-emerald-900">
                        <DownloadCloudIcon />
                        <CSVLink
                          filename="جزئیات عملکرد پرسنل.csv"
                          headers={columns
                            .map((item) => ({
                              label: item.header,
                              key: item.accessorKey,
                            }))
                            .filter((f) => f.key !== "Id")}
                          data={(toggleDistinctData === "Distincted"
                            ? distincedData
                            : personnelPerformance?.data?.result
                          ).map((row: any) => {
                            let Start_Date = "";
                            if (
                              personnelPerformance.data?.periodType === "هفتگی"
                            )
                              Start_Date = getMonthNamesFromJOINED_date_strings(
                                filters.filter.Start_Date?.join(",") || "",
                                personnelPerformance.data.periodType,
                              );

                            if (
                              personnelPerformance.data?.periodType === "ماهانه"
                            )
                              Start_Date = getMonthNamesFromJOINED_date_strings(
                                row.Start_Date,
                                personnelPerformance.data.periodType,
                              );

                            if (
                              personnelPerformance.data?.periodType === "روزانه"
                            )
                              Start_Date =
                                filters.filter.Start_Date?.join(",") || "";

                            return {
                              ...row,
                              Start_Date,
                            };
                          })}
                        >
                          دانلود دیتای کامل
                        </CSVLink>
                      </Button>
                      <Button className="flex justify-center gap-1 rounded-3xl bg-amber-300 text-sm font-semibold text-amber-900">
                        <DownloadCloudIcon />
                        <CSVLink
                          filename="جزئیات عملکرد پرسنل (فیلتر شده).csv"
                          headers={columns
                            .map((item) => ({
                              label: item.header,
                              key: item.accessorKey,
                            }))
                            .filter((f) => f.key !== "Id")}
                          data={flatRows.map((row: any) => {
                            let Start_Date = "";
                            if (
                              personnelPerformance.data?.periodType === "هفتگی"
                            )
                              Start_Date = getMonthNamesFromJOINED_date_strings(
                                filters.filter.Start_Date?.join(",") || "",
                                personnelPerformance.data.periodType,
                              );

                            if (
                              personnelPerformance.data?.periodType === "ماهانه"
                            )
                              Start_Date = getMonthNamesFromJOINED_date_strings(
                                row.Start_Date,
                                personnelPerformance.data.periodType,
                              );

                            if (
                              personnelPerformance.data?.periodType === "روزانه"
                            )
                              Start_Date =
                                filters.filter.Start_Date?.join(",") || "";

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
            const roleData = countColumnValues(flatRows, "Role", defualtRoles);

            const sumOfPerformances = flatRows.reduce((acc, row) => {
              return acc + (row as any).TotalPerformance;
            }, 0) as number;

            const totalPerformance = sumOfPerformances / flatRows.length;

            return (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex w-full flex-col items-center justify-center gap-5">
                  <div className="flex w-full flex-col items-center justify-center gap-5 xl:flex-row">
                    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn/50 py-4 sm:py-0 xl:flex-row">
                      <div className="flex flex-col justify-center gap-10 rounded-2xl py-4 sm:bg-secbuttn xl:w-1/2 xl:p-5">
                        <H2 className="text-xl font-bold">
                          تعداد پرسنل به تفکیک سمت
                        </H2>
                        <MyBarList
                          data={(roleData ?? []).map((row) => ({
                            name: row.name,
                            value: row.count,
                          }))}
                        />
                      </div>
                      <div className="flex w-full flex-col items-center justify-between gap-5 rounded-2xl xl:w-1/2">
                        <div className="flex w-full flex-col items-center justify-between gap-5 rounded-2xl py-5 xl:w-auto xl:p-5">
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
                    className="min-w-[150px] bg-secbuttn text-primary"
                    onClick={() => {
                      setToggleDistinctData(
                        toggleDistinctData === "Distincted"
                          ? "Pure"
                          : "Distincted",
                      );
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
        />
      </div>
    </div>
  );
}
