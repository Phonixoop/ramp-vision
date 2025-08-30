import React from "react";
import { FilterIcon } from "lucide-react";
import H2 from "~/ui/heading/h2";
import ResponsiveView from "~/features/responsive-view";
import { SelectControlled } from "~/features/checkbox-list";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/shadcn/accordion";
import { PeriodType } from "../types";
import { cn, sortDates } from "~/lib/utils";

interface FiltersSectionProps {
  filters: any;
  reportPeriod: PeriodType;
  getInitialFilters: any;
  onCalendarSubmit: (params: { reportPeriod: "daily" | "weekly" | "monthly"; selectedDates: string[] }) => void;
  onUpdateFilters: (patch: any) => void;
  getCalendarPeriodType: (period: PeriodType) => "daily" | "weekly" | "monthly";
}

export const FiltersSection = React.memo<FiltersSectionProps>(
  ({ filters, reportPeriod, getInitialFilters, onCalendarSubmit, onUpdateFilters, getCalendarPeriodType }) => {
    const _DateInfos = React.useMemo(
      () =>
        [
          ...new Set(
            getInitialFilters?.data?.DateInfos?.map((a: any) => a.DateInfo)?.filter(
              Boolean,
            ) ?? [],
          ),
        ] as string[],
      [getInitialFilters.data?.DateInfos],
    );
    const DateInfos = sortDates({ dates: _DateInfos });

    const Roles = React.useMemo(
      () => [
        ...new Set(
          getInitialFilters?.data?.usersInfo
            ?.map((a: any) => a.Role as string)
            ?.filter(Boolean) ?? [""],
        ),
      ],
      [getInitialFilters.data?.usersInfo],
    );

    const ContractTypes = React.useMemo(
      () => [
        ...new Set(
          getInitialFilters?.data?.usersInfo
            ?.map((a: any) => a.ContractType)
            ?.filter(Boolean) ?? [],
        ),
      ],
      [getInitialFilters.data?.usersInfo],
    );

    const RolesType = React.useMemo(
      () => [
        ...new Set(
          getInitialFilters?.data?.usersInfo
            ?.map((a: any) => a.RoleType)
            ?.filter(Boolean) ?? [],
        ),
      ],
      [getInitialFilters.data?.usersInfo],
    );

    if (getInitialFilters.isLoading) {
      return null;
    }

    return (
      <div className="mx-auto flex w-11/12 items-center justify-center gap-5 rounded-t-2xl p-2 sm:flex-col">
        <H2 className="hidden py-2 text-xl sm:flex">فیلترها</H2>

        <ResponsiveView
          className="z-20 flex max-h-[100vh] w-full flex-wrap items-stretch justify-start rounded-t-3xl bg-secondary sm:max-h-min sm:p-5"
          dir="rtl"
          btnClassName="text-primary"
          icon={
            <>
              <span className="px-2">فیلترها</span>
              <FilterIcon className="stroke-primary" />
            </>
          }
        >
          <div className="flex w-full flex-wrap">
            {/* Report period / date picker */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-around gap-3 p-2">
              <span className="font-bold text-primary">بازه گزارش</span>
              <CalendarButton
                onSelect={onCalendarSubmit}
                selectedDates={filters?.filter?.Start_Date ?? []}
                periodType={getCalendarPeriodType(reportPeriod)}
                placeholder="انتخاب بازه زمانی"
                className="w-full"
              />
            </div>

            {/* Project Type */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
              <span className="font-bold text-primary">نوع پروژه</span>
              <SelectControlled
                withSelectAll
                title="نوع پروژه"
                list={getInitialFilters?.data?.ProjectTypes}
                value={filters?.filter?.ProjectType}
                onChange={(values) => onUpdateFilters({ ProjectType: values })}
              />
            </div>

            {/* Role */}
            <div className="flex max-w-sm flex-col items-center justify-center gap-3 p-2 sm:w-[25rem]">
              <span className="font-bold text-primary">سمت</span>
              <SelectControlled
                withSelectAll
                title="سمت"
                list={Roles as string[]}
                value={filters?.filter?.Role}
                onChange={(values) => onUpdateFilters({ Role: values })}
              />
            </div>

            {/* Contract Type */}
            <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
              <span className="font-bold text-primary">نوع قرار داد</span>
              <SelectControlled
                withSelectAll
                title="نوع قرار داد"
                list={ContractTypes as string[]}
                value={filters?.filter?.ContractType}
                onChange={(values) => onUpdateFilters({ ContractType: values })}
              />
            </div>

            {/* Role Type */}
            <div className="flex w-[22rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
              <span className="font-bold text-primary">نوع سمت</span>
              <SelectControlled
                withSelectAll
                title="نوع سمت"
                list={RolesType as string[]}
                value={filters?.filter?.RoleType}
                onChange={(values) => onUpdateFilters({ RoleType: values })}
              />
            </div>

            {/* Personnel report DateInfo */}
            <div className="flex w-[12rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
              <span className="font-bold text-primary">
                تاریخ گزارش پرسنل
              </span>
              <SelectControlled
                title="تاریخ گزارش پرسنل"
                list={DateInfos}
                value={
                  filters?.filter?.DateInfo ??
                  (DateInfos.length
                    ? [DateInfos[DateInfos.length - 1]]
                    : [])
                }
                onChange={(values) => {
                  const latest = values.length
                    ? [values[values.length - 1]]
                    : [];
                  onUpdateFilters({
                    DateInfo: latest?.filter(Boolean) ?? [],
                  });
                }}
              />
            </div>
          </div>

          {/* More filters */}
          <div className="flex w-full flex-wrap items-center justify-center">
            <Accordion className="w-full" type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-accent">
                  فیلتر های بیشتر
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                    <span className="font-bold text-primary">نام شهر</span>
                    <SelectControlled
                      withSelectAll
                      title="نام شهر"
                      list={getInitialFilters.data?.TownNames ?? []}
                      value={filters?.filter?.TownName ?? []}
                      onChange={(values) =>
                        onUpdateFilters({ TownName: values })
                      }
                    />
                  </div>
                  <div className="flex min-w-full max-w-sm flex-col items-center justify-center gap-3 p-2">
                    <span className="font-bold text-primary">نام شعبه</span>
                    <SelectControlled
                      withSelectAll
                      title="نام شعبه"
                      list={getInitialFilters.data?.BranchNames ?? []}
                      value={filters?.filter?.BranchName ?? []}
                      onChange={(values) =>
                        onUpdateFilters({ BranchName: values })
                      }
                    />
                  </div>
                  <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                    <span className="font-bold text-primary">کد شعبه</span>
                    <SelectControlled
                      withSelectAll
                      title="کد شعبه"
                      list={getInitialFilters.data?.BranchCodes ?? []}
                      value={filters?.filter?.BranchCode ?? []}
                      onChange={(values) =>
                        onUpdateFilters({ BranchCode: values })
                      }
                    />
                  </div>
                  <div className="flex w-[15rem] max-w-sm flex-col items-center justify-center gap-3 p-2">
                    <span className="font-bold text-primary">نوع شعبه</span>
                    <SelectControlled
                      withSelectAll
                      title="نوع شعبه"
                      list={getInitialFilters.data?.BranchTypes ?? []}
                      value={filters?.filter?.BranchType ?? []}
                      onChange={(values) =>
                        onUpdateFilters({ BranchType: values })
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ResponsiveView>
      </div>
    );
  }
);

FiltersSection.displayName = "FiltersSection";
