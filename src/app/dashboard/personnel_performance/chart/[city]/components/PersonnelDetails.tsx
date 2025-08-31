import React from "react";
import dynamic from "next/dynamic";
import { ResponsiveContainer } from "recharts";
import { cn } from "~/lib/utils";
import moment from "jalali-moment";
import PerformanceBadgesLazy from "~/components/main/performance-badges";
import {
  PersonnelPerformanceIcons,
  PersonnelPerformanceTranslate,
} from "~/constants/personnel-performance";
import { CitiesWithDatesPerformanceBarChart } from "~/features/cities-performance-chart/cities-with-dates-performance-bar-chart";
import ToolTipSimple from "~/features/tooltip-simple-use";
import { ButtonWithModal } from "~/ui/button-with-modal";
import H2 from "~/ui/heading/h2";
import Button from "~/ui/buttons";
import { commify } from "~/utils/util";
import { uniqueArray } from "~/lib/utils";
import {
  getMonthNamesFromJOINED_date_strings,
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
} from "~/utils/personnel-performance";
import { getMonthNumber } from "~/utils/date-utils";

const Calendar = dynamic(() => import("~/features/calendar"), { ssr: false });
const Gauge = dynamic(() => import("~/features/gauge"), { ssr: false });

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

interface PersonnelDetailsProps {
  selectedPerson: PersonRecord | null;
  currentCity: string;
  filters: any;
  getAll: any;
  setSelectedPerson: (person: PersonRecord | null) => void;
}

