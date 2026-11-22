"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import moment, { type Moment } from "jalali-moment";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "~/components/beui";
import { LinearEmptyState } from "~/components/linear-shell";
import { cn } from "~/lib/utils";
import {
  distinctPersonnelPerformanceData,
  getPerformanceMetric,
  isPersonnelWorkingDay,
} from "~/utils/personnel-performance";
import { useCitySession, type PersonRecord } from "../city-session-context";

const WEEKDAYS = ["شن", "یک", "دو", "سه", "چهار", "پنج", "جم"];

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
] as const;

type DayFilter = "all" | "direct" | "indirect" | "leave";

type DayMeta = {
  dateString: string;
  total?: number;
  direct?: number;
  indirect?: number;
  hasLeave: boolean;
  color?: string;
};

function getMonthDays(anchor: Moment): Moment[] {
  const startDay = anchor.clone().startOf("jMonth").startOf("week");
  const endDay = anchor.clone().endOf("jMonth").endOf("week");
  const date = startDay.clone().subtract(1, "day");
  const days: Moment[] = [];
  while (date.isBefore(endDay, "day")) {
    days.push(date.add(1, "day").clone());
  }
  return days;
}

function buildDayMap(
  sparkData: any[] | undefined,
  getAllResult: any[] | undefined,
  selectedPerson: PersonRecord,
): Map<string, DayMeta> {
  const map = new Map<string, DayMeta>();
  const nationalCode = String(selectedPerson.key?.NationalCode ?? selectedPerson.NationalCode ?? "");
  const cityName = String(
    selectedPerson.CityName || selectedPerson.key?.CityName || "",
  );

  for (const row of sparkData ?? []) {
    const dateString = String(row.Start_Date ?? "");
    if (!dateString) continue;
    const total = Number(row.TotalPerformance);
    const metric = Number.isFinite(total)
      ? getPerformanceMetric(total)
      : undefined;
    map.set(dateString, {
      dateString,
      total: Number.isFinite(total) ? total : undefined,
      direct: Number.isFinite(Number(row.DirectPerFormance))
        ? Number(row.DirectPerFormance)
        : undefined,
      indirect: Number.isFinite(Number(row.InDirectPerFormance))
        ? Number(row.InDirectPerFormance)
        : undefined,
      hasLeave: false,
      color: metric?.color,
    });
  }

  for (const row of getAllResult ?? []) {
    if (String(row.Start_Date ?? "") === "") continue;
    if (String(row.NationalCode) !== nationalCode) continue;
    if (String(row.CityName || "") !== cityName) continue;
    if (isPersonnelWorkingDay(row.HasTheDayOff)) continue;

    const dateString = String(row.Start_Date);
    const existing = map.get(dateString);
    if (existing) {
      existing.hasLeave = true;
    } else {
      map.set(dateString, {
        dateString,
        hasLeave: true,
      });
    }
  }

  return map;
}

function dayMatchesFilter(meta: DayMeta | undefined, filter: DayFilter): boolean {
  if (filter === "all") return true;
  if (!meta) return false;
  if (filter === "leave") return meta.hasLeave;
  if (filter === "direct") return (meta.direct ?? 0) > 0;
  if (filter === "indirect") return (meta.indirect ?? 0) > 0;
  return true;
}

function initialAnchor(selectedPerson: PersonRecord | null): Moment {
  const start = selectedPerson?.Start_Date;
  if (typeof start === "string" && start.includes("/")) {
    const parsed = moment(start, "jYYYY/jMM/jDD").locale("fa");
    if (parsed.isValid()) return parsed.startOf("jMonth");
  }
  const spark = (selectedPerson as any)?.sparkData as any[] | undefined;
  const first = spark?.[0]?.Start_Date;
  if (typeof first === "string" && first.includes("/")) {
    const parsed = moment(first, "jYYYY/jMM/jDD").locale("fa");
    if (parsed.isValid()) return parsed.startOf("jMonth");
  }
  return moment().locale("fa").startOf("jMonth");
}

