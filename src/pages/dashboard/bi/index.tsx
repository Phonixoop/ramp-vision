"use client";

import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Table from "~/features/table";
import { api } from "~/utils/api";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import moment from "jalali-moment";
import Head from "next/head";
import BlurBackground from "~/ui/blur-backgrounds";
import { arrIncludeExcat, en, getEnglishToPersianCity } from "~/utils/util";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { useSession } from "next-auth/react";
import { LayoutGroup } from "framer-motion";
import { InPageMenu } from "~/features/menu";
import { City_Levels } from "~/constants";
import { SelectColumnFilter } from "~/features/checkbox-list";

export default function AssessmentPage() {
  return (
    <>
      <Head>
        <title>Assessment Report</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlurBackground />
      <div
        dir="rtl"
        className="flex min-h-screen w-full flex-col items-center gap-5 bg-secondary"
      >
        <div className="w-full sm:p-0 xl:w-11/12">
          <AssessmentTable />
        </div>
      </div>
    </>
  );
}

export function AssessmentTable() {
  const [reportPeriod, setReportPeriod] = useState<"هفتگی" | "ماهانه">(
    "ماهانه",
  );
  const [filters, setFilters] = useState({
    filter: {
      DateFa: [moment().locale("fa").subtract(7, "days").format("YYYY/MM/DD")],
    },
    periodType: reportPeriod,
  });

  const { data, isLoading } = api.bi.getReports.useQuery(
    {
      filter: {
        DateFa: filters.filter.DateFa,
      },
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

              <SelectColumnFilter column={column} data={data?.result} />
            </div>
          );
        },
      },
      { header: "تاریخ فارسی", accessorKey: "DateFa" },
      { header: "تاریخ میلادی", accessorKey: "DateEn" },
      { header: "۵ درصد تعهد", accessorKey: "CommitmentFivePercentage" },
      { header: "۱۰ درصد تعهد", accessorKey: "CommitmentTenPercentage" },
      {
        header: "میانگین تایید حواله",
        accessorKey: "AverageRemittaceConfirmation",
      },
      { header: "تعداد اسناد مستقیم", accessorKey: "DocumentBillCountDirect" },
      {
        header: "نسبت مدیریت اسناد مستقیم",
        accessorKey: "DocumentHandlingRatioDirect",
      },
      { header: "نسبت بازگشت مستقیم", accessorKey: "ReturnRatioDirect" },
      {
        header: "تعداد پذیرش اسناد غیرمستقیم",
        accessorKey: "DocumentAcceptanceCountInDirect",
      },
      {
        header: "نسبت مدیریت اسناد غیرمستقیم",
        accessorKey: "DocumentHandlingRatioInDirect",
      },
      { header: "آخرین بروزرسانی", accessorKey: "LastUpdateTime" },
    ],
    [data, filters],
  );
  const { data: sessionData } = useSession();
  const getLastDate = api.personnelPerformance.getLastDate.useQuery(undefined, {
    enabled: sessionData?.user !== undefined,
    refetchOnWindowFocus: false,
  });
  console.log(data);
  return (
    <div className="w-full p-4 text-primary">
      <h1 className="mb-4 text-center text-2xl font-bold">گزارش ارزیابی</h1>

      <Table
        isLoading={isLoading}
        data={data?.result || []}
        columns={columns}
        renderInFilterView={() => (
          <div className="flex w-full flex-col items-center gap-3 rounded-xl bg-secondary p-2">
            <span className="font-bold">بازه گزارش</span>
            {getLastDate.isLoading ? (
              <>
                <div className="text-primary">
                  <ThreeDotsWave />
                </div>
              </>
            ) : (
              <DatePickerPeriodic
                selector={"DateFa"}
                filter={filters}
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
                  setFilters((prev) => {
                    return {
                      periodType: reportPeriod,
                      filter: {
                        ...prev.filter,
                        DateFa: dates,
                      },
                    };
                  });
                }}
                setReportPeriod={setReportPeriod}
              />
            )}
          </div>
        )}
      />
    </div>
  );
}
