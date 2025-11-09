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
  console.log({ data });
  const citiesWithPerformanceData = processDataForChart({
    rawData: data?.result ?? [],
    groupBy,
    values,
    where,
    options: {
      max: ["COUNT"],
    },
  });
  console.log({ citiesWithPerformanceData });
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
    // this count is max count of people who has shown up to work for that city
    let workDaysCountForCities = workDays ? workDays * item.COUNT : null;

    const divisor = workDaysCountForCities || item.COUNTTotal;

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
  additionalFilters?: Record<string, any>, // Add optional additional filters to match aggregation grouping
) {
  return data
    ?.filter((a: any) => {
      // Base filter: property match and no day off
      if (a[propertyToCheck] !== valueToCheck || a.HasTheDayOff !== false) {
        return false;
      }

      // Apply additional filters if provided (e.g., to match aggregation grouping by NationalCode, CityName, etc.)
      if (additionalFilters) {
        return Object.entries(additionalFilters).every(([key, value]) => {
          return a[key] === value;
        });
      }

      return true;
    })
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

/**
 * Debug function to compare sparkData TotalPerformance sum with aggregated total
 * Call this in the browser console with the selectedPerson object
 */
export function debugTotalPerformanceMismatch(selectedPerson: any) {
  if (!selectedPerson) {
    console.warn("selectedPerson is not provided");
    return;
  }

  const sparkDataSum =
    selectedPerson.sparkData?.reduce(
      (sum: number, item: any) => sum + (item.TotalPerformance || 0),
      0,
    ) || 0;

  const aggregatedTotal = selectedPerson.total || 0;
  const aggregatedAverage = selectedPerson.TotalPerformance || 0;
  const rowCount = selectedPerson.key?.rowCount || selectedPerson.rowCount || 0;

  console.group("🔍 TotalPerformance Debug");
  console.log("Person:", {
    NameFamily: selectedPerson.NameFamily,
    NationalCode: selectedPerson.NationalCode,
    CityName: selectedPerson.CityName,
  });
  console.log("📊 SparkData:", {
    itemCount: selectedPerson.sparkData?.length || 0,
    sum: sparkDataSum,
    items: selectedPerson.sparkData?.map((item: any) => ({
      Start_Date: item.Start_Date,
      TotalPerformance: item.TotalPerformance,
    })),
  });
  console.log("📈 Aggregated Data:", {
    total: aggregatedTotal,
    average: aggregatedAverage,
    rowCount: rowCount,
    expectedAverage: rowCount > 0 ? aggregatedTotal / rowCount : 0,
  });
  console.log("🔢 Difference:", {
    absolute: Math.abs(aggregatedTotal - sparkDataSum),
    percentage:
      aggregatedTotal > 0
        ? (
            (Math.abs(aggregatedTotal - sparkDataSum) / aggregatedTotal) *
            100
          ).toFixed(2) + "%"
        : "N/A",
  });

  if (Math.abs(aggregatedTotal - sparkDataSum) > 0.01) {
    console.warn("⚠️ MISMATCH DETECTED!");
    console.log("Possible causes:");
    console.log("1. Different data sources (getAll.data vs aggregated data)");
    console.log(
      "2. Records with HasTheDayOff=true included in aggregation but not in sparkData",
    );
    console.log("3. Multiple records per day being summed in aggregation");
    console.log(
      "4. Data filtering differences between processDataForChart and sparkChartForPersonnel",
    );
  } else {
    console.log("✅ Values match!");
  }
  console.groupEnd();

  return {
    sparkDataSum,
    aggregatedTotal,
    difference: Math.abs(aggregatedTotal - sparkDataSum),
    rowCount,
  };
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
