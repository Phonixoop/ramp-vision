import moment from "jalali-moment";

export function calculateDepoCompleteTime(value) {
  if (value.DepoCount == 0) return 0;
  if (value.Capicity - value.EntryCount == 0) return value.DepoCount;
  return value.DepoCount / (value.Capicity - value.EntryCount);
}

export function extractYearAndMonth(dateString) {
  const [year, month] = dateString.split("/").slice(0, 2);
  return `${year}/${month}`;
}

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

export function getDatesBetweenTwoDates(startDate, endDate) {
  let dates = [];
  let currentDate = moment(startDate, "jYYYY/jMM/jDD");
  const stopDate = moment(endDate, "jYYYY/jMM/jDD");

  while (currentDate <= stopDate) {
    dates.push(currentDate.format("jYYYY/jMM/jDD"));
    currentDate.add(1, "days");
  }

  return dates;
}
export function getMonthName(date: string) {
  if (!date) return date;
  return moment()
    .locale("fa")
    .month(parseInt(date.split("/")[1]) - 1)
    .format("MMMM");
}

export function getMonthNumber(date: string) {
  return moment()
    .locale("fa")
    .month(parseInt(date.split("/")[1]) - 1)
    .month();
}
