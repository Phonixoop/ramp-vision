import { createHash } from "crypto";
import moment from "jalali-moment";
import { CITIES } from "~/constants";
import { Performance_Levels_Gauge } from "~/constants/personnel-performance";
import { Permission } from "~/types";
import { calculateDepoCompleteTime } from "~/utils/date-utils";
import { calculatePerformance } from "~/utils/personnel-performance";

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

export function en(inputString: string): string {
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

// export function processDataForChart(rawData, groupBy, values = []) {
//   return rawData.reduce((acc, current) => {
//     const groupByKey = current[groupBy];

//     const existingGroup = acc.find((item) => item.key === groupByKey);

//     if (existingGroup) {
//       for (const value of values) {
//         existingGroup[value] =
//           (existingGroup[value] || 0) + (current[value] || 0);
//       }
//     } else {
//       const group = { key: groupByKey };
//       for (const value of values) {
//         group[value] = current[value] || 0;
//       }
//       acc.push(group);
//     }

//     return acc;
//   }, []);
// }

// export function processDataForChart(rawData, groupBy, values = [], where = {}) {
//   return rawData.reduce((acc, current) => {
//     const groupByKeys = Array.isArray(groupBy) ? groupBy : [groupBy];

//     // Check if the current item meets the 'where' conditions
//     const meetsConditions = Object.entries(where).every(
//       ([conditionKey, conditionValues]) => {
//         if (Array.isArray(conditionValues)) {
//           return conditionValues.includes(current[conditionKey]);
//         }
//         return current[conditionKey] === conditionValues;
//       },
//     );

//     if (!meetsConditions) {
//       return acc; // Skip current item if it doesn't meet conditions
//     }

//     const groupByKey = groupByKeys.map((key) => current[key]);

//     const existingGroupIndex = acc.findIndex((item) =>
//       groupByKeys.every((key, index) => item.key[key] === groupByKey[index]),
//     );

//     if (existingGroupIndex !== -1) {
//       for (const value of values) {
//         acc[existingGroupIndex][value] =
//           (acc[existingGroupIndex][value] || 0) + (current[value] || 0);
//       }
//     } else {
//       const group = { key: {} };
//       groupByKeys.forEach((key, index) => {
//         group.key[key] = groupByKey[index];
//       });
//       for (const value of values) {
//         group[value] = current[value] || 0;
//       }
//       acc.push(group);
//     }

//     return acc;
//   }, []);
// }

// export function processDataForChart(rawData, groupBy, values = [], where = {}) {
//   return rawData.reduce((acc, current) => {
//     const groupByKeys = Array.isArray(groupBy) ? groupBy : [groupBy];

//     // Check if the current item meets the 'where' conditions
//     const meetsConditions = Object.entries(where).every(
//       ([conditionKey, conditionValues]) => {
//         if (Array.isArray(conditionValues)) {
//           return conditionValues.includes(current[conditionKey]);
//         }
//         return current[conditionKey] === conditionValues;
//       },
//     );

//     if (!meetsConditions) {
//       return acc; // Skip current item if it doesn't meet conditions
//     }

//     const groupByKey = groupByKeys.map((key) => current[key]);

//     const existingGroupIndex = acc.findIndex((item) =>
//       groupByKeys.every((key, index) => item.key[key] === groupByKey[index]),
//     );

//     if (existingGroupIndex !== -1) {
//       for (const value of values) {
//         // my code
//         if (typeof acc[existingGroupIndex][value] === "string") {
//           if (acc[existingGroupIndex][value] === current[value]) continue;

//           acc[existingGroupIndex][value] += ","; // my code
//         }

//         acc[existingGroupIndex][value] += current[value] || 0;
//       }
//     } else {
//       const group = { key: {} };
//       groupByKeys.forEach((key, index) => {
//         group.key[key] = groupByKey[index];
//       });
//       for (const value of values) {
//         group[value] = current[value] || 0;
//       }
//       acc.push(group);
//     }

//     return acc;
//   }, []);
// }

type ProcessDataForChartOptions = {
  rawData: any[];
  groupBy: string | string[];
  values: string[];
  where?: Record<string, string | string[]>;
  options?: { max?: string[]; uniqueCountFields?: string[] };
};
export function processDataForChart(input: ProcessDataForChartOptions) {
  const { rawData, groupBy, values, where, options } = input;
  const uniqueCountFields = options?.uniqueCountFields;

  // Debug mode - set to true to enable detailed logging
  const DEBUG = false;
  const debugLog: any[] = [];

  const result = rawData?.reduce((acc, current, index) => {
    const groupByKeys = Array.isArray(groupBy) ? groupBy : [groupBy];

    // Check if the current item meets the 'where' conditions
    const meetsConditions = Object.entries(where ?? {}).every(
      ([conditionKey, conditionValues]) => {
        if (Array.isArray(conditionValues)) {
          return conditionValues.includes(current[conditionKey]);
        }
        return current[conditionKey] === conditionValues;
      },
    );

    if (!meetsConditions) {
      if (DEBUG) {
        debugLog.push({
          index,
          action: "skipped",
          reason: "does not meet where conditions",
          current: {
            ...Object.fromEntries(groupByKeys.map((k) => [k, current[k]])),
            TotalPerformance: current.TotalPerformance,
            HasTheDayOff: current.HasTheDayOff,
            Start_Date: current.Start_Date,
          },
        });
      }
      return acc; // Skip current item if it doesn't meet conditions
    }

    const groupByKey = groupByKeys.map((key) => current[key]);

    const existingGroupIndex = acc.findIndex((item) =>
      groupByKeys.every((key, index) => item.key[key] === groupByKey[index]),
    );

    if (existingGroupIndex !== -1) {
      const oldTotalPerformance = acc[existingGroupIndex].TotalPerformance || 0;
      const currentTotalPerformance = current.TotalPerformance || 0;

      // Track unique values for the specified fields
      if (uniqueCountFields && Array.isArray(uniqueCountFields)) {
        if (!acc[existingGroupIndex]._uniqueValuesSets) {
          acc[existingGroupIndex]._uniqueValuesSets = {};
        }
        uniqueCountFields.forEach((field) => {
          if (current[field] != null) {
            if (!acc[existingGroupIndex]._uniqueValuesSets[field]) {
              acc[existingGroupIndex]._uniqueValuesSets[field] = new Set();
            }
            acc[existingGroupIndex]._uniqueValuesSets[field].add(
              current[field],
            );
          }
        });
      }

      for (const value of values) {
        if (options?.max && options.max.includes(value)) {
          // If it's in the max array, keep the maximum value
          acc[existingGroupIndex][value] = Math.max(
            acc[existingGroupIndex][value] || 0,
            current[value] || 0,
          );
          // Also track the sum/total of this field
          const totalKey = `${value}Total`;
          const currentValue = current[value] || 0;
          acc[existingGroupIndex][totalKey] =
            (acc[existingGroupIndex][totalKey] || 0) + currentValue;
        } else {
          // Otherwise, sum the values
          if (acc[existingGroupIndex][value] === null)
            acc[existingGroupIndex][value] = "";
          // my code
          if (
            typeof acc[existingGroupIndex][value] === "string" &&
            typeof current[value] === "string"
          ) {
            if (acc[existingGroupIndex][value] === current[value]) continue;
            //acc[existingGroupIndex][value] += ","; // my code
          } else if (
            typeof acc[existingGroupIndex][value] === "number" &&
            typeof current[value] === "number"
          ) {
            const oldValue = acc[existingGroupIndex][value] || 0;
            const newValue = (oldValue || 0) + (current[value] || 0);
            acc[existingGroupIndex][value] = newValue;

            if (DEBUG && value === "TotalPerformance") {
              debugLog.push({
                index,
                action: "added to existing group",
                groupKey: groupByKey,
                oldValue: oldTotalPerformance,
                currentValue: currentTotalPerformance,
                newTotal: newValue,
                rowCount: acc[existingGroupIndex].key.rowCount + 1,
                Start_Date: current.Start_Date,
                HasTheDayOff: current.HasTheDayOff,
              });
            }
          }
        }
      }
      acc[existingGroupIndex].key.rowCount++;
    } else {
      const group: any = { key: { rowCount: 1 } };
      groupByKeys.forEach((key, index) => {
        group.key[key] = groupByKey[index];
      });

      // Initialize unique values Sets if uniqueCountFields are specified
      if (uniqueCountFields && Array.isArray(uniqueCountFields)) {
        group._uniqueValuesSets = {};
        uniqueCountFields.forEach((field) => {
          if (current[field] != null) {
            group._uniqueValuesSets[field] = new Set([current[field]]);
          }
        });
      }

      for (const value of values) {
        group[value] = current[value];
        // If this field is in the max array, also initialize the total field
        if (options?.max && options.max.includes(value)) {
          const totalKey = `${value}Total`;
          group[totalKey] = current[value] || 0;
        }
      }
      acc.push(group);

      if (DEBUG && values.includes("TotalPerformance")) {
        debugLog.push({
          index,
          action: "created new group",
          groupKey: groupByKey,
          TotalPerformance: current.TotalPerformance,
          Start_Date: current.Start_Date,
          HasTheDayOff: current.HasTheDayOff,
        });
      }
    }

    return acc;
  }, []);

  // Convert unique values Sets to counts in the keys object
  if (uniqueCountFields && Array.isArray(uniqueCountFields)) {
    result.forEach((item: any) => {
      uniqueCountFields.forEach((field) => {
        const countKey = `unique${field}Count`;
        if (item._uniqueValuesSets && item._uniqueValuesSets[field]) {
          item.key[countKey] = item._uniqueValuesSets[field].size;
        } else {
          // If no Set was created (all values were null), set count to 0
          item.key[countKey] = 0;
        }
      });
      // Remove the temporary Sets object from the result
      if (item._uniqueValuesSets) {
        delete item._uniqueValuesSets;
      }
    });
  }

  if (DEBUG && debugLog.length > 0) {
    console.group("processDataForChart Debug");
    console.log("Input:", {
      groupBy,
      values,
      where,
      recordCount: rawData?.length,
    });
    console.log("Debug Log:", debugLog);
    console.log("Result:", result);
    if (result && result.length > 0 && values.includes("TotalPerformance")) {
      const totals = result.map((r: any) => ({
        key: r.key,
        TotalPerformance: r.TotalPerformance,
        rowCount: r.key.rowCount,
      }));
      console.log("Aggregated Totals:", totals);
      const sum = result.reduce(
        (sum: number, r: any) => sum + (r.TotalPerformance || 0),
        0,
      );
      console.log("Sum of all TotalPerformance:", sum);
    }
    console.groupEnd();
  }

  return result;
}

export function countColumnValues(
  data,
  column,
  values,
  options = { countAll: false, countNone: false },
) {
  const countMap = {};

  data.forEach((item) => {
    const value = item[column];

    // Handle the countNone option
    if (options.countNone) {
      return; // Skip counting
    }

    // Handle the countAll option
    if (options.countAll || values.includes(value)) {
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
    const depoT = Math.round(a.TotalDepoCompleteTime);
    return {
      ServiceName: a.ServiceName,
      DepoCompleteTime: depoT >= 0 ? depoT : 0,
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
  "ثبت ارزیابی دندانپزشکی": "orange",
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

  const timeComponents = [""];

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
  { min: 0, max: 75, result: "ضعیف", enText: "Weak" },
  { min: 76, max: 90, result: "متوسط", enText: "Average" },
  { min: 91, max: 120, result: "خوب", enText: "Good" },
  { min: 121, max: 180, result: "عالی", enText: "Excellent" },
];

export function getPerformanceText(value: number) {
  if (!value && value != 0) return "";
  let result = "نیاز به بررسی"; // Default result

  performance_ranges.forEach((range) => {
    if (value >= range.min && value <= range.max) {
      result = range.result;
    }
  });

  return result;
}

export function getPerformanceTextEn(value: number) {
  if (!value && value != 0) return "";
  let result = "NeedsReview"; // Default result

  performance_ranges.forEach((range) => {
    if (value >= range.min && value <= range.max) {
      result = range.enText;
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
        dynamicPermissionMap.get(staticPermission.id) ?? staticPermission,
      );
    } else {
      // If the permission doesn't exist in dynamic, use the static one
      updatedDynamicPermissions.push(staticPermission);
    }
  }

  return updatedDynamicPermissions;
}

export function DistinctData(data = [], dateLength) {
  const result = Object.values(
    data.reduce((acc, item: any) => {
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
    // console.log({ item }, { CCC: item.count });
    //@ts-ignore
    item.TotalPerformance = item.TotalPerformance / item.count;
  });
  // console.log({ distinctResult: result });

  return result;
}

export function calculateAggregateByFields(data = [], operations) {
  const aggregatedData = {};

  data.forEach((item: any) => {
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

const PersianKeyToEnglishValueMap = {};
const EnglishKeyToPersianValueMap = {};
CITIES.forEach((city) => {
  PersianKeyToEnglishValueMap[city.PersianName] = city.EnglishName;
  EnglishKeyToPersianValueMap[city.EnglishName] = city.PersianName;
});

export function getPersianToEnglishCity(cityName: string) {
  return PersianKeyToEnglishValueMap[cityName] || cityName;
}
export function getEnglishToPersianCity(cityName: string) {
  return EnglishKeyToPersianValueMap[cityName] || cityName;
}

export function analyzePerformanceTrend(
  values: number[],
): "Up" | "Stable" | "Down" {
  let growing = 0;
  let goingDown = 0;
  let stable = 0;

  for (let i = 1; i < values?.length; i++) {
    const current = values[i];
    const previous = values[i - 1];
    if (current && previous && current > previous) {
      growing++;
    } else if (current && previous && current < previous) {
      goingDown++;
    } else {
      stable++;
    }
  }

  if (growing > goingDown && growing > stable) {
    return "Up";
  } else if (goingDown > growing && goingDown > stable) {
    return "Down";
  } else {
    return "Stable";
  }
}

export function dataAsTable(data) {
  const result = {};

  data.forEach((item) => {
    result[item.name] = {
      data: [item.value],
      textColor: item.fill,
      rowClassName: item.rowClassName,
      headClassName: item.headClassName,
    };
  });

  return result;
}

export const isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};

export function arrIncludeExcat(
  row,
  ColumnName,
  selectedDocumentTypeFilters: string[],
) {
  if (selectedDocumentTypeFilters.length <= 0) return true;
  return selectedDocumentTypeFilters.includes(row.original[ColumnName]);
}
