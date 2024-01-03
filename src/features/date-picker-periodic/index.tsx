import moment from "jalali-moment";
import React from "react";

// Date component imports
import DatePicker, { DateObject } from "react-multi-date-picker";
import "react-multi-date-picker/styles/layouts/mobile.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";

import Button from "~/ui/buttons";
import { LayoutGroup } from "framer-motion";
import { InPageMenu } from "~/features/menu";
import { Reports_Period } from "~/constants";

export default function DatePickerPeriodic({
  filter,
  reportPeriod,
  onChange = (date: DateObject | DateObject[] | null) => {},
  setReportPeriod = (period) => {},
}) {
  return (
    <>
      <DatePicker
        portal
        className="rmdp-mobile "
        containerClassName="w-full"
        //@ts-ignore
        render={(value, openCalendar) => {
          const seperator = filter.periodType == "روزانه" ? " , " : " ~ ";
          return (
            <div className="flex w-full  flex-col items-center justify-center gap-2">
              <Button
                onClick={() => openCalendar()}
                className="w-full min-w-full rounded-lg border border-dashed border-accent bg-primary p-2 text-center text-secondary"
              >
                {reportPeriod === "ماهانه"
                  ? moment(filter.filter.Start_Date[0], "jYYYY,jMM,jDD")
                      .locale("fa")
                      .format("MMMM")
                  : filter.filter.Start_Date.join(seperator)}
              </Button>
            </div>
          );
        }}
        inputClass="text-center"
        multiple={reportPeriod !== "ماهانه"}
        value={filter.filter.Start_Date}
        calendar={persian}
        locale={persian_fa}
        weekPicker={reportPeriod === "هفتگی"}
        onlyMonthPicker={reportPeriod === "ماهانه"}
        plugins={[<DatePanel key={"00DatePanel"} />]}
        onChange={(date: DateObject | DateObject[] | null) => {
          onChange(date);
        }}
      >
        <LayoutGroup id="DateMenu">
          <div dir={"rtl"} className="mx-0  w-fit rounded-lg bg-secondary p-2">
            <InPageMenu
              list={Object.keys(Reports_Period)}
              startIndex={
                reportPeriod === "روزانه" ? 0 : reportPeriod === "هفتگی" ? 1 : 2
              }
              onChange={(value) => {
                // openCalendar();
                setReportPeriod(value.item.name);
              }}
            />
          </div>
        </LayoutGroup>
      </DatePicker>
    </>
  );
}
