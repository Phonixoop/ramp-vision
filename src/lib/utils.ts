import { ClassValue, clsx } from "clsx";
import moment from "jalali-moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uniqueArray<T>(array): T[] {
  return Array.from(new Set(array));
}

export function sortDates({
  dates,
  format = "YYYY/MM/DD",
}: {
  dates: string[] | unknown[];
  format?: string;
}): string[] {
  // Convert strings to Moment.js objects
  const momentObjects: moment.Moment[] = dates.map((date) =>
    moment(date, format),
  );

  // Sort Moment.js objects
  momentObjects.sort((a, b) => a.diff(b));

  // If you want the sorted dates back in string format
  const sortedDates: string[] = momentObjects.map((momentObject) =>
    momentObject.format(format),
  );

  return sortedDates;
}
