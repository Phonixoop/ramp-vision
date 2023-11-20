import { createHash } from "crypto";
import moment from "jalali-moment";
import { Permission } from "~/types";

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

export function countColumnValues(data, column, values) {
  const countMap = {};

  data.forEach((item) => {
    const value = item[column];

    if (values.includes(value)) {
      if (countMap[value]) {
        countMap[value]++;
      } else {
        countMap[value] = 1;
      }
    }
  });

  const result = Object.keys(countMap).map((key) => ({
    name: key,
    count: countMap[key],
  }));

  return result;
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
    .month(month - 1)
    .jDay(1);

  // Calculate the date for the Saturday in the 4th week
  const fourthWeek = currentDate
    .clone()
    .add(3, "weeks") // Add 3 weeks to get to the 4th week
    .day(6); // Set the day to Saturday (0 is Sunday, 6 is Saturday)

  return fourthWeek.format("YYYY/MM/DD");
}

export function getSecondOrLaterDayOfNextMonth(year: number, month: number) {
  const currentDate = moment().locale("fa").year(year).month(month).jDay(2);

  const currentDay = moment().format("dddd");

  // Check if the current day is Friday
  if (currentDay === "Friday") {
    return moment()
      .locale("fa")
      .year(year)
      .month(month)
      .jDay(3)
      .format("YYYY/MM/03");
  } else {
    return currentDate.format("YYYY/MM/02");
  }
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

export function convertNumberToBetterFormat(number, tag) {
  // Define a dictionary to map tags to units and their conversion factor
  const unitMap = {
    ماه: { unit: "days", conversionFactor: 30 }, // Assuming 30 days in a month
    هفته: { unit: "days", conversionFactor: 7 }, // 7 days in a week
    روز: { unit: "hours", conversionFactor: 24 }, // 24 hours in a day
  };

  // Check if the tag is in the unitMap
  if (unitMap[tag]) {
    const { unit, conversionFactor } = unitMap[tag];

    if (unit === "hours") {
      // Convert to hours
      return `${(number * conversionFactor).toFixed(3)} ${unit}`;
    } else if (unit === "days") {
      // Convert to days and hours
      const days = Math.floor(number * conversionFactor);
      const hours = number * conversionFactor - days * 24;
      if (days === 0) {
        return `${hours.toFixed(3)} ${unit}`;
      } else if (hours === 0) {
        return `${days} ${unit}`;
      } else {
        return `${days} days and ${hours.toFixed(3)} hours`;
      }
    }
  }

  // If the tag is not recognized, return an error message
  return tag;
}

function convertToSeconds(value, tag) {
  // Define constants for conversions
  const SECONDS_PER_MINUTE = 60;
  const MINUTES_PER_HOUR = 60;
  const HOURS_PER_DAY = 24;
  const DAYS_PER_WEEK = 7;
  const DAYS_PER_MONTH = 30.44; // Approximate number of days in a month

  // Convert the value to seconds based on the tag
  if (tag === "ماه") {
    return (
      value *
      DAYS_PER_MONTH *
      HOURS_PER_DAY *
      MINUTES_PER_HOUR *
      SECONDS_PER_MINUTE
    );
  } else if (tag === "هفته") {
    return (
      value *
      DAYS_PER_WEEK *
      HOURS_PER_DAY *
      MINUTES_PER_HOUR *
      SECONDS_PER_MINUTE
    );
  } else if (tag === "روز") {
    return value * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
  } else {
    throw new Error("Invalid tag. Use 'months', 'weeks', or 'days'.");
  }
}

export function humanizeDuration(value, tag) {
  const seconds = convertToSeconds(value, tag);
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }

  const secondsPerMinute = 60;
  const secondsPerHour = 3600;
  const secondsPerDay = 86400;
  const secondsPerWeek = 604800;
  const secondsPerMonth = 2628000; // An approximate value for a month (30.44 days)
  const secondsPerYear = 31536000; // An approximate value for a year (365 days)

  const years = Math.floor(seconds / secondsPerYear);
  const months = Math.floor((seconds % secondsPerYear) / secondsPerMonth);
  const weeks = Math.floor((seconds % secondsPerMonth) / secondsPerWeek);
  const days = Math.floor((seconds % secondsPerWeek) / secondsPerDay);
  const hours = Math.floor((seconds % secondsPerDay) / secondsPerHour);
  const minutes = Math.floor((seconds % secondsPerHour) / secondsPerMinute);
  const remainingSeconds = seconds % secondsPerMinute;

  const timeComponents = [];

  if (years > 0) timeComponents.push(`${years} سال`);
  if (months > 0) timeComponents.push(`${months} ماه`);
  if (weeks > 0) timeComponents.push(`${weeks} هفته`);
  if (days > 0) timeComponents.push(`${days} روز`);
  if (hours > 0) timeComponents.push(`${hours} ساعت`);
  if (minutes > 0 && hours <= 0) timeComponents.push(`${minutes} دقیقه`);
  // if (remainingSeconds > 0)
  //   timeComponents.push(`${remainingSeconds.toFixed(0)} ثانیه`);

  return timeComponents.join(" ، ");
}

