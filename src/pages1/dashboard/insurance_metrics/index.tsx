import { ColumnDef } from "@tanstack/react-table";
import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React, { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { City_Levels } from "~/constants";
import { FilterType } from "~/context/personnel-filter.context";
import { SelectColumnFilter, SelectControlled } from "~/features/checkbox-list";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import { InPageMenu } from "~/features/menu";
import Table from "~/features/table";
import BlurBackground from "~/ui/blur-backgrounds";
import { api } from "~/trpc/react";
import {
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

export default function InsuranceMetrics() {
  const { data: sessionData } = useSession();
  const [filters, setDataFilters] = useState({
    periodType: "ماهانه",
    filter: {
      CityName: [],
      Start_Date: [moment().locale("fa").subtract(1, "M").format("YYYY/MM/DD")],
    },
  });
  const deferredFilter = useDeferredValue(filters);
  const havaleKhesarat = api.insuranceMetrics.getAll.useQuery(deferredFilter, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });

  const initialFilters = api.insuranceMetrics.getInitialCities.useQuery(
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
          header: "درصد پرونده های عودتی بیمه شده",
          accessorKey: "InsuredReturnCasesPercentage",
          cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.original.InsuredReturnCasesPercentage.toFixed(2)}%
              </div>
            );
          },
        },
        {
          header: "درصد پرونده های ابطالی بیمه شده",
          accessorKey: "InsuredCancellationCasesPercentage",
          cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.original.InsuredCancellationCasesPercentage.toFixed(2)}%
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
