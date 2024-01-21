import { Indicators } from "~/constants/personnel-performance";

export function calculatePerformance(item: any, dateLenght: number): number {
  const performance =
    (item.SabtAvalieAsnad / dateLenght) * Indicators.SabtAvalieAsnad +
    (item.PazireshVaSabtAvalieAsnad / dateLenght) *
      Indicators.PazireshVaSabtAvalieAsnad +
    (item.ArzyabiAsanadBimarsetaniDirect / dateLenght) *
      Indicators.ArzyabiAsanadBimarsetaniDirect +
    (item.ArzyabiAsnadBimarestaniIndirect / dateLenght) *
      Indicators.ArzyabiAsnadBimarestaniIndirect +
    (item.ArzyabiAsnadDandanVaParaDirect / dateLenght) *
      Indicators.ArzyabiAsnadDandanVaParaDirect +
    (item.ArzyabiAsnadDandanVaParaIndirect / dateLenght) *
      Indicators.ArzyabiAsnadDandanVaParaIndirect +
    (item.ArzyabiAsnadDaroDirect / dateLenght) *
      Indicators.ArzyabiAsnadDaroDirect +
    (item.ArzyabiAsnadDaroIndirect / dateLenght) *
      Indicators.ArzyabiAsnadDaroIndirect +
    (item.WithScanCount / dateLenght) * Indicators.WithScanCount +
    (item.WithoutScanCount / dateLenght) * Indicators.WithoutScanCount +
    (item.WithoutScanInDirectCount / dateLenght) *
      Indicators.WithoutScanInDirectCount;

  return performance;
}
