import moment from "jalali-moment";
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
import { CITIES } from "~/constants";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import H2 from "~/ui/heading/h2";
import { api } from "~/utils/api";
import {
  calculateAggregateByFields,
  getPersianToEnglishCity,
} from "~/utils/util";

const fakeData = [
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
function assignColorsToItems(items) {
  const colors = [
    "#2196F3", // Blue
    "#F44336", // Red
    "#4CAF50", // Green
    "#9C27B0", // Purple
    "#E91E63", // Pink
    "#009688", // Teal
    "#00BCD4", // Cyan
    "#673AB7", // Deep Purple
    "#3F51B5", // Indigo
    "#BBAB8C", // BBAB8C
    "#FF5722", // Deep Orange
    "#795548", // Brown
    "#607D8B", // Blue Grey
    "#FF9800", // Orange
    "#9E9E9E", // Grey
    "#9C27B0", // Purple
    "#3F51B5", // Indigo
    "#E91E63", // Pink
    "#FF5722", // Deep Orange
    "#FF9800", // Orange
    "#795548", // Brown
    "#673AB7", // Deep Purple
    "#9C27B0", // Purple
    "#E91E63", // Pink
    "#BEADFA", // BEADFA
    "#4CAF50", // Green
    "#00BCD4", // Cyan
    "#2196F3", // Blue
    "#F44336", // Red
    "#607D8B", // Blue Grey
    "#9E9E9E", // Grey
  ];
  const result = [];

  items.forEach((item, index) => {
    const color = colors[index % colors.length];
    result.push({ name: item, color: color });
  });

  return result;
}
export default function RadarGauge({ CityName = [] }) {
  const defualtDateInfo = api.personnel.getDefualtDateInfo.useQuery();
  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: "ماهانه",
        filter: {
          CityName: CityName.map((c) => getPersianToEnglishCity(c)),
          Role: defualtRoles,
          ProjectType: defaultProjectTypes,
          DateInfo: [defualtDateInfo.data],
          ContractType: defualtContractTypes,
          RoleType: [],
          Start_Date: [moment().locale("fa").format("yyyy/MM/01")],
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
    dd.date = a.date.split("/")[2];

    dd["fullMark"] = 200;
    return a;
  });
  const distinctCities = assignColorsToItems(
    getDistinctCityNames(getCitiesWithPerformance?.data),
  );

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl bg-secbuttn py-5 2xl:flex-row ">
      <H2 className="text-xl">{moment().locale("fa").format("MMMM")}</H2>
      <ResponsiveContainer
        width={400}
        height={400}
        className="flex items-center justify-center stroke-primary 2xl:w-1/2"
      >
        <RadarChart
          className="stroke-primary"
          cx={"50%"}
          cy={"50%"}
          outerRadius={150}
          data={data}
        >
          <PolarGrid className="stroke-primary" />
          <PolarAngleAxis className="stroke-primary" dataKey="date" />
          <PolarRadiusAxis
            className="stroke-primary"
            angle={30}
            domain={[0, 1]}
          />

          {distinctCities.map((city) => {
            return (
              <>
                <Radar
                  legendType="none"
                  key={city.name}
                  name={city.name}
                  dataKey={city.name}
                  fill={city.color}
                  className=" stroke-primary"
                  fillOpacity={0.6}
                />
              </>
            );
          })}

          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center justify-center gap-2 2xl:w-1/2 ">
        {distinctCities.map((city) => {
          return (
            <>
              <span
                style={{
                  background: city.color,
                }}
                className="rounded-xl  bg-secondary p-2  "
              >
                <p className="text-xs  text-primary">{city.name}</p>
              </span>
            </>
          );
        })}
      </div>
    </div>
  );
}
