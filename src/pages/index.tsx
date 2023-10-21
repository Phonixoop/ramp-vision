import { ArrowDownRightIcon, UserCog2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import Menu, { InPageMenu } from "~/features/menu";

import Table from "~/features/table";

import { ThemeBoxHovery } from "~/features/theme-box";

import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { Container } from "~/ui/containers";

import { useDeferredValue, useMemo, useState } from "react";
import { api } from "~/utils/api";
import {
  Title,
  BarChart,
  AreaChart,
  DonutChart,
  Tracker,
  Card,
  Metric,
  CategoryBar,
  Legend,
} from "@tremor/react";
import CheckboxList, {
  SelectColumnFilter,
  SelectControlled,
} from "~/features/checkbox-list";
import MultiBox from "~/ui/multi-box";
import moment from "jalali-moment";
import DatePicker from "react-multi-date-picker";
import { default as DatePickerButton } from "react-multi-date-picker/components/button";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  calculateDepoCompleteTime,
  en,
  getServiceNameColor,
  processDataForChart,
  processDepoCompleteTimeData,
} from "~/utils/util";
import H2 from "~/ui/heading/h2";
import TrackerView from "~/features/tracker";
import { Reports_Period } from "~/constants";
import { cn } from "~/lib/utils";
import { Column } from "react-table";
import Header from "~/features/header";
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
    value: "جزئیات عملکرد شعب",
    link: "/dashboard/depo",
  },
  {
    value: "جزئیات عملکرد پرسنل شعب",
    link: "/dashboard/personnel_performance",
  },
];
function CustomInput({ value, openCalendar }) {
  return (
    <>
      <Button className="w-full text-center" onClick={openCalendar}>
        {value ? value : "انتخاب کنید"}
      </Button>
    </>
  );
}
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
function filterColumn(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    // console.log(rowValue, filterValue);
    return filterValue.includes(rowValue);
  });
}
export default function Home() {
  // const users = api.example.getAll.useQuery();
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <title>RAMP | Vision</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BlurBackground />
      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000 ">
        <Header />
      </div>
    </>
  );
}
const cities = [
  {
    name: "New York",
    sales: 9800,
  },
  {
    name: "London",
    sales: 4567,
  },
  {
    name: "Hong Kong",
    sales: 3908,
  },
  {
    name: "San Francisco",
    sales: 2400,
  },
  {
    name: "Singapore",
    sales: 1908,
  },
  {
    name: "Zurich",
    sales: 1398,
  },
];

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