const performance_ranges = [
  { min: 0, max: 80, result: "ضعیف" },
  { min: 81, max: 100, result: "متوسط" },
  { min: 101, max: 150, result: "خوب" },
  { min: 151, max: 200, result: "عالی" },
];

export function getPerformanceText(value: number) {
  if (!value && value != 0) return "";
  let result = "نیاز به برسی"; // Default result

  performance_ranges.forEach((range) => {
    if (value >= range.min && value <= range.max) {
      result = range.result;
    }
  });

  return result;
}

export function updateDynamicPermissions(
  staticPermissions: Permission[],
  dynamicPermissions: Permission[],
): Permission[] {
  // Create a map to store the dynamic permissions by ID for faster lookup
  const dynamicPermissionMap = new Map(
    dynamicPermissions.map((permission) => [permission.id, permission]),
  );

  // Create a result array to store the updated dynamic permissions
  const updatedDynamicPermissions: Permission[] = [];

  // Iterate through the static permissions list to preserve the order
  for (const staticPermission of staticPermissions) {
    if (dynamicPermissionMap.has(staticPermission.id)) {
      // If the permission exists in dynamic, use it
      updatedDynamicPermissions.push(
        dynamicPermissionMap.get(staticPermission.id),
      );
    } else {
      // If the permission doesn't exist in dynamic, use the static one
      updatedDynamicPermissions.push(staticPermission);
    }
  }

  return updatedDynamicPermissions;
}

export function DistinctData(data = []) {
  const result = Object.values(
    data.reduce((acc, item) => {
      const key = item.NameFamily;
      if (!acc[key]) {
        acc[key] = {
          count: 1,
          TotalPerformance: item.TotalPerformance,
          Start_Date: item.Start_Date,
          ...item,
        };
      } else {
        acc[key].count++;
        acc[key].TotalPerformance += item.TotalPerformance;
        if (acc[key].Start_Date !== item.Start_Date)
          acc[key].Start_Date += "," + item.Start_Date;
        for (const prop in item) {
          if (typeof item[prop] === "number" && prop !== "TotalPerformance") {
            acc[key][prop] = (acc[key][prop] || 0) + item[prop];
          }
        }
      }
      return acc;
    }, {}),
  );

  result.forEach((item) => {
    //@ts-ignore
    item.TotalPerformance = item.TotalPerformance / item.count;
  });

  return result;
}

export function calculateAggregateByFields(data = [], operations) {
  const aggregatedData = {};

  data.forEach((item) => {
    const key = item.CityName;
    if (!aggregatedData[key]) {
      aggregatedData[key] = { CityName: key };
      operations.forEach((operation) => {
        if (operation.operation === "sum") {
          aggregatedData[key][operation.fieldName] = 0;
        } else if (operation.operation === "array") {
          aggregatedData[key][operation.fieldName] = [];
        } else if (operation.operation === "average") {
          aggregatedData[key][operation.fieldName + "Sum"] = 0;
          aggregatedData[key][operation.fieldName + "Count"] = 0;
        }
      });
    }
    operations.forEach((operation) => {
      const fieldValue = item[operation.fieldName];
      if (operation.operation === "sum") {
        aggregatedData[key][operation.fieldName] += fieldValue;
      } else if (operation.operation === "array") {
        if (!aggregatedData[key][operation.fieldName].includes(fieldValue)) {
          aggregatedData[key][operation.fieldName].push(fieldValue);
        }
      } else if (operation.operation === "average") {
        aggregatedData[key][operation.fieldName + "Sum"] += fieldValue;
        aggregatedData[key][operation.fieldName + "Count"]++;
      }
    });
  });

  Object.keys(aggregatedData).forEach((key) => {
    operations.forEach((operation) => {
      if (operation.operation === "average") {
        const sumField = operation.fieldName + "Sum";
        const countField = operation.fieldName + "Count";
        aggregatedData[key][operation.fieldName] =
          aggregatedData[key][sumField] / aggregatedData[key][countField];
        delete aggregatedData[key][sumField];
        delete aggregatedData[key][countField];
      }
    });
  });

  const result = Object.values(aggregatedData);

  return result;
}
