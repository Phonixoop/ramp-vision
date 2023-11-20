import { AreaChart, Card, Title } from "@tremor/react";
import H2 from "~/ui/heading/h2";

const chartdata = [
  {
    date: "Jan 22",
    SemiAnalysis: 2890,
    "The Pragmatic Engineer": 2338,
  },
  {
    date: "Feb 22",
    SemiAnalysis: 2756,
    "The Pragmatic Engineer": 2103,
  },
  {
    date: "Mar 22",
    SemiAnalysis: 3322,
    "The Pragmatic Engineer": 2194,
  },
  {
    date: "Apr 22",
    SemiAnalysis: 3470,
    "The Pragmatic Engineer": 2108,
  },
  {
    date: "May 22",
    SemiAnalysis: 3475,
    "The Pragmatic Engineer": 1812,
  },
  {
    date: "Jun 22",
    SemiAnalysis: 3129,
    "The Pragmatic Engineer": 1726,
  },
];

const valueFormatter = function (number) {
  return "$ " + new Intl.NumberFormat("us").format(number).toString();
};

export default function TestPage() {
  return (
    <>
      <div className="w-full px-5 xl:px-0 ">
        <div className="flex w-full flex-col items-center justify-center gap-5">
          <div className="flex w-full  flex-col items-center justify-center gap-5 xl:flex-row">
            <div className="flex w-full  flex-col items-stretch justify-between gap-5 xl:flex-row">
              <div className="flex w-full flex-col justify-center gap-5 rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:p-5">
                <H2 className="text-lg font-bold">نمودار به تفکیک فعالیت</H2>
                <Card>
                  <Title>Newsletter revenue over time (USD)</Title>
                  <AreaChart
                    className="mt-4 h-72"
                    data={chartdata}
                    index="date"
                    categories={["SemiAnalysis", "The Pragmatic Engineer"]}
                    colors={["indigo", "cyan"]}
                    valueFormatter={valueFormatter}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
