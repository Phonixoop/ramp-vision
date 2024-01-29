import moment from "jalali-moment";
import {
  Indicators,
  Performance_Levels,
} from "~/constants/personnel-performance";
import { CityWithPerformanceData } from "~/types";
import { getEnglishToPersianCity, processDataForChart } from "~/utils/util";

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

export function DistinctDataAndCalculatePerformance(
  data,
  groupBy = ["CityName"],
  values = [
    "SabtAvalieAsnad",
    "PazireshVaSabtAvalieAsnad",
    "ArzyabiAsanadBimarsetaniDirect",
    "ArzyabiAsnadBimarestaniIndirect",
    "ArzyabiAsnadDandanVaParaDirect",
    "ArzyabiAsnadDandanVaParaIndirect",
    "ArzyabiAsnadDaroDirect",
    "ArzyabiAsnadDaroIndirect",
    "WithScanCount",
    "WithoutScanCount",
    "WithoutScanInDirectCount",
    "COUNT",
    "TotalPerformance",
  ],
  where = {},
) {
  const dataWithThurdsdayEdit = data?.result?.map((item) => {
    const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;
    const count = item.COUNT > 0 ? item.COUNT : 1;
    return {
      ...item,
      TotalPerformance: isThursday
        ? calculatePerformance(item, 1, 2) / count
        : item.TotalPerformance,
    };
  });

  const citiesWithPerformanceData = processDataForChart(
    dataWithThurdsdayEdit ?? [],
    groupBy,
    values,
    where,
  );

  return mapToCitiesWithPerformance({
    dateLength: data?.dateLength,
    result: citiesWithPerformanceData,
  });
}

export function DistinctPersonnelPerformanceData(
  data,
  groupBy = ["CityName"],
  values = [
    "SabtAvalieAsnad",
    "PazireshVaSabtAvalieAsnad",
    "ArzyabiAsanadBimarsetaniDirect",
    "ArzyabiAsnadBimarestaniIndirect",
    "ArzyabiAsnadDandanVaParaDirect",
    "ArzyabiAsnadDandanVaParaIndirect",
    "ArzyabiAsnadDaroDirect",
    "ArzyabiAsnadDaroIndirect",
    "WithScanCount",
    "WithoutScanCount",
    "WithoutScanInDirectCount",
    "TotalPerformance",
  ],
  where = {},
) {
  const dataWithThurdsdayEdit = data?.result?.map((item) => {
    const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

    const count = item.COUNT > 0 ? item.COUNT : 1;
    return {
      ...item,
      TotalPerformance: isThursday
        ? calculatePerformance(item, 1, 2) / count
        : item.TotalPerformance,
    };
  });

  return processDataForChart(
    dataWithThurdsdayEdit ?? [],
    groupBy,
    values,
    where,
  ).map((item) => {
    return {
      ...item,
      TotalPerformance: item.TotalPerformance / data.dateLength,
    };
  });
}
function mapToCitiesWithPerformance({
  dateLength,
  result,
}): CityWithPerformanceData[] {
  return result.map((item) => {
    // const personnelCount = result.find(
    //   (a) => a.key.CityName === item.key.CityName,
    // ).COUNT;

    return {
      CityName_En: item.key.CityName,
      CityName_Fa: getEnglishToPersianCity(item.key.CityName),
      TotalPerformance: item.TotalPerformance / dateLength,

      // calculatePerformance(item, data?.dateLength) /
      // Math.max(
      //   ...data?.result
      //     .filter((a) => a.CityName === item.key)
      //     .map((a) => a.COUNT),
      // ),
    };
  });
}

export function sparkChartForPersonnelAndCity(
  data,
  propertyToCheck,
  valueToCheck,
) {
  return data
    .filter((a) => a[propertyToCheck] === valueToCheck)
    .map((item) => {
      const isThursday = moment(item.Start_Date, "jYYYY/jMM/jDD").jDay() === 5;

      return {
        TotalPerformance: isThursday
          ? calculatePerformance(item, 1, 2)
          : item.TotalPerformance,
        Start_Date: item.Start_Date,
        Benchmark: 75,
        Benchmark2: 120,
      };
    });
}

export const getPerformanceMetric = (limit) => {
  // Find the first metric that matches the condition
  const selectedMetric = Performance_Levels.find(
    (metric) => limit <= metric.limit,
  );

  // If nothing is found, return the last metric
  return selectedMetric || Performance_Levels[Performance_Levels.length - 1];
};
