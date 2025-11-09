import moment from "jalali-moment";
import {
  Indicators,
  Performance_Levels_Gauge,
} from "~/constants/personnel-performance";
import { PeriodType } from "~/context/personnel-filter.context";
import { CityWithPerformanceData } from "~/types";
import { getMonthName, getWeekOfMonth } from "~/utils/date-utils";
import {
  getEnglishToPersianCity,
  getPersianToEnglishCity,
  processDataForChart,
} from "~/utils/util";

export function calculatePerformance(
  item: any,
  dateLenght: number,
  devideBy: number = 1,
): number {
  // console.log({ item, dateLenght });
  const performance =
    item.SabtAvalieAsnad /
      ((dateLenght * Indicators.SabtAvalieAsnad) / devideBy) +
    item.PazireshVaSabtAvalieAsnad /
      ((dateLenght * Indicators.PazireshVaSabtAvalieAsnad) / devideBy) +
    item.ArzyabiAsanadBimarsetaniDirect /
      ((dateLenght * Indicators.ArzyabiAsanadBimarsetaniDirect) / devideBy) +
    item.ArzyabiAsnadBimarestaniIndirect /
      ((dateLenght * Indicators.ArzyabiAsnadBimarestaniIndirect) / devideBy) +
    item.ArzyabiAsnadDandanVaParaDirect /
      ((dateLenght * Indicators.ArzyabiAsnadDandanVaParaDirect) / devideBy) +
    item.ArzyabiAsnadDandanDirect /
      ((dateLenght * Indicators.ArzyabiAsnadDandanDirect) / devideBy) +
    item.ArzyabiAsnadDandanIndirect /
      ((dateLenght * Indicators.ArzyabiAsnadDandanIndirect) / devideBy) +
    item.ArzyabiAsnadDandanVaParaIndirect /
      ((dateLenght * Indicators.ArzyabiAsnadDandanVaParaIndirect) / devideBy) +
    item.ArzyabiAsnadDaroDirect /
      ((dateLenght * Indicators.ArzyabiAsnadDaroDirect) / devideBy) +
    item.ArzyabiAsnadDaroIndirect /
      ((dateLenght * Indicators.ArzyabiAsnadDaroIndirect) / devideBy) +
    item.WithScanCount / ((dateLenght * Indicators.WithScanCount) / devideBy) +
    item.WithoutScanCount /
      ((dateLenght * Indicators.WithoutScanCount) / devideBy) +
    item.WithoutScanInDirectCount /
      ((dateLenght * Indicators.WithoutScanInDirectCount) / devideBy);

  return performance * 100;
}

export function distinctDataAndCalculatePerformance(
  data,
  groupBy = ["CityName"],
  values = [
    "SabtAvalieAsnad",
    "PazireshVaSabtAvalieAsnad",
    "ArzyabiAsanadBimarsetaniDirect",
    "ArzyabiAsnadBimarestaniIndirect",
    "ArzyabiAsnadDandanVaParaDirect",
    "ArzyabiAsnadDandanVaParaIndirect",
    "ArzyabiAsnadDandanDirect",
    "ArzyabiAsnadDandanIndirect",
    "ArzyabiAsnadDaroDirect",
    "ArzyabiAsnadDaroIndirect",
    "WithScanCount",
    "WithoutScanCount",
    "WithoutScanInDirectCount",
    "ArchiveDirectCount",
    "ArchiveInDirectCount",
    "ArzyabiVisitDirectCount",
    "COUNT",
    "TotalPerformance",
    "DirectPerFormance",
    "InDirectPerFormance",
  ],
  where = {},
  workDays?: number | null,
) {
  // const dataWithThurdsdayEdit = data?.result?.map((item) => {
  //   const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;
  //   // const count = item.COUNT > 0 ? item.COUNT : 1;
  //   return {
  //     ...item,
  //     TotalPerformance: isThursday
  //       ? calculatePerformance(item, 1, 2)
  //       : item.TotalPerformance,
  //   };
  // });

  const citiesWithPerformanceData = processDataForChart({
    rawData: data?.result ?? [],
    groupBy,
    values,
    where,
    // {
    //   max: ["COUNT"],
    // },
  });
  const r = mapToCitiesWithPerformance({
    dateLengthPerCity: data?.dateLength,
    result: citiesWithPerformanceData,
    workDays,
  });
  return r;
}

