import { UserCog2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import Menu from "~/features/menu";

import Table from "~/features/table";

import { ThemeBoxHovery } from "~/features/theme-box";

import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";

import { useMemo } from "react";
import { api } from "~/utils/api";
import { Title, BarChart, AreaChart } from "@tremor/react";
import CheckboxList, { SelectControlled } from "~/features/checkbox-list";
import MultiBox from "~/ui/multi-box";

const menu = [
  {
    value: "خانه",
    link: "/",
  },
  {
    value: "درباره ویژن",
    link: "atysa.ir",
  },
  {
    value: "داشبورد",
    link: "/dashboard",
  },
];

const chartdata = [
  {
    name: "Amphibians",
    "Number of threatened species": 2488,
  },
  {
    name: "Birds",
    "Number of threatened species": 1445,
  },
  {
    name: "Crustaceans",
    "Number of threatened species": 743,
  },
];

const dataFormatter = (number: number) => {
  return "$ " + Intl.NumberFormat("us").format(number).toString();
};

export default function Home() {
  // const users = api.example.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlurBackground />
      <div className="flex min-h-screen w-full flex-col items-center justify-between bg-secondary transition-colors duration-1000 ">
        <Container
          className="flex  flex-col items-center justify-between py-5"
          rtl={true}
        >
          <div className="flex items-center  justify-center gap-4 ">
            <AuthShowcase />
            <Menu rootPath="/" list={menu} />
          </div>
        </Container>

        {/* <div className="grid max-h-screen w-11/12 grid-cols-4 grid-rows-3 gap-4">
          <div className="bg-red-300">1</div>
          <div className="bg-red-300">2</div>
          <div className="bg-red-300">3</div>
          <div className="col-start-1 row-start-2  bg-green-300">4</div>
          <div className="col-start-2 row-start-2  bg-green-300">5</div>
          <div className="col-start-3 row-start-2  bg-green-300">6</div>
          <div className="col-span-3 col-start-1 row-start-3  overflow-hidden ">
            <div className=" w-full "></div>
          </div>
          <div className="col-start-4 row-span-3 row-start-1"></div>
        </div> */}

        <Container>
          <DeposTable />
        </Container>
        <div className=" pt-9">
          <ThemeBoxHovery />
        </div>
      </div>
    </>
  );
}

