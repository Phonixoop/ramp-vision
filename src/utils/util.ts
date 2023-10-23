import { createHash } from "crypto";
import moment from "jalali-moment";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}
//
export function compareHashPassword(password: string, hashedPassword: string) {
  if (hashPassword(password) === hashedPassword) {
    return { success: true, message: "Password matched" };
  }
}

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
  if (value.DepoCount == 0) return 0;
  if (value.Capicity - value.EntryCount == 0) return value.DepoCount;
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

export function sumColumnBasedOnRowValue(
  table,
  valueColumn,
  targetColumn,
  targetValues,
) {
  let totalSum = 0;

  for (let i = 0; i < table.length; i++) {
    const row = table[i];
    const targetValue = row[targetColumn];
    const value = row[valueColumn];

    if (targetValues.includes(targetValue)) {
      totalSum += value;
    }
  }

  return totalSum;
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

export function getDatesForLastMonth(): string[] {
  const currentDate = moment().locale("fa").subtract(1, "months"); // Get the current date
  const daysInMonth = currentDate.daysInMonth(); // Get the number of days in the current month
  const datesArray = [];

  // Iterate through each day of the month and store the dates in the array
  for (let i = 1; i <= daysInMonth; i++) {
    const date = moment(currentDate).locale("fa").date(i);
    datesArray.push(date.format("YYYY/MM/DD"));
  }

  return datesArray;
}

export function extractYearAndMonth(dateString) {
  const [year, month] = dateString.split("/").slice(0, 2);
  return `${year}/${month}`;
}

export function getFirstSaturdayOfLastWeekOfMonth(year: number, month: number) {
  // Get the first day of the month in the Jalali calendar
  // Get the current date
  const currentDate = moment()
    .locale("fa")
    .year(year)
    .month(month - 2)
    .jDay(1);

  // Calculate the date for the Saturday in the 4th week
  const fourthWeek = currentDate
    .clone()
    .add(3, "weeks") // Add 3 weeks to get to the 4th week
    .day(6); // Set the day to Saturday (0 is Sunday, 6 is Saturday)

  return fourthWeek.format("YYYY/MM/DD");
}

export function getWeekOfMonth(date: string) {
  const currentDate = moment(date);

  const [jalaliYear, jalaliMonth] = currentDate
    .format("YYYY/MM")
    .split("/")
    .map(Number);

  // Get the first day of the month and check if it's Saturday (6) or not
  const firstDayOfMonth = moment([jalaliYear, jalaliMonth - 1, 1]);
  const isFirstDaySaturday = firstDayOfMonth.day() === 4;

  let totalDays = currentDate.date();

  // If the first day is not Saturday, subtract 1 from the week number
  if (!isFirstDaySaturday) {
    totalDays--;
  }

  const fullWeeks = Math.floor(totalDays / 7);
  const semiWeek = totalDays % 7 === 0 ? 0 : 1;

  return weekNumberText[fullWeeks + semiWeek]
    ? weekNumberText[fullWeeks + semiWeek]
    : "";
}

const weekNumberText = {
  1: "اول",
  2: "دوم",
  3: "سوم",
  4: "چهارم",
};

export function commify(num) {
  var str = num.toString().split(".");
  if (str[0].length >= 4) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,");
  }
  if (str[1] && str[1].length >= 4) {
    str[1] = str[1].replace(/(\d{3})/g, "$1 ");
  }
  return str.join(".");
}
