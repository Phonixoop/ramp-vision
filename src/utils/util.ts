export function getPathName(path) {
  return path?.substring(path.lastIndexOf("/") + 1);
}
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const reloadSession = () => {
  const event = new Event("visibilitychange");
  document.dispatchEvent(event);
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function en(inputString): string {
  const persianToEnglishMap = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };

  return inputString.replace(/[۰-۹]/g, (match) => persianToEnglishMap[match]);
}

export function processDataForChart(rawData, groupBy, values = []) {
  return rawData.reduce((acc, current) => {
    const groupByKey = current[groupBy];

    const existingGroup = acc.find((item) => item.key === groupByKey);

    if (existingGroup) {
      for (const value of values) {
        existingGroup[value] =
          (existingGroup[value] || 0) + (current[value] || 0);
      }
    } else {
      const group = { key: groupByKey };
      for (const value of values) {
        group[value] = current[value] || 0;
      }
      acc.push(group);
    }

    return acc;
  }, []);
}

export function calculateDepoCompleteTime(value) {
  if (
    value.DepoCount == 0 ||
    value.EntryCount == 0 ||
    value.Capicity == 0 ||
    value.Capicity - value.EntryCount == 0
  )
    return 0;
  return value.DepoCount / (value.Capicity - value.EntryCount);
}
export function processDepoCompleteTimeData(
  data,
): { ServiceName: string; DepoCompleteTime: number }[] {
  const groupedData = data.reduce((acc, current) => {
    const serviceName = current.ServiceName;
    const depoCompleteTime = calculateDepoCompleteTime(current);

    if (!isNaN(depoCompleteTime)) {
      // Check if the service name already exists, if not create a new entry
      const existingService = acc.find(
        (item) => item.ServiceName === serviceName,
      );

      if (existingService) {
        // Update the total DepoCompleteTime for the existing service name
        existingService.TotalDepoCompleteTime += depoCompleteTime;
        existingService.Count++;
      } else {
        // Create a new entry for the service name
        acc.push({
          ServiceName: serviceName,
          TotalDepoCompleteTime: depoCompleteTime,
          Count: 1,
        });
      }
    }

    return acc;
  }, []);

  return groupedData.map((a) => {
    const depoT = Math.round(a.TotalDepoCompleteTime / a.Count);
    return {
      ServiceName: a.ServiceName,
      DepoCompleteTime: Math.abs(depoT),
    };
  });
}

export function getServiceNameColor(key) {
  return ServiceName_Color[key];
}

const ServiceName_Color = {
  "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)": "rose",
  بیمارستانی: "amber",
  "ثبت ارزیابی با اسکن مدارک": "indigo",
  دارو: "violet",
  پاراکلینیک: "slate",
  "ثبت ارزیابی بدون اسکن مدارک": "cyan",
};
