// app/dashboard/personnel_performance/cities/layout.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import moment from "jalali-moment";
import { SparkAreaChart } from "@tremor/react";
import { BuildingIcon, ChevronLeftIcon, FilterIcon } from "lucide-react";

import BlurBackground from "~/ui/blur-backgrounds";
import H2 from "~/ui/heading/h2";
import ResponsiveView from "~/features/responsive-view";
import { SelectControlled } from "~/features/checkbox-list";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import BarChart3Loading from "~/ui/loadings/chart/bar-chart-3";

import { api } from "~/trpc/react";

import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
  getDefaultRoleTypesBaseOnContractType,
} from "~/constants/personnel-performance";

import {
  en,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
} from "~/utils/util";
import { cn, sortDates } from "~/lib/utils";
import { usePersonnelFilter } from "~/context/personnel-filter.context";
import {
  distinctDataAndCalculatePerformance,
  sparkChartForCity,
} from "~/utils/personnel-performance";
import { CityWithPerformanceData } from "~/types";
import { TrendDecider } from "~/features/trend-decider";
import { CityPerformanceWithUsersChart } from "~/features/cities-performance-chart/cities-performance-bar-chart";

import AdvancedListFast from "~/features/advanced-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/shadcn/accordion";
import Button from "~/ui/buttons";
import AdvancedList from "~/features/advanced-list/indexm";

