import React, { PureComponent } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { api } from "~/utils/api";
import { calculateAggregateByFields } from "~/utils/util";

const data = [
  {
    subject: "1",
    A: 100,
    fullMark: 200,
  },
  {
    subject: "2",
    A: 105,
    fullMark: 200,
  },
  {
    subject: "3",
    A: 120,
    fullMark: 200,
  },
  {
    subject: "4",
    A: 90,
    fullMark: 200,
  },
  {
    subject: "5",
    A: 90,
    fullMark: 100,
  },
  {
    subject: "6",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "7",
    A: 200,
    fullMark: 200,
  },
  {
    subject: "8",
    A: 156,
    fullMark: 200,
  },
  {
    subject: "9",
    A: 190,
    fullMark: 200,
  },
  {
    subject: "10",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "11",
    A: 100,
    fullMark: 200,
  },
  {
    subject: "12",
    A: 105,
    fullMark: 200,
  },
  {
    subject: "13",
    A: 120,
    fullMark: 200,
  },
  {
    subject: "14",
    A: 90,
    fullMark: 200,
  },
  {
    subject: "15",
    A: 90,
    fullMark: 100,
  },
  {
    subject: "16",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "17",
    A: 200,
    fullMark: 200,
  },
  {
    subject: "18",
    A: 156,
    fullMark: 200,
  },
  {
    subject: "19",
    A: 190,
    fullMark: 200,
  },
  {
    subject: "20",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "21",
    A: 200,
    fullMark: 200,
  },
  {
    subject: "22",
    A: 156,
    fullMark: 200,
  },
  {
    subject: "23",
    A: 190,
    fullMark: 200,
  },
  {
    subject: "24",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "25",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "26",
    A: 150,
    fullMark: 200,
  },
  {
    subject: "27",
    A: 150,
    fullMark: 200,
  },
];
function getDistinctCityNames(inputData = []) {
  const distinctCityNames = [
    ...new Set(inputData.map((item) => item.CityName)),
  ];
  return distinctCityNames;
}
function aggregateData(inputData = []) {
  const aggregatedData = {};

  inputData.forEach((d) => {
    if (!aggregatedData[d.Start_Date]) {
      aggregatedData[d.Start_Date] = { Start_Date: d.Start_Date };
    }

    if (!aggregatedData[d.Start_Date][d.CityName]) {
      aggregatedData[d.Start_Date][d.CityName] = 0;
    }

    aggregatedData[d.Start_Date][d.CityName] += d.TotalPerformance;
  });

  const result = Object.values(aggregatedData).map((item: any) => {
    const cityCount = Object.keys(item).length - 1; // Excluding the 'date' property
    const averageTotalPerformance = {};
    for (const city in item) {
      if (city !== "Start_Date") {
        averageTotalPerformance[city] = Math.round(item[city] / cityCount);
      }
    }
    return { date: item.Start_Date, ...averageTotalPerformance };
  });

  return result;
}

export default function RadarGauge({ CityName = [] }) {
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: "ماهانه",
        filter: {
          CityName,
          Role: [
            "کارشناس ارزیاب اسناد بیمارستانی",
            "کارشناس ارزیاب اسناد پاراکلینیکی",
            "کارشناس ارزیاب اسناد دارویی",
            "کارشناس ارزیاب اسناد دندانپزشکی",
            "کارشناس پذیرش اسناد",
            "کارشناس ثبت اسناد خسارت",
          ],
          ProjectType: ["جبران"],
          DateInfo: ["1402/03/31"],
          ContractType: ["تمام وقت"],
          RoleType: [],
          Start_Date: ["1402/07/01"],
        },
      },
      {
        refetchOnWindowFocus: true,
      },
    );
  //   const operations = [
  //     {
  //       fieldName: "TotalPerformance",
  //       operation: "average",
  //     },
  //     {
  //       fieldName: "Start_Date",
  //       operation: "array",
  //     },
  //   ];
  //   const result = calculateAggregateByFields(
  //     getCitiesWithPerformance?.data,
  //     operations,
  //   );
  const data = aggregateData(getCitiesWithPerformance?.data).map((a) => {
    const dd = a;
    dd["subject"] = a.date.split("/")[2];
    delete dd.date;

    dd["fullMark"] = 200;
    return a;
  });
  const distinctCities = getDistinctCityNames(getCitiesWithPerformance?.data);
  console.log(data ?? "no data");
  return (
    <div className="h-auto w-full rounded-2xl bg-secbuttn  ">
      <ResponsiveContainer
        className="stroke-primary"
        width="100%"
        height="100%"
      >
        <RadarChart
          className="stroke-primary"
          cx="50%"
          cy="50%"
          outerRadius="100%"
          data={data}
        >
          <PolarGrid className="stroke-primary" />
          <PolarAngleAxis className="stroke-primary" dataKey="subject" />
          <PolarRadiusAxis
            className="stroke-primary"
            angle={30}
            domain={[0, 5]}
          />

          {distinctCities.map((cityName) => {
            return (
              <>
                <Radar
                  name={cityName}
                  dataKey={cityName}
                  className=" fill-accent stroke-primary"
                  fillOpacity={0.6}
                />
              </>
            );
          })}

          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