function DeposTable() {
  const depo = api.depo.getAll.useInfiniteQuery(
    {
      filter: {},
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const flatDepos: any = useMemo(() => {
    return depo.data?.pages.map((page) => page).flat(1) || [];
  }, [depo]);
  const columns =
    useMemo(
      () => [
        {
          Header: "#",
          accessor: "number",
          Cell: ({ row }) => {
            return (
              <div className="w-full cursor-pointer rounded-full  px-2 py-2 text-primary">
                {row.index + 1}
              </div>
            );
          },
          Filter: "",
        },
        {
          Header: "نام سرویس",
          accessor: "ServiceName",
          Filter: ({ column }) => {
            const { filterValue, setFilter } = column;
            const unique = [...new Set(flatDepos.map((a) => a.ServiceName))];

            return (
              <>
                <SelectControlled
                  list={unique}
                  value={filterValue}
                  onChange={setFilter}
                />
              </>
              // <div className="flex w-full flex-col items-center justify-center ">
              //   {unique.map((item: string) => {
              //     return (
              //       <span
              //         className={`w-full p-2 text-center ${
              //           item === filterValue ? "text-green-400" : ""
              //         }`}
              //         onClick={(e) => {
              //           setFilter(item);
              //         }}
              //       >
              //         {item}
              //       </span>
              //     );
              //   })}
              // </div>
            );
          },
        },
        {
          Header: "شهر",
          accessor: "CityName",
          Filter: (data) => {
            const unique = [...new Set(flatDepos.map((a) => a.CityName))];
            return (
              <div className="flex w-full flex-col items-center justify-center">
                {unique.map((item: string) => {
                  return <span className="w-full p-2 text-center">{item}</span>;
                })}
              </div>
            );
          },
        },

        {
          Header: "نوع سند",
          accessor: "DocumentType",
          Filter: (data) => {
            const unique = [...new Set(flatDepos.map((a) => a.DocumentType))];
            return (
              <div className="flex w-full flex-col items-center justify-center ">
                {unique.map((item: string) => {
                  return <span className="w-full p-2 text-center">{item}</span>;
                })}
              </div>
            );
          },
        },
        {
          Header: "تعداد بلاتکلیف",
          accessor: "DepoCount",
          Filter: "filter",
        },
        {
          Header: "تعداد ورودی",
          accessor: "EntryCount",
          Filter: "filter",
        },
        {
          Header: "تعداد رسیدگی شده",
          accessor: "Capicity",
          Filter: "filter",
        },
        {
          Header: "مدت زمان اتمام دپو",
          accessor: "MyDepoCompletionTime",
          Cell: ({ row }) => {
            const data = row.original;
            var result = data.DepoCount / (data.Capicity - data.EntryCount);
            if (result <= 0)
              return (
                <span className="text-red-400">دپو در حال افزایش است</span>
              );
            return result;
          },
          Filter: "filter",
        },
        {
          Header: "تاریخ",
          accessor: "Start_Date",
          Filter: "filter",
        },
      ],
      [],
    ) || [];

  if (depo.isLoading) return <UsersSkeleton />;

  return (
    <>
      <div
        className="flex  w-full flex-col items-center justify-center gap-5"
        dir="rtl"
      >
        <div className="flex w-full items-center justify-between gap-5 laptopMax:flex-col">
          <div className="flex w-full flex-col gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 p-5">
            <Title>نمودار دپو</Title>
            <BarChart
              dir="rtl"
              data={flatDepos.map((depo) => {
                return {
                  name: depo.ServiceName,
                  "تعداد بلاتکلیف": depo.DepoCount,
                  "تعداد ورودی": depo.EntryCount,
                  "تعداد رسیدگی": depo.Capicity,
                };
              })}
              index="name"
              //  categories={["پاراکلینیک", "بیمارستانی", "دارو"]}
              categories={["تعداد بلاتکلیف", "تعداد ورودی", "تعداد رسیدگی"]}
              colors={["blue", "red", "green"]}
              // valueFormatter={dataFormatter}
              yAxisWidth={48}
            />
          </div>
          <div className="flex w-full flex-col gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 p-5">
            <Title>نمودار زمانی </Title>
            <AreaChart
              data={flatDepos.map((depo) => {
                return {
                  date: depo.Start_Date,
                  name: depo.ServiceName,
                  "تعداد بلاتکلیف": depo.DepoCount,
                  "تعداد ورودی": depo.EntryCount,
                  "تعداد رسیدگی": depo.Capicity,
                };
              })}
              index="date"
              //  categories={["پاراکلینیک", "بیمارستانی", "دارو"]}
              categories={["تعداد بلاتکلیف", "تعداد ورودی", "تعداد رسیدگی"]}
              colors={["blue", "red", "green"]}
              // valueFormatter={dataFormatter}
            />
          </div>
        </div>

        <div className="w-full  rounded-lg border  border-accent/30 bg-secondary text-center ">
          <Table data={flatDepos} columns={columns} />
        </div>
      </div>
    </>
  );
}

function UsersSkeleton() {
  return (
    <>
      {[...Array(11).keys()].map((i) => {
        return (
          <>
            <span
              key={i}
              className="inline-block h-12 w-full animate-pulse rounded-xl bg-accent opacity-30"
              style={{
                animationDelay: `${i * 5}`,
                animationDuration: "1s",
              }}
            />
          </>
        );
      })}
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <>
      <Button
        className="flex items-stretch justify-center gap-2 rounded-full bg-secbuttn stroke-accent px-3 text-accent"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        <span className="pt-1">
          {sessionData ? sessionData.user?.username : "ورود"}
        </span>
        <span>
          <UserCog2 />
        </span>
      </Button>
    </>
  );
}