export default function CitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { filters, setFilters, reportPeriod, setReportPeriod, selectedPerson } =
    usePersonnelFilter();

  const router = useRouter();
  const params = useParams<{ city?: string }>();

  type FiltersShape = typeof filters;
  type FilterPatch = Partial<FiltersShape["filter"]>;
  const updateFilters = (patch: FilterPatch) => {
    setFilters({
      periodType: reportPeriod as any,
      filter: { ...filters.filter, ...patch },
    });
  };

  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery();

  const getInitialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        ProjectType: filters.filter.ProjectType,
        DateInfo: filters.filter.DateInfo,
      },
    },
  );

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
          DateInfo: filters?.filter?.DateInfo ?? [defualtDateInfo.data],
          TownName: filters?.filter?.TownName,
          BranchName: filters?.filter?.BranchName,
          BranchCode: filters?.filter?.BranchCode,
          BranchType: filters?.filter?.BranchType,
        },
      },
      { refetchOnWindowFocus: false },
    );

  const distincedData: CityWithPerformanceData[] = useMemo(
    () =>
      distinctDataAndCalculatePerformance(getCitiesWithPerformance.data) ?? [],
    [getCitiesWithPerformance.data],
  );

  const [listView, setListView] =
    useState<CityWithPerformanceData[]>(distincedData);
  useEffect(() => {
    setListView(distincedData);
  }, [distincedData]);

  const _DateInfos = useMemo(
    () =>
      [
        ...new Set(
          getInitialFilters?.data?.DateInfos?.map((a) => a.DateInfo).filter(
            Boolean,
          ) ?? [],
        ),
      ] as string[],
    [getInitialFilters.data?.DateInfos],
  );
  const DateInfos = sortDates({ dates: _DateInfos });

  const Roles = useMemo(
    () => [
      ...new Set(
        getInitialFilters?.data?.usersInfo
          ?.map((a) => a.Role as string)
          .filter(Boolean) ?? [""],
      ),
    ],
    [getInitialFilters.data?.usersInfo],
  );
  const ContractTypes = useMemo(
    () => [
      ...new Set(
        getInitialFilters?.data?.usersInfo
          ?.map((a) => a.ContractType)
          .filter(Boolean) ?? [],
      ),
    ],
    [getInitialFilters.data?.usersInfo],
  );
  const RolesType = useMemo(
    () => [
      ...new Set(
        getInitialFilters?.data?.usersInfo
          ?.map((a) => a.RoleType)
          .filter(Boolean) ?? [],
      ),
    ],
    [getInitialFilters.data?.usersInfo],
  );

  const activeCity = typeof params?.city === "string" ? params.city : "";

  return (
    <>
      <BlurBackground />

      <h1 className="w-full py-5 text-center text-2xl text-primary underline underline-offset-[12px]">
        (نمودار) جزئیات عملکرد پرسنل شعب
      </h1>

      <div className="flex min-h-screen w-full flex-col divide-y-2 divide-secbuttn py-2">
        {/* Filters */}
        <div className="mx-auto flex w-11/12 items-center justify-center gap-5 rounded-t-2xl p-2 sm:flex-col">
          <H2 className="hidden py-2 text-xl sm:flex">فیلترها</H2>

          {!getInitialFilters.isLoading && (
            <ResponsiveView
              className="z-20 flex max-h-[100vh] w-full flex-wrap items-stretch justify-start rounded-t-3xl bg-secondary sm:max-h-min sm:p-5"
              dir="rtl"
              btnClassName="text-primary"
              icon={
                <>
                  <span className="px-2">فیلترها</span>
                  <FilterIcon className="stroke-primary" />
                </>
              }
            >
              <div className="flex w-full flex-wrap">
                {/* Report period / date picker */}
                <div className="flex w-[15rem] max-w-sm flex-col items-center justify-around gap-3 p-2">
                  <span className="font-bold text-primary">بازه گزارش</span>
                  <DatePickerPeriodic
                    filter={filters}
                    reportPeriod={reportPeriod}
                    onChange={(date) => {
                      if (!date) return;
                      if (Array.isArray(date) && date.length <= 0) return;

                      let dates: string[] = [];
                      if (Array.isArray(date)) {
                        dates = date
                          .filter((a) => a.format() !== "")
                          .map((a) => en(a.format("YYYY/MM/DD")));
                      } else if (date.format() !== "") {
                        dates = [en(date.format("YYYY/MM/DD"))];
                      }
                      if (dates.length <= 0) return;

                      updateFilters({ Start_Date: dates });
                    }}
                    setReportPeriod={setReportPeriod}
                  />
                </div>

                {/* Project Type */}
                <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                  <span className="font-bold text-primary">نوع پروژه</span>
                  <SelectControlled
                    withSelectAll
                    title="نوع پروژه"
                    list={getInitialFilters?.data?.ProjectTypes}
                    value={filters.filter.ProjectType ?? defaultProjectTypes}
                    onChange={(values) =>
                      updateFilters({ ProjectType: values })
                    }
                  />
                </div>

                {/* Role */}
                <div className="flex max-w-sm flex-col items-center justify-center gap-3 p-2 sm:w-[25rem]">
                  <span className="font-bold text-primary">سمت</span>
                  <SelectControlled
                    withSelectAll
                    title="سمت"
                    list={Roles as string[]}
                    value={
                      filters.filter.Role ??
                      defualtRoles.filter((r) => Roles.includes(r))
                    }
                    onChange={(values) => updateFilters({ Role: values })}
                  />
                </div>

                {/* Contract Type */}
                <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                  <span className="font-bold text-primary">نوع قرار داد</span>
                  <SelectControlled
                    withSelectAll
                    title="نوع قرار داد"
                    list={ContractTypes as string[]}
                    value={
                      filters.filter.ContractType ??
                      defualtContractTypes.filter((ct) =>
                        ContractTypes.includes(ct),
                      )
                    }
                    onChange={(values) =>
                      updateFilters({
                        ContractType: values,
                        RoleType: getDefaultRoleTypesBaseOnContractType(
                          values ?? defualtContractTypes,
                        ) as any,
                      })
                    }
                  />
                </div>

                {/* Role Type */}
                <div className="flex w-[22rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                  <span className="font-bold text-primary">نوع سمت</span>
                  <SelectControlled
                    withSelectAll
                    title="نوع سمت"
                    list={RolesType as string[]}
                    value={filters?.filter?.RoleType}
                    onChange={(values) => updateFilters({ RoleType: values })}
                  />
                </div>

                {/* Personnel report DateInfo */}
                <div className="flex w-[12rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                  <span className="font-bold text-primary">
                    تاریخ گزارش پرسنل
                  </span>
                  <SelectControlled
                    title="تاریخ گزارش پرسنل"
                    list={DateInfos}
                    value={
                      filters.filter.DateInfo ??
                      (DateInfos.length
                        ? [DateInfos[DateInfos.length - 1]]
                        : [])
                    }
                    onChange={(values) => {
                      const latest = values.length
                        ? [values[values.length - 1]]
                        : [];
                      updateFilters({ DateInfo: latest.filter(Boolean) });
                    }}
                  />
                </div>
              </div>

              {/* More filters */}
              <div className="flex w-full flex-wrap items-center justify-center">
                <Accordion className="w-full" type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-accent">
                      فیلتر های بیشتر
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                        <span className="font-bold text-primary">نام شهر</span>
                        <SelectControlled
                          withSelectAll
                          title="نام شهر"
                          list={getInitialFilters.data?.TownNames ?? []}
                          value={filters.filter.TownName ?? []}
                          onChange={(values) =>
                            updateFilters({ TownName: values })
                          }
                        />
                      </div>
                      <div className="flex min-w-full max-w-sm flex-col items-center justify-center gap-3 p-2">
                        <span className="font-bold text-primary">نام شعبه</span>
                        <SelectControlled
                          withSelectAll
                          title="نام شعبه"
                          list={getInitialFilters.data?.BranchNames ?? []}
                          value={filters.filter.BranchName ?? []}
                          onChange={(values) =>
                            updateFilters({ BranchName: values })
                          }
                        />
                      </div>
                      <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                        <span className="font-bold text-primary">کد شعبه</span>
                        <SelectControlled
                          withSelectAll
                          title="کد شعبه"
                          list={getInitialFilters.data?.BranchCodes ?? []}
                          value={filters.filter.BranchCode ?? []}
                          onChange={(values) =>
                            updateFilters({ BranchCode: values })
                          }
                        />
                      </div>
                      <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                        <span className="font-bold text-primary">نوع شعبه</span>
                        <SelectControlled
                          withSelectAll
                          title="نوع شعبه"
                          list={getInitialFilters.data?.BranchTypes ?? []}
                          value={filters.filter.BranchType ?? []}
                          onChange={(values) =>
                            updateFilters({ BranchType: values })
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ResponsiveView>
          )}
        </div>

        {/* Header showing city/person */}
        <div className="mx-auto flex w-11/12 items-center justify-end ">
          {activeCity && (
            <div className="flex items-center justify-center gap-1 p-2 px-6 text-accent">
              <span>{selectedPerson?.NameFamily}</span>
              {selectedPerson && <span>/</span>}
              <span>{getEnglishToPersianCity(activeCity)}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="m-auto flex w-11/12 flex-col items-center justify-center gap-5 bg-secondary p-5 pb-10 xl:flex-row-reverse xl:items-stretch xl:justify-start">
          <AdvancedList
            className="xl:h-fit"
            title={
              <span className="flex items-center justify-center gap-2 text-primary">
                استان
                <BuildingIcon />
              </span>
            }
            isLoading={getCitiesWithPerformance.isLoading}
            disabled={
              !distincedData?.length && !getCitiesWithPerformance.isLoading
            }
            list={distincedData as any}
            selectProperty="CityName_Fa"
            downloadFileName={`عملکرد استان ها ${
              reportPeriod === "ماهانه" &&
              (filters.filter.Start_Date?.length ?? 0) === 1
                ? moment(filters.filter.Start_Date![0]!, "jYYYY,jMM,jDD")
                    .locale("fa")
                    .format("YYYY jMMMM")
                : (filters.filter.Start_Date ?? []).join(",")
            }`}
            headers={[
              { label: "عملکرد", key: "TotalPerformance" },
              { label: "شهر", key: "CityName_Fa" },
            ]}
            dataToDownload={listView}
            onChange={(next) => setListView(next)}
            renderItem={(item, i) => {
              const isActive = item.CityName_En === activeCity;

              const cityPerformances =
                getCitiesWithPerformance?.data?.result
                  ?.filter(
                    (x: any) =>
                      getPersianToEnglishCity(x.CityName) === item.CityName_En,
                  )
                  ?.map((m: any) => m.TotalPerformance) ?? [];

              return (
                <Button
                  key={item.CityName_En ?? i}
                  className={cn(
                    "w-full cursor-pointer rounded-xl py-2 transition-opacity duration-500",
                    isActive
                      ? "sticky top-24 z-20 bg-primary/30 text-secondary backdrop-blur-md"
                      : "bg-secondary",
                  )}
                  onClick={() =>
                    router.push(
                      `/dashboard/personnel_performance/cities/${item.CityName_En}`,
                    )
                  }
                >
                  <div className="relative flex w-full items-center justify-between gap-2 px-2 text-right text-primary duration-1000">
                    <span className="w-full text-sm">{item.CityName_Fa}</span>
                    <div className="flex w-full items-center justify-center">
                      <SparkAreaChart
                        data={sparkChartForCity(
                          getCitiesWithPerformance?.data?.result ?? [],
                          "CityName",
                          item.CityName_En,
                        )}
                        noDataText="بدون داده"
                        categories={[
                          "TotalPerformance",
                          "Benchmark",
                          "Benchmark2",
                          "Benchmark3",
                        ]}
                        index="Start_Date"
                        colors={["purple", "rose", "cyan"]}
                        className={twMerge(
                          "dash-a h-10 w-36",
                          isActive
                            ? "animate-path animate-[move_100s_linear_infinite]"
                            : "",
                        )}
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <TrendDecider values={cityPerformances} />
                      {Math.round(item.TotalPerformance)}%
                    </div>

                    <div className="w-10">
                      {isActive ? (
                        <BarChart3Loading />
                      ) : (
                        <ChevronLeftIcon className="h-4 w-4 stroke-primary" />
                      )}
                    </div>
                  </div>
                </Button>
              );
            }}
          />

          {/* Right pane */}
          {children}
        </div>

        {/* Bottom chart */}
        <div
          dir="rtl"
          className="mx-auto flex w-11/12 flex-col items-center justify-center gap-5 rounded-b-2xl bg-secondary p-2 py-5"
        >
          <CityPerformanceWithUsersChart
            filters={filters}
            cityName_En={activeCity}
          />
        </div>
      </div>
    </>
  );
}
