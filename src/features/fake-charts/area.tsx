import { AreaChart, Card, Title } from "@tremor/react";

const chartdata = [
  {
    date: "دی ",
    دارو: 2890,
    پاراکلینیک: 2890,
    بیمارستانی: 2338,
  },
  {
    date: "بهمن ",
    دارو: 2756,
    پاراکلینیک: 2890,
    بیمارستانی: 2103,
  },
  {
    date: "اسفند ",
    دارو: 3322,
    پاراکلینیک: 2322,
    بیمارستانی: 2194,
  },
  {
    date: "فروردین ",
    دارو: 3470,
    پاراکلینیک: 2470,
    بیمارستانی: 2108,
  },
  {
    date: "اردیبهشت ",
    دارو: 3475,
    پاراکلینیک: 2475,
    بیمارستانی: 1812,
  },
  {
    date: "خرداد ",
    دارو: 3129,
    پاراکلینیک: 2129,
    بیمارستانی: 1726,
  },
];

const valueFormatter = function (number) {
  return "" + new Intl.NumberFormat("us").format(number).toString();
};

export default function AreaChartFake() {
  return (
    <>
      <Card>
        <AreaChart
          className="mt-4 h-72"
          data={chartdata}
          index="date"
          categories={["دارو", "بیمارستانی", "پاراکلینیک"]}
          colors={["indigo", "cyan"]}
          showLegend={false}
          valueFormatter={valueFormatter}
        />
      </Card>
    </>
  );
}