/**
 * Sticky mini Jalali calendar rail — day pick updates selected person metrics
 * the same way the former details-panel calendar did.
 */
export function PersonnelCalendarRail() {
  const { selectedPerson, setSelectedPerson, getAll, currentCity } =
    useCitySession();

  const getAllData = getAll?.data as
    | {
        periodType?: string;
        dateLength?: unknown;
        result?: any[];
      }
    | undefined;

  const sparkData = (selectedPerson as any)?.sparkData as any[] | undefined;

  const [anchor, setAnchor] = useState<Moment>(() =>
    initialAnchor(selectedPerson),
  );
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [openSelect, setOpenSelect] = useState<"month" | "year" | null>(null);

  useEffect(() => {
    setAnchor(initialAnchor(selectedPerson));
    setDayFilter("all");
  }, [
    selectedPerson?.key?.NationalCode,
    selectedPerson?.NationalCode,
    selectedPerson?.Role,
    selectedPerson?.key?.CityName,
    selectedPerson?.CityName,
  ]);

  const dayMap = useMemo(() => {
    if (!selectedPerson) return new Map<string, DayMeta>();
    return buildDayMap(sparkData, getAllData?.result, selectedPerson);
  }, [selectedPerson, sparkData, getAllData?.result]);

  const monthDays = useMemo(() => getMonthDays(anchor), [anchor]);
  const viewMonth = anchor.jMonth();
  const viewYear = anchor.jYear();

  const yearOptions = useMemo(() => {
    const years = new Set<number>([viewYear]);
    for (const row of sparkData ?? []) {
      const y = Number.parseInt(String(row.Start_Date ?? "").split("/")[0] ?? "", 10);
      if (Number.isFinite(y)) years.add(y);
    }
    for (const dateString of dayMap.keys()) {
      const y = Number.parseInt(dateString.split("/")[0] ?? "", 10);
      if (Number.isFinite(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [sparkData, dayMap, viewYear]);

  const selectedDateString =
    selectedPerson?.periodType === "روزانه" && selectedPerson.Start_Date
      ? String(selectedPerson.Start_Date)
      : null;

  const selectTriggerClassName = cn(
    "h-8 min-w-0 rounded-lg border border-border-color/20 bg-third px-2 text-[11px] font-medium tabular-nums text-primary",
    "hover:border-border-color/35 hover:bg-third/90",
    "focus-visible:border-border-color/40 focus-visible:ring-2 focus-visible:ring-primary/20",
  );

  const selectContentClassName =
    "border-border-color/20 bg-third text-primary shadow-lg";

  const selectItemClassName = "text-[11px]";

  const getPersonnelDataForDate = useCallback(
    (
      date: string,
      nationalCode: string,
      nameFamily: string,
      role: string,
      cityName: string,
    ) => {
      if (!getAllData?.result) return null;

      return distinctPersonnelPerformanceData(
        getAllData as {
          periodType: string;
          dateLength: {};
          result: any[];
        },
        ["NationalCode", "NameFamily", "CityName"],
        [
          "TownName",
          "BranchCode",
          "BranchName",
          "BranchType",
          "SabtAvalieAsnad",
          "PazireshVaSabtAvalieAsnad",
          "ArzyabiAsanadBimarsetaniDirect",
          "ArzyabiAsnadBimarestaniIndirect",
          "ArzyabiAsnadDandanVaParaDirect",
          "ArzyabiAsnadDandanVaParaIndirect",
          "ArzyabiAsnadDandanDirect",
          "ArzyabiAsnadDandanIndirect",
          "ArzyabiAsnadDaroDirect",
          "ArzyabiAsnadDaroIndirect",
          "WithScanCount",
          "WithoutScanCount",
          "WithoutScanInDirectCount",
          "ArchiveDirectCount",
          "ArchiveInDirectCount",
          "ArzyabiVisitDirectCount",
          "ArzyabiVisitInDirectCount",
          "Role",
          "RoleType",
          "ContractType",
          "ProjectType",
          "PersonnelCode",
          "TotalPerformance",
          "DirectPerFormance",
          "InDirectPerFormance",
          "Start_Date",
          "HasTheDayOff",
        ],
        {
          HasTheDayOff: false,
          Start_Date: date,
        },
      ).find(
        (a: any) =>
          a.key.NationalCode +
            a.key.NameFamily +
            a.Role +
            a.key.CityName ===
          nationalCode + nameFamily + role + cityName,
      );
    },
    [getAllData],
  );

  const handleDayClick = useCallback(
    (dateString: string) => {
      if (!selectedPerson) return;
      const selectedCityName = String(
        selectedPerson.CityName || selectedPerson.key?.CityName || "",
      );
      const personnelDataForDate = getPersonnelDataForDate(
        dateString,
        selectedPerson.key?.NationalCode,
        selectedPerson.key?.NameFamily,
        selectedPerson.Role ?? "",
        selectedCityName,
      );
      if (!personnelDataForDate) return;

      setSelectedPerson({
        ...selectedPerson,
        ...personnelDataForDate,
        sparkData,
        Start_Date: dateString,
        periodType: "روزانه",
      });
    },
    [selectedPerson, getPersonnelDataForDate, setSelectedPerson, sparkData],
  );

  const shiftMonth = (delta: number) => {
    setAnchor((prev) => prev.clone().add(delta, "jMonth").startOf("jMonth"));
  };

  const setViewMonth = (monthIndex: number) => {
    setAnchor((prev) =>
      prev.clone().jMonth(monthIndex).startOf("jMonth"),
    );
  };

  const setViewYear = (year: number) => {
    setAnchor((prev) => prev.clone().jYear(year).startOf("jMonth"));
  };

  if (!currentCity) return null;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-fourth"
      dir="rtl"
    >
      <div className="shrink-0 space-y-2 border-b border-border-color/10 p-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <CalendarDaysIcon className="size-4 text-primary/60" />
          تقویم عملکرد
        </div>
        {selectedPerson ? (
          <p className="truncate text-[11px] text-primary/50">
            {String(
              selectedPerson.NameFamily ??
                selectedPerson.key?.NameFamily ??
                "",
            )}
          </p>
        ) : null}
      </div>

      <div className="rail-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {!selectedPerson ? (
          <LinearEmptyState
            icon={CalendarDaysIcon}
            title="پرسنل انتخاب نشده"
            description="برای دیدن تقویم روزانه، یک نفر را از فهرست پرسنل انتخاب کنید."
            className="py-8"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-color/20 bg-third text-primary/70 transition-colors hover:border-border-color/35 hover:bg-third/90 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label="ماه بعد"
              >
                <ChevronRightIcon className="size-4" />
              </button>

              <div className="grid min-w-0 flex-1 grid-cols-[1.4fr_1fr] gap-1.5">
                <div className={cn(openSelect === "month" && "relative z-30")}>
                  <Select
                    value={String(viewMonth)}
                    onValueChange={(value) => setViewMonth(Number(value))}
                    open={openSelect === "month"}
                    onOpenChange={(open) =>
                      setOpenSelect(open ? "month" : null)
                    }
                  >
                    <SelectTrigger
                      aria-label="ماه"
                      className={selectTriggerClassName}
                    >
                      <SelectValue placeholder="ماه" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClassName}>
                      {MONTHS.map((label, index) => (
                        <SelectItem
                          key={label}
                          value={String(index)}
                          className={selectItemClassName}
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={cn(openSelect === "year" && "relative z-30")}>
                  <Select
                    value={String(viewYear)}
                    onValueChange={(value) => setViewYear(Number(value))}
                    open={openSelect === "year"}
                    onOpenChange={(open) =>
                      setOpenSelect(open ? "year" : null)
                    }
                  >
                    <SelectTrigger
                      aria-label="سال"
                      className={selectTriggerClassName}
                    >
                      <SelectValue placeholder="سال" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClassName}>
                      {yearOptions.map((year) => (
                        <SelectItem
                          key={year}
                          value={String(year)}
                          className={selectItemClassName}
                        >
                          {String(year)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-color/20 bg-third text-primary/70 transition-colors hover:border-border-color/35 hover:bg-third/90 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label="ماه قبل"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border-color/15 bg-third/70 p-2">
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {WEEKDAYS.map((day) => (
                  <span
                    key={day}
                    className="pb-1 text-[10px] font-medium text-primary/40"
                  >
                    {day}
                  </span>
                ))}

                {monthDays.map((day) => {
                  const dateString = day.format("jYYYY/jMM/jDD");
                  const inMonth = day.jMonth() === viewMonth;
                  const meta = dayMap.get(dateString);
                  const matches = dayMatchesFilter(meta, dayFilter);
                  const isSelected = selectedDateString === dateString;
                  const hasSpark = Boolean(
                    sparkData?.some(
                      (row: any) => row.Start_Date === dateString,
                    ),
                  );
                  const showDot =
                    inMonth &&
                    matches &&
                    Boolean(meta && (meta.hasLeave || meta.color));
                  // Same as former details calendar: only working-day spark rows load metrics
                  const canSelect = inMonth && hasSpark;

                  return (
                    <button
                      key={dateString}
                      type="button"
                      disabled={!canSelect}
                      onClick={() => handleDayClick(dateString)}
                      title={
                        meta?.hasLeave
                          ? "مرخصی"
                          : meta?.total != null
                            ? `${meta.total.toFixed(1)}%`
                            : undefined
                      }
                      className={cn(
                        "relative flex min-h-9 flex-col items-center justify-center rounded-lg text-[11px] tabular-nums transition-colors",
                        inMonth ? "text-primary" : "text-primary/25",
                        canSelect && "hover:bg-primary/5",
                        !matches &&
                          inMonth &&
                          dayFilter !== "all" &&
                          "opacity-35",
                        isSelected &&
                          "bg-primary/10 ring-1 ring-primary/40 ring-inset",
                        !canSelect && "cursor-default",
                      )}
                    >
                      <span>{day.format("jD")}</span>
                      <span className="mt-0.5 flex h-1.5 items-center justify-center">
                        {showDot ? (
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              meta?.hasLeave && "bg-primary/55",
                            )}
                            style={
                              meta?.hasLeave
                                ? undefined
                                : meta?.color
                                  ? { backgroundColor: meta.color }
                                  : undefined
                            }
                            aria-hidden
                          />
                        ) : (
                          <span className="size-1.5" aria-hidden />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border-color/15 bg-third p-2">
              <Tabs
                value={dayFilter}
                onValueChange={(value) => setDayFilter(value as DayFilter)}
                variant="segment"
                className="w-full"
                labels={{
                  scrollLeft: "اسکرول به چپ",
                  scrollRight: "اسکرول به راست",
                }}
              >
                <TabsList
                  aria-label="نمایش روز"
                  className="!w-full bg-fourth/60 [&>div]:!flex-1 [&>div]:!basis-0 [&>div]:!min-w-0"
                >
                  {(
                    [
                      { value: "all", label: "همه" },
                      { value: "direct", label: "مستقیم" },
                      { value: "indirect", label: "غیر مستقیم" },
                      { value: "leave", label: "مرخصی" },
                    ] as const
                  ).map((option) => (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      className="w-full px-1.5 py-1.5 text-[11px]"
                      indicatorClassName="bg-primary"
                    >
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-primary/50">
              <span className="inline-flex items-center gap-1">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: "#B12B1D" }}
                />
                ضعیف
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: "#7BB11B" }}
                />
                خوب
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: "#16B13D" }}
                />
                عالی
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary/55" />
                مرخصی
              </span>
            </div>

            {selectedDateString ? (
              <p className="rounded-xl border border-border-color/15 bg-third px-2.5 py-2 text-[11px] text-primary/70">
                روز انتخاب‌شده:{" "}
                <span className="font-medium tabular-nums text-primary">
                  {selectedDateString}
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-primary/45">
                یک روز را انتخاب کنید تا جزئیات همان روز در پنل پرسنل به‌روز شود.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
