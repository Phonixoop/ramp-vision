import {
  TrendingDownIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  BuildingIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import Header from "~/features/header";
import BlurBackground from "~/ui/blur-backgrounds";
import { api } from "~/utils/api";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import SuperJSON from "superjson";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";
import { SparkAreaChart } from "@tremor/react";
import { CITIES } from "~/constants";
import AdvancedList from "~/features/advanced-list";

const chartdata = [
  {
    month: "Jan 21",
    Performance: 4000,
    Benchmark: 3000,
  },
  {
    month: "Feb 21",
    Performance: 3000,
    Benchmark: 2000,
  },
  {
    month: "Mar 21",
    Performance: 2000,
    Benchmark: 1700,
  },
  {
    month: "Apr 21",
    Performance: 2780,
    Benchmark: 2500,
  },
  {
    month: "May 21",
    Performance: 1890,
    Benchmark: 1890,
  },
  {
    month: "Jun 21",
    Performance: 2390,
    Benchmark: 2000,
  },
  {
    month: "Jul 21",
    Performance: 3490,
    Benchmark: 3000,
  },
];

export default function CitiesPage({ children }) {
  const cityRef = useRef<HTMLAnchorElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [isTop, setIsTop] = useState(false);
  // useEffect(() => {
  //   function handleScroll() {
  //     const parentRect = cityRef.current.parentElement.getBoundingClientRect();
  //     const elementRect = cityRef.current.getBoundingClientRect();

  //     const isElementAtTop = elementRect.top <= parentRect.top;
  //     const isElementAtBottom = elementRect.bottom >= parentRect.bottom;
  //     setIsTop(elementRect.top < parentRect.top);
  //     console.log({ isElementAtTop });
  //     if (
  //       cityRef.current?.getBoundingClientRect().y <=
  //       parentRef.current?.clientHeight
  //     ) {
  //       // console.log("hit bottom");
  //     }
  //   }
  //   if (parentRef.current)
  //     parentRef.current.addEventListener("scroll", handleScroll);

  //   return () => {
  //     // Cleanup function: Remove the event listener when the component unmounts
  //     if (parentRef.current)
  //       parentRef.current.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  const getCities = api.personnelPerformance.getCities.useQuery();
  const router = useRouter();

  const cities: string[] = getCities.data?.Cities.map((city) => city.CityName);

  const persianCities = CITIES.map((a) => a.PersianName);
  const [updatedList, setUpdatedList] = useState(persianCities ?? []);
  if (getCities.isLoading) {
    return <>Loading...</>;
  }
  const intersection = CITIES.filter((city) =>
    cities.includes(city.EnglishName),
  );

  const persianNames = intersection.map((city) => city.PersianName);

  return (
    <>
      <BlurBackground />

      <div className="flex min-h-screen w-full flex-col gap-5 bg-secondary">
        <Header />

        <div className="m-auto flex w-11/12 flex-col justify-start gap-5 xl:flex-row-reverse">
          <AdvancedList
            title={
              <span className="flex items-center justify-center gap-2 text-primary">
                شهر ها
                <BuildingIcon />
              </span>
            }
            list={persianCities}
            filteredList={updatedList}
            onChange={(updatedList) => setUpdatedList(updatedList)}
            renderItem={(item, i) => {
              if (!persianNames.includes(item)) return;
              const englishCity = CITIES.find(
                (city) => city.PersianName === item,
              ).EnglishName;
              const performance = 50;
              const isActive = englishCity === router.query.city;
              return (
                <Link
                  key={i}
                  className={twMerge(
                    "cursor-pointer rounded-xl py-2",
                    isActive
                      ? "sticky z-20 bg-primary/30 text-secondary backdrop-blur-md "
                      : "bg-secondary",
                    "top-24",
                  )}
                  href={`/dashboard/personnel_performance/cities/${englishCity}`}
                >
                  <div className=" flex w-full items-center justify-between gap-2 px-2 text-right text-primary">
                    <div className=" w-10">
                      <ChevronLeftIcon className="h-4 w-4" />
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
                    <div className="flex w-full  items-center justify-center">
                      <SparkAreaChart
                        data={chartdata}
                        categories={["Performance", "Benchmark"]}
                        index={"month"}
                        colors={["purple", "cyan"]}
                        className="h-10 w-36 cursor-pointer"
                      />
                    </div>
                    <span className="w-full text-sm">{item}</span>
                  </div>
                </Link>
              );
            }}
          />

          {children}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
      db: db,
      session: session,
    },
    transformer: SuperJSON,
  });

  await helpers.personnelPerformance.getCities.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}
