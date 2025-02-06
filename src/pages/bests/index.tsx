"use client";

import { useState, useMemo, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Table from "~/features/table";
import { SelectColumnFilter, SelectControlled } from "~/features/checkbox-list";
import { api } from "~/utils/api";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import {
  arrIncludeExcat,
  en,
  getEnglishToPersianCity,
  getPersianToEnglishCity,
} from "~/utils/util";

import BlurBackground from "~/ui/blur-backgrounds";
import Head from "next/head";
import { City_Levels } from "~/constants";
import { InPageMenu } from "~/features/menu";
import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import { performanceLevels } from "~/constants/personnel-performance";

export default function BestsPage() {
  // const users = api.example.getAll.useQuery();

  return (
    <>
      <Head>
        <title>RAMP | Vision</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlurBackground />
      <div
        dir="rtl"
        className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000 "
      >
        <div className="w-full sm:p-0  xl:w-11/12">
          <BestsTable />
        </div>
      </div>
    </>
  );
}

export function BestsTable() {
  const [reportPeriod, setReportPeriod] = useState<
    "روزانه" | "هفتگی" | "ماهانه"
  >("ماهانه");
  const getInitialCities =
    api.personnelPerformance.getInitialCitiesPublic.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
  const [filters, setFilters] = useState({
    filter: {
      CityName: [],
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
    },
    periodType: reportPeriod,
  });

  const { data, isLoading } =
    api.personnelPerformance.getBestPersonnel.useQuery(
      {
        filter: {
          Start_Date: filters.filter.Start_Date,
        },
        periodType: filters.periodType,
      },
      {
        refetchOnWindowFocus: false,
      },
    );

  const columns = useMemo(
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
                      ).cities.map(getEnglishToPersianCity);

                      // beacuse our system is permission based we need to show only allowed cities.
                      // const canFilterCities = cities
                      //   .filter(
                      //     (city) =>
                      //       getInitialCities?.data?.Cities.map((initCity) =>
                      //         getPersianToEnglishCity(initCity.CityName),
                      //       ).includes(city),
                      //   )
                      //   .map((cityName) => getEnglishToPersianCity(cityName));

                      if (cities.length <= 0) {
                        setFilterValue(
                          getInitialCities?.data?.Cities.map((a) => a.CityName),
                        );
                      } else setFilterValue(cities);
                    }}
                  />
                </LayoutGroup>
              }
              <SelectColumnFilter column={column} data={data} />
            </div>
          );
        },
      },
      {
        header: "نام خانوادگی",
        accessorKey: "NameFamily",
      },
      {
        header: "درصد عملکرد",
        accessorKey: "TotalPerformance",
        cell: ({ row }) => (
          <span>{Number(row.original.TotalPerformance).toFixed(2)}</span>
        ),
      },
      {
        header: "عملکرد",
        accessorKey: "PerformanceText",
        cell: ({ row }) => {
          return (
            <>
              <span
                style={{
                  color: performanceLevels.find(
                    (a) => a.text === row.original.PerformanceText,
                  ).color,
                }}
              >
                {row.original.PerformanceText}
              </span>
            </>
          );
        },
      },

      {
        header: "کد ملی",
        accessorKey: "NationalCode",
      },
    ],
    [data, filters, getInitialCities.data],
  );

  return (
    <div className="w-full p-4 text-primary">
      <h1 className="mb-4 w-full text-center text-2xl font-bold text-primary">
        ارزیابان برتر
      </h1>

      <Table
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        renderInFilterView={() => (
          <div className="flex w-full flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold text-primary">بازه گزارش</span>

            <DatePickerPeriodic
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
                setFilters((prev) => ({
                  ...prev,
                  filter: { ...prev.filter, Start_Date: dates },
                  periodType: reportPeriod,
                }));
              }}
              setReportPeriod={setReportPeriod}
            />
          </div>
        )}
      />
    </div>
  );
}
