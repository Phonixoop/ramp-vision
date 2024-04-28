import moment, { Moment } from "jalali-moment";
import { MegaphoneIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { InPageMenu } from "~/features/menu";
import { LayoutGroup } from "framer-motion";

function getMonthDays(m: Moment): Moment[] {
  let calendarTemp = [];

  const startDay = m.clone().startOf("month").startOf("week");
  const endDay = m.clone().endOf("month").endOf("week");

  let date = startDay.clone().subtract(1, "day");
  while (date.isBefore(endDay, "day"))
    calendarTemp.push({
      days: Array(7)
        .fill(0)
        .fill(0)
        .fill(0)
        .fill(0)
        .fill(0)
        .fill(0)
        .fill(0)
        .map(() => date.add(1, "day").clone()),
    });
  const calendar: Moment[] = calendarTemp.map((a) => a.days).flat(1);
  return calendar;
}

const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
// const defaultWeekdays = Array.apply(null, Array(7)).map(function (_, i) {
//   return moment(i, "e")
//     .locale("fa")
//     .startOf("week")
//     .isoWeekday(i - 1)
//     .format("dd");
// });
const defaultWeekdays = ["شن", "یک", "دو", "سه", "چهار", "پنج", "جم"];
type Props = {
  onDate?: (
    date: Moment,
    monthNumber: number,
  ) => React.ReactNode | string | undefined;
  onMonthChange?: (startDate: Moment, endDate: Moment) => unknown;
  onClick?: (date: Moment) => unknown;
  withMonthMenu?: boolean;
  showCurrentDay?: boolean;
  defaultMonth?: number;
  year?: number;
  customData?: any[];
};

export default function Calender({
  onDate,
  onMonthChange,
  onClick = () => {},
  withMonthMenu = false,
  showCurrentDay = false,
  year = undefined,
  defaultMonth = -1,
  customData = undefined,
}: Props) {
  const [calendar, setCalender] = useState(
    getMonthDays(
      defaultMonth >= 0
        ? moment().locale("fa").jYear(year).jMonth(defaultMonth)
        : moment().locale("fa").jYear(year),
    ),
  );

  return (
    <div className="grid w-full  gap-10 p-2 ">
      {withMonthMenu && (
        <LayoutGroup id="months-InPageMenu">
          <InPageMenu
            className="mx-auto rounded-xl bg-secbuttn px-5 pb-1 pt-2"
            startIndex={moment().locale("fa").month()}
            list={MONTHS}
            onChange={(value: { item: any; index: number }) => {
              const newCalendar = getMonthDays(
                moment().locale("fa").jYear(year).jMonth(defaultMonth),
              );
              setCalender(newCalendar);
              // onMonthChange(
              //   newCalendar.at(0),
              //   newCalendar.at(newCalendar.length - 1),
              // );
            }}
          />
        </LayoutGroup>
      )}

      <div className="grid grid-cols-7 gap-3 text-center text-xs text-primary md:text-base">
        {defaultWeekdays.map((week) => {
          return (
            <>
              <span className="w-full ">{week}</span>
            </>
          );
        })}
      </div>
      <div className="grid  grid-cols-7 gap-2">
        {calendar.map((item: Moment, i) => {
          const isItemToday =
            moment().locale("fa").format("D MMMM yyyy") ===
            item.locale("fa").format("D MMMM yyyy");
          return (
            <>
              {/* <button
                onClick={() => onClick(item)}
                key={i}
                disabled={item
                  .clone()
                  .isBefore(moment().locale("fa").subtract(1, "day"))}
                className={twMerge(
                  "text-centerd group relative flex w-full cursor-pointer items-center justify-center",
                )}
              >
                {showCurrentDay && isItemToday && (
                  <span className="absolute flex  h-3 w-3 md:right-2 ">
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-accent/30"></span>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/75  "></span>
                  </span>
                )}
              
              </button> */}
              {onDate(item, calendar[16].jMonth())}
            </>
          );
        })}
      </div>
    </div>
  );
}