export function distinctPersonnelPerformanceData(
  data = {
    periodType: "",
    dateLength: {},
    result: [],
  },
  groupBy = ["CityName"],
  values = [
    "SabtAvalieAsnad",
    "PazireshVaSabtAvalieAsnad",
    "ArzyabiAsanadBimarsetaniDirect",
    "ArzyabiAsnadBimarestaniIndirect",
    "ArzyabiAsnadDandanVaParaDirect",
    "ArzyabiAsnadDandanVaParaIndirect",
    "ArzyabiAsnadDandanDirect",
    "ArzyabiAsnadDandanIndirect",
    "ArzyabiAsnadDaroDirect",
    "ArzyabiAsnadDaroIndirect",
    "WithScanCount",
    "WithoutScanCount",
    "WithoutScanInDirectCount",
    "ArchiveDirectCount",
    "ArchiveInDirectCount",
    "ArzyabiVisitDirectCount",
    "TotalPerformance",
  ],
  where = {},
  workDays?: number | null,
) {
  // const dataWithThurdsdayEdit = data?.result?.map((item) => {
  //   const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

  //   // const count = item.COUNT > 0 ? item.COUNT : 1;
  //   return {
  //     ...item,

  //     TotalPerformance: 5,
  //   };
  // });
  return processDataForChart({
    rawData: data?.result ?? [],
    groupBy,
    values,
    where,
  }).map((item) => {
    // const city =
    //   getPersianToEnglishCity(item.key.CityName) ?? item.key.CityName;

    console.log({ workDays, rowCount: item.key.rowCount });
    // Use work days if provided, otherwise use rowCount
    const divisor = workDays || item.key.rowCount;

    return {
      ...item.key, // Spread the key properties to make them top-level
      ...item, // Spread the aggregated values
      TotalPerformance: item.TotalPerformance / divisor,
      DirectPerFormance: item.DirectPerFormance / divisor,
      InDirectPerFormance: item.InDirectPerFormance / divisor,
      // (groupBy.includes("Start_Date")
      //   ? item.key.COUNT
      //   : data.dateLength[city]),
      // (groupBy.includes("Start_Date") ? item.key.COUNT : data.dateLength)
    };
  });
}
function mapToCitiesWithPerformance({
  dateLengthPerCity,
  result,
  workDays,
}: {
  dateLengthPerCity: any;
  result: any[];
  workDays?: number | null;
}): CityWithPerformanceData[] {
  return result.map((item) => {
    // const personnelCount = result.find(
    //   (a) => a.key.CityName === item.key.CityName,
    // ).COUNT;
    // console.log({ item });
    // const maxCount = Math.max(
    //   result.filter((a) => a.CityName === item.key).map((a) => a.COUNT),
    // );
    // Use work days if provided, otherwise use COUNT
    const divisor = workDays || item.COUNT;

    return {
      CityName_En: item.key.CityName,
      CityName_Fa: getEnglishToPersianCity(item.key.CityName),
      TotalPerformance: item.TotalPerformance / divisor,
      DirectPerFormance: item.DirectPerFormance / divisor,
      InDirectPerFormance: item.InDirectPerFormance / divisor,
      // calculatePerformance(item, data?.dateLength) /
      // Math.max(
      //   ...data?.result
      //     .filter((a) => a.CityName === item.key)
      //     .map((a) => a.COUNT),
      // ),
    };
  });
}

export function sparkChartForPersonnel(
  data = [],
  propertyToCheck,
  valueToCheck,
  selectExtraProperty = [],
) {
  return data
    ?.filter(
      (a: any) =>
        a[propertyToCheck] === valueToCheck && a.HasTheDayOff === false,
    )
    .map((item: any) => {
      // const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

      return {
        TotalPerformance: item.TotalPerformance,
        Start_Date: item.Start_Date,
        Benchmark: 75,
        Benchmark2: 120,
        ...selectExtraProperty.reduce((acc: any, curr) => {
          acc[curr] = item[curr];
          return acc;
        }, {}),
      };
    });
}

export function sparkChartForCity(data = [], propertyToCheck, valueToCheck) {
  return data
    ?.filter((a) => a[propertyToCheck] === valueToCheck)
    .map((item: any) => {
      // const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

      return {
        TotalPerformance: item.TotalPerformance,
        Start_Date: item.Start_Date,
        Benchmark: 75,
        Benchmark2: 120,
      };
    });
}

export const getPerformanceMetric = (limit) => {
  // Find the first metric that matches the condition
  const selectedMetric = Performance_Levels_Gauge.find(
    (metric) => limit <= metric.limit,
  );

  // If nothing is found, return the last metric
  return (
    selectedMetric ||
    Performance_Levels_Gauge[Performance_Levels_Gauge.length - 1]
  );
};

export function getMonthNamesFromJOINED_date_strings(
  dates: string,
  reportPeriod: PeriodType,
) {
  if (!dates || typeof dates !== "string" || dates.trim() === "") return "";

  if (reportPeriod === "هفتگی") {
    const datesSplitted = dates.split(",");
    // if (datesSplitted.length >= 2)
    //   return `${datesSplitted[0]} ~ ${datesSplitted[datesSplitted.length - 1]}`;
    // return dates;
    const date = datesSplitted[datesSplitted.length - 1] ?? "";

    const weekNumber = getWeekOfMonth(date);
    const weekName = `هفته ${weekNumber} ${getMonthName(date)}`;

    return weekName;
  } else if (reportPeriod === "ماهانه") {
    const resultArray = dates.split(",").map(getMonthName);

    return [...new Set(resultArray)].join(",");
  } else return dates;
}
