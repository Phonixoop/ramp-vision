import { Indicators } from "~/constants/personnel-performance";
import { CityWithPerformanceData } from "~/types";
import { getEnglishToPersianCity, processDataForChart } from "~/utils/util";

export function calculatePerformance(item: any, dateLenght: number): number {
  // console.log({ item, dateLenght });
  const performance =
    item.SabtAvalieAsnad / (dateLenght * Indicators.SabtAvalieAsnad) +
    item.PazireshVaSabtAvalieAsnad /
      (dateLenght * Indicators.PazireshVaSabtAvalieAsnad) +
    item.ArzyabiAsanadBimarsetaniDirect /
      (dateLenght * Indicators.ArzyabiAsanadBimarsetaniDirect) +
    item.ArzyabiAsnadBimarestaniIndirect /
      (dateLenght * Indicators.ArzyabiAsnadBimarestaniIndirect) +
    item.ArzyabiAsnadDandanVaParaDirect /
      (dateLenght * Indicators.ArzyabiAsnadDandanVaParaDirect) +
    item.ArzyabiAsnadDandanVaParaIndirect /
      (dateLenght * Indicators.ArzyabiAsnadDandanVaParaIndirect) +
    item.ArzyabiAsnadDaroDirect /
      (dateLenght * Indicators.ArzyabiAsnadDaroDirect) +
    item.ArzyabiAsnadDaroIndirect /
      (dateLenght * Indicators.ArzyabiAsnadDaroIndirect) +
    item.WithScanCount / (dateLenght * Indicators.WithScanCount) +
    item.WithoutScanCount / (dateLenght * Indicators.WithoutScanCount) +
    item.WithoutScanInDirectCount /
      (dateLenght * Indicators.WithoutScanInDirectCount);

  return performance * 100;
}

export function DistinctDataAndCalculatePerformance(
  data,
): CityWithPerformanceData[] {
  const citiesWithPerformanceData = processDataForChart(
    data?.result ?? [],
    ["CityName"],
    [
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
  ).map((item) => {
    return {
      CityName_En: item.key,
      CityName_Fa: getEnglishToPersianCity(item.key),
      TotalPerformance:
        calculatePerformance(item, data?.dateLength) /
        Math.max(
          ...data?.result
            .filter((a) => a.CityName === item.key)
            .map((a) => a.COUNT),
        ),
    };
  });

  return citiesWithPerformanceData;
}
