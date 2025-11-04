"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/shadcn/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/shadcn/chart";
import { commify } from "~/utils/util";

export const description = "A pie chart with a label";

const chartData = [
  { name: "ورودی", value: 275, fill: "red" },
  { name: "رسیدگی", value: 200, fill: "blue" },
  { name: "مانده", value: 187, fill: "green" },
];

const chartConfig = {
  value: {
    label: "value",
  },
  ورودی: {
    label: "ورودی",
    color: "red",
  },
  رسیدگی: {
    label: "رسیدگی",
    color: "blue",
  },
  مانده: {
    label: "مانده",
    color: "green",
  },
} satisfies ChartConfig;

export function ChartPieLabel({ data }: { data: any[] }) {
  const config = data.map((d) => {
    return {
      [d.name]: d.fill,
    };
  });

  return (
    <Card className="flex w-full flex-col">
      <CardHeader className="items-center pb-0"></CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          style={{ height: "400px" }}
          className="bg-(var(--color-red)) mx-auto aspect-square h-full min-h-[250px] max-w-[250px] pb-0 [&_.recharts-pie-label-text]:fill-primary"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              fontSize={20}
              label={(entry) => `${commify(entry.value)}`}
              nameKey="name"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
