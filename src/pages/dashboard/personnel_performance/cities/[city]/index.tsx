import { BarChart, SparkAreaChart } from "@tremor/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import moment from "jalali-moment";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { InferGetStaticPropsType, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SuperJSON from "superjson";
import { twMerge } from "tailwind-merge";
import { PersonnelPerformanceTranslate } from "~/constants";
import AdvancedList from "~/features/advanced-list";
import CitiesPage from "~/pages/dashboard/personnel_performance/cities";
import { appRouter } from "~/server/api/root";
import Button from "~/ui/buttons";
import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";

import { api } from "~/utils/api";

const chartdata = [
  {
    month: "Jan 21",
    Performance: 30000,
    Benchmark: 3000,
  },
  {
    month: "Feb 21",
    Performance: 3000,
    Benchmark: 21000,
  },
  {
    month: "Mar 21",
    Performance: 2000,
    Benchmark: 17500,
  },
  {
    month: "Apr 21",
    Performance: 27800,
    Benchmark: 2500,
  },
  {
    month: "May 21",
    Performance: 1829,
    Benchmark: 1890,
  },
  {
    month: "Jun 21",
    Performance: 2390,
    Benchmark: 2000,
  },
  {
    month: "Jul 21",
    Performance: 3090,
    Benchmark: 3000,
  },
];

export default function CityPage({ children, city }) {
  const router = useRouter();

  const getAll = api.personnelPerformance.getAll.useQuery(
    {
      filter: {
        CityName: [city],
        Start_Date: [
          moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
        ],
      },
      periodType: "روزانه",
    },
    {},
  );
  const [updatedList, setUpdatedList] = useState(getAll.data?.result ?? []);

  useEffect(() => {
    setUpdatedList(getAll.data?.result);
  }, [getAll.data?.result]);
  const [selectedUser, setSelectedUser] = useState(undefined);

  const numericItems = Object.entries(selectedUser ?? []).filter(
    ([key, value]) => typeof value === "number",
  );
  return (
    <CitiesPage>
      <AdvancedList
        disabled={!!!updatedList}
        list={getAll.data?.result}
        filteredList={updatedList ?? [...new Array(10).keys()]}
        selectProperty={"NameFamily"}
        onChange={(updatedList) => {
          setUpdatedList(updatedList);
        }}
        renderItem={(user, i) => {
          const isActive = user.NationalCode === selectedUser?.NationalCode;
          const performance = 50;
          if (!user?.NationalCode)
            return (
              <div
                key={i}
                className=" flex  w-full animate-pulse flex-row-reverse items-center justify-between rounded-xl bg-secondary/60 px-2  py-5 text-right text-primary"
              >
                <span className="h-5 w-10 rounded-lg bg-secbuttn" />
                <span className="h-4 w-4 rounded-lg bg-secbuttn" />
              </div>
            );
          return (
            <>
              <Button
                key={i}
                className={twMerge(
                  "rounded-xl  ",
                  isActive
                    ? "sticky top-24 z-10 bg-primbuttn text-secondary "
                    : " bg-secondary  ",
                )}
                onClick={() => {
                  setSelectedUser(user);
                }}
              >
                <div className=" flex w-full flex-row-reverse items-center justify-between gap-2  px-2 text-right text-primary">
                  <div className=" w-10">
                    <ChevronLeftIcon className="h-4 w-4 fill-none stroke-primary" />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {performance < 50 ? (
                      <TrendingDownIcon className="h-5 w-5 stroke-red-700" />
                    ) : (
                      <TrendingUpIcon className="h-5 w-5 stroke-emerald-700" />
                    )}
                    {performance.toFixed(0)}
                    {"%"}
                  </div>
                  <div className="flex w-full items-center justify-center">
                    <SparkAreaChart
                      data={chartdata}
                      categories={["Performance", "Benchmark"]}
                      index={"month"}
                      colors={["purple", "cyan"]}
                      className="h-10 w-36"
                    />
                  </div>
                  <span className="w-full text-sm">{user.NameFamily}</span>
                </div>
              </Button>
            </>
          );
        }}
      />

      <div className="flex max-h-[500px] w-full flex-col flex-wrap items-center justify-center gap-1 overflow-hidden overflow-y-auto rounded-2xl bg-secbuttn p-1">
        {selectedUser && (
          // Object.entries(selectedUser).map(([key, value]) => {
          //   // You can perform any transformation or logic here
          //   return (
          //     <div className="gap-1rounded-2xl flex flex-col rounded-xl  bg-secondary p-2">
          //       <span>{key}</span>
          //       <span>{value as string}</span>
          //     </div>
          //   );
          // })

          <>
            <BarChart
              data={numericItems.map(([key, value]) => {
                return {
                  name: PersonnelPerformanceTranslate[key],
                  value,
                };
              })}
              index="name"
              showXAxis
              categories={numericItems.map(
                ([key, value]) => PersonnelPerformanceTranslate[key],
              )}
            />
          </>
        )}
      </div>
    </CitiesPage>
  );
}

export async function getStaticProps(ctx) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx,
    transformer: SuperJSON,
  });

  const city = ctx.params?.city;

  if (typeof city !== "string") throw new Error("no slug");

  await helpers.personnelPerformance.getAll.prefetch({
    filter: {
      CityName: [city.toString()],
      Start_Date: [
        moment().locale("fa").subtract(1, "days").format("YYYY/MM/DD"),
      ],
    },
    periodType: "روزانه",
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      city,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