export const PersonnelDetails = React.memo<PersonnelDetailsProps>(
  ({ selectedPerson, currentCity, filters, getAll, setSelectedPerson }) => {
    const translateKeys = React.useMemo(
      () => Object.keys(PersonnelPerformanceTranslate),
      [],
    );

    const numericItems = React.useMemo(() => {
      if (!selectedPerson) return [] as [string, number][];
      const pairs = Object.entries(selectedPerson).filter(
        ([_, v]) => typeof v === "number",
      ) as [string, number][];
      return [...pairs].sort(
        (a, b) => translateKeys.indexOf(a[0]) - translateKeys.indexOf(b[0]),
      );
    }, [selectedPerson, translateKeys]);

    const nonNumericItems = React.useMemo(() => {
      if (!selectedPerson) return [] as [string, string][];
      return Object.entries(selectedPerson).filter(
        ([_, v]) => typeof v === "string",
      ) as [string, string][];
    }, [selectedPerson]);

    if (!selectedPerson) {
      return null;
    }

    return (
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="flex w-full flex-col items-start justify-center gap-5 xl:flex-row">
          {/* Metrics grid */}
          <div
            className="grid grid-cols-1 divide-x-[1px] divide-y-[1px] divide-dashed divide-primbuttn rounded-xl bg-secondary p-2 lg:grid-cols-2"
            dir="rtl"
          >
            {numericItems.map(([key, value], index) => {
              if (!PersonnelPerformanceIcons[key]) return null;
              const isLastItem = index === numericItems.length - 1;
              const isZero = (value as number) <= 0;
              return (
                <React.Fragment key={key}>
                  <div
                    className={cn(
                      "group flex flex-col justify-center gap-2 p-2 last:bg-primary/80 hover:opacity-100 md:col-span-1",
                      isZero ? "opacity-50" : "bg-secbuttn",
                    )}
                  >
                    <div className="flex h-full w-full items-center justify-between gap-4 rounded-xl p-2">
                      <span
                        className={cn(
                          !isZero
                            ? "animate-path animate-[move_200s_linear_infinite]"
                            : "",
                        )}
                      >
                        {PersonnelPerformanceIcons[key]}
                      </span>
                      <span
                        className={cn(
                          "text-primary group-last:text-secondary",
                          !isZero ? "font-bold" : "text-sm",
                        )}
                      >
                        {PersonnelPerformanceTranslate[key]}
                      </span>
                      <span
                        className={cn(
                          "text-primary group-last:text-secondary",
                          !isZero ? "font-bold" : "text-sm",
                        )}
                      >
                        {commify(
                          Number.isInteger(value)
                            ? value
                            : ((value as number).toFixed(2) as any),
                        )}
                      </span>
                    </div>
                  </div>
                  {numericItems.length % 2 !== 0 && isLastItem && (
                    <div className="cross_hatch_pattern hidden w-full max-w-sm rounded-xl sm:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Details & Roles */}
          <div className="grid gap-4" dir="rtl">
            {nonNumericItems.map(([key, value], index) => {
              if (!value || key === "Id") return null;
              const isLastItem = index === nonNumericItems.length - 1;
              let displayValue: string = value as string;
              if (key === "Start_Date") {
                displayValue = getMonthNamesFromJOINED_date_strings(
                  value as string,
                  getAll?.data?.periodType,
                );
              }
              return (
                <ToolTipSimple
                  key={key}
                  className="cursor-auto bg-secondary"
                  tooltip={
                    <span className="text-base text-primary">
                      {PersonnelPerformanceTranslate[key] ?? key}
                    </span>
                  }
                >
                  <div
                    className={cn(
                      "flex min-w-[150px] cursor-auto items-center justify-center gap-2 rounded-2xl bg-secondary p-2",
                      isLastItem || index === 0
                        ? "md:col-span-2"
                        : "col-span-1",
                    )}
                  >
                    <span className="max-w-[250px] select-text break-words text-center font-bold text-accent">
                      {displayValue}
                    </span>
                  </div>
                </ToolTipSimple>
              );
            })}

            <RolesByBranchModal selectedPerson={selectedPerson} />

            {/* Calendar */}
            <div className="relative col-span-2 w-full overflow-hidden rounded-xl bg-accent/10 p-1">
              {(selectedPerson as any)?.sparkData?.length > 0 ? (
                <Calendar
                  withMonthMenu
                  collapsedUi
                  listOfDates={uniqueArray(
                    (selectedPerson as any).sparkData.map((a: any) =>
                      moment(a.Start_Date, "jYYYY/jMM/jDD")
                        .format("jYYYY/jMM")
                        .slice(0, 7),
                    ),
                  ).map((a) => moment(a, "jYYYY/jMM "))}
                  year={Number.parseInt(
                    (selectedPerson as any).sparkData[0].Start_Date.split(
                      "/",
                    )[0],
                  )}
                  defaultMonth={getMonthNumber(
                    (selectedPerson as any).sparkData[0].Start_Date,
                  )}
                  onDate={(date, monthNumber) => {
                    const userCalData = (selectedPerson as any).sparkData.find(
                      (d: any) => d.Start_Date === date.format("YYYY/MM/DD"),
                    );
                    const userMetric = getPerformanceMetric(
                      userCalData?.TotalPerformance,
                    );
                    const hasTheDayOff = getAll.data?.result?.find(
                      (a: any) =>
                        a.Start_Date === date.format("YYYY/MM/DD") &&
                        a.NationalCode ===
                          (selectedPerson as any).key.NationalCode,
                    )?.HasTheDayOff;

                    return Number.parseInt(date.format("M")) !==
                      monthNumber + 1 ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-primary/50"
                          style={{
                            backgroundColor: userCalData
                              ? userMetric.color
                              : undefined,
                          }}
                        >
                          {date.format("D")}
                        </span>
                      </div>
                    ) : (
                      <ToolTipSimple
                        className={cn(
                          "cursor-default bg-secondary",
                          !hasTheDayOff &&
                            !userCalData?.TotalPerformance &&
                            "hidden",
                        )}
                        tooltip={
                          <span
                            style={{
                              color: userCalData ? userMetric.color : undefined,
                            }}
                            className="text-base text-primary"
                          >
                            {hasTheDayOff
                              ? "مرخصی"
                              : userCalData?.TotalPerformance?.toFixed(2)}
                          </span>
                        }
                      >
                        <div
                          className={cn(
                            "flex w-max cursor-default items-center justify-center rounded-lg p-2",
                            hasTheDayOff === true
                              ? "bg-primary text-secondary"
                              : "bg-primary-muted/10 text-primary-muted",
                          )}
                          style={{
                            backgroundColor: userCalData
                              ? userMetric.color
                              : undefined,
                          }}
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-black">
                            {date.format("D")}
                          </span>
                        </div>
                      </ToolTipSimple>
                    );
                  }}
                />
              ) : (
                <div className="w-full text-center text-accent">بدون داده</div>
              )}
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div className="flex w-full flex-col items-center justify-center">
          <PerformanceBadgesLazy />
          <div className="flex flex-col items-center justify-center lg:flex-row">
            <div className="col-span-2 flex w-full flex-col items-center justify-center">
              <H2>عملکرد کلی</H2>
              <Gauge value={(selectedPerson as any)?.TotalPerformance} />
              <p className="text-accent">
                {/* Performance text will be handled by the gauge component */}
              </p>
            </div>
            <div className="col-span-2 flex w-full flex-col items-center justify-center">
              <H2>عملکرد مستقیم</H2>
              <Gauge value={(selectedPerson as any)?.DirectPerFormance} />
              <p className="text-accent">
                {/* Performance text will be handled by the gauge component */}
              </p>
            </div>
            <div className="col-span-2 flex w-full flex-col items-center justify-center">
              <H2>عملکرد غیر مستقیم</H2>
              <Gauge value={(selectedPerson as any)?.InDirectPerFormance} />
              <p className="text-accent">
                {/* Performance text will be handled by the gauge component */}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PersonnelDetails.displayName = "PersonnelDetails";

// Roles modal component
function RolesByBranchModal({
  selectedPerson,
}: {
  selectedPerson: PersonRecord;
}) {
  const grouped = React.useMemo(() => {
    if (!selectedPerson?.sparkData)
      return [] as {
        key: string;
        branch: string;
        role: string;
        startDates: string[];
      }[];
    const map = new Map<
      string,
      { branch: string; role: string; startDates: string[] }
    >();
    for (const day of selectedPerson.sparkData) {
      const k = `${day.BranchName}-${day.Role}`;
      if (!map.has(k))
        map.set(k, { branch: day.BranchName, role: day.Role, startDates: [] });
      map.get(k)!.startDates.push(day.Start_Date);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, ...v }));
  }, [selectedPerson?.sparkData]);

  return (
    <ButtonWithModal
      buttonProps={{ className: "w-full rounded-xl bg-primary text-secondary" }}
      buttonChildren={<span className="text-contrast">واحد پذیرش</span>}
      modalProps={{
        title: `نقش های ${selectedPerson?.NameFamily ?? ""}`,
        size: "sm",
        center: true,
        className: "bg-secondary",
      }}
    >
      {() => (
        <div className="flex flex-col gap-2 p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/20">
                <th className="p-2 text-right text-primary">شعبه</th>
                <th className="p-2 text-right text-primary">نقش</th>
                <th className="p-2 text-right text-primary">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => (
                <tr key={row.key} className="border-b border-accent/10">
                  <td className="p-2 text-accent">{row.branch || "نامشخص"}</td>
                  <td className="p-2 text-accent">{row.role || "نامشخص"}</td>
                  <td className="p-2 text-accent">
                    {row.startDates.length > 1 ? (
                      <ButtonWithModal
                        buttonProps={{
                          className:
                            "text-accent hover:text-primary bg-accent/10",
                        }}
                        buttonChildren={
                          <span className="text-contrast">تاریخ ها</span>
                        }
                        modalProps={{
                          title: "تاریخ",
                          size: "sm",
                          center: true,
                          className: "bg-secondary",
                        }}
                      >
                        {() => (
                          <div className="flex flex-col gap-2 p-4">
                            {row.startDates.slice(1).map((date, i) => (
                              <div key={i} className="text-accent">
                                {date}
                              </div>
                            ))}
                          </div>
                        )}
                      </ButtonWithModal>
                    ) : row.startDates.length > 0 ? (
                      row.startDates[0]
                    ) : (
                      "نامشخص"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ButtonWithModal>
  );
}
