"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookmarkIcon,
  HistoryIcon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import {
  Layout,
  ToolbarFilterField,
  ToolbarFilterPopover,
  ToolbarFilterSection,
} from "~/components/linear-shell";
import { SelectControlled } from "~/features/checkbox-list";
import { cn } from "~/lib/utils";
import { useChartFilters } from "../filters-context";
import { systemSelectDefaults } from "../model";

const INLINE_TRIGGER = "min-w-[132px] max-w-[180px]";
const PANEL_TRIGGER = "w-full";
const ACTION_BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border-color/15 px-2.5 text-xs text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary";

/** Same page size as v1 FiltersSection / SelectControlled. */
const DEFAULT_ITEMS_PER_PAGE = 50;

function CompactSelect({
  values,
  options,
  onChange,
  placeholder,
  singleSelect = false,
  withSelectAll = true,
  className,
  loading,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: {
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  singleSelect?: boolean;
  withSelectAll?: boolean;
  className?: string;
  loading?: boolean;
  itemsPerPage?: number;
}) {
  // Keep URL/default selections visible even before option lists finish loading.
  const list = useMemo(
    () => Array.from(new Set([...values, ...options].filter(Boolean))),
    [values, options],
  );

  if (loading && list.length === 0) {
    return (
      <div
        className={cn(
          "h-8 min-w-[132px] animate-pulse rounded-md border border-border-color/10 bg-third/60",
          className,
        )}
      />
    );
  }

  return (
    <SelectControlled
      title={placeholder}
      list={list}
      value={values}
      onChange={onChange}
      withSelectAll={withSelectAll && !singleSelect}
      singleSelect={singleSelect}
      itemsPerPage={itemsPerPage}
      className={cn(className)}
    />
  );
}

export function ChartTopToolbar() {
  const params = useParams<{ city?: string }>();
  const {
    filters,
    calendarPeriod,
    optionLists,
    isOptionsLoading,
    isCitiesFetching,
    updateFilter,
    updateFilters,
    handleCalendarSubmit,
    saveCurrentAsDefaults,
    resetToSystemDefaults,
    applySavedOrSystemDefaults,
    hasSavedDefaults,
  } = useChartFilters();

  const activeCity = useMemo(() => {
    if (typeof params?.city !== "string") return "";
    try {
      return decodeURIComponent(params.city);
    } catch {
      return params.city;
    }
  }, [params?.city]);

  const v1Href = activeCity
    ? `/dashboard/personnel_performance/chart/${encodeURIComponent(activeCity)}`
    : "/dashboard/personnel_performance/chart";

  const overflowActiveCount = [
    filters.role.length > 0,
    filters.contract.length > 0,
    filters.role_type.length > 0,
    filters.date_info.length > 0,
    filters.town.length > 0,
    filters.branch.length > 0,
    filters.branch_code.length > 0,
    filters.branch_type.length > 0,
  ].filter(Boolean).length;

  function clearOverflowFilters() {
    // Keep date_info — cities query requires it (v1 always has a DateInfo).
    updateFilters({
      role: [],
      contract: [],
      role_type: [],
      town: [],
      branch: [],
      branch_code: [],
      branch_type: [],
    });
  }

  return (
    <Layout.TopBar>
      <Layout.TopBar.Title>نمودار عملکرد پرسنل</Layout.TopBar.Title>
      <Layout.TopBar.Filters>
        <CalendarButton
          onSelect={handleCalendarSubmit}
          selectedDates={filters.dates}
          periodType={calendarPeriod}
          placeholder="بازه گزارش"
          className="h-8 min-w-[140px] rounded-md text-xs"
        />
        <CompactSelect
          values={filters.project}
          options={optionLists.projectTypes}
          onChange={(values) => updateFilter("project", values)}
          placeholder="نوع پروژه"
          className={INLINE_TRIGGER}
          loading={isOptionsLoading}
        />
        <ToolbarFilterPopover
          activeFilterCount={overflowActiveCount}
          onClear={clearOverflowFilters}
          contentClassName="min-w-[560px]"
        >
          <ToolbarFilterSection title="فیلترهای اصلی">
            <ToolbarFilterField label="سمت">
              <CompactSelect
                values={filters.role}
                options={optionLists.roles}
                onChange={(values) => updateFilter("role", values)}
                placeholder="سمت"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
            <ToolbarFilterField label="نوع قرارداد">
              <CompactSelect
                values={filters.contract}
                options={optionLists.contractTypes}
                onChange={(values) => updateFilter("contract", values)}
                placeholder="نوع قرارداد"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
            <ToolbarFilterField label="نوع سمت">
              <CompactSelect
                values={filters.role_type}
                options={optionLists.roleTypes}
                onChange={(values) => updateFilter("role_type", values)}
                placeholder="نوع سمت"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
            <ToolbarFilterField label="تاریخ گزارش پرسنل">
              <CompactSelect
                values={filters.date_info}
                options={optionLists.dateInfos}
                onChange={(values) => updateFilter("date_info", values)}
                placeholder="تاریخ گزارش"
                singleSelect
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
          </ToolbarFilterSection>
          <ToolbarFilterSection title="فیلترهای بیشتر">
            <ToolbarFilterField label="نام شهر">
              <CompactSelect
                values={filters.town}
                options={optionLists.townNames}
                onChange={(values) => updateFilter("town", values)}
                placeholder="نام شهر"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
            <ToolbarFilterField label="نام شعبه">
              <CompactSelect
                values={filters.branch}
                options={optionLists.branchNames}
                onChange={(values) => updateFilter("branch", values)}
                placeholder="نام شعبه"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
            <ToolbarFilterField label="کد شعبه">
              <CompactSelect
                values={filters.branch_code}
                options={optionLists.branchCodes}
                onChange={(values) => updateFilter("branch_code", values)}
                placeholder="کد شعبه"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
            <ToolbarFilterField label="نوع شعبه">
              <CompactSelect
                values={filters.branch_type}
                options={optionLists.branchTypes}
                onChange={(values) => updateFilter("branch_type", values)}
                placeholder="نوع شعبه"
                className={PANEL_TRIGGER}
                loading={isOptionsLoading}
              />
            </ToolbarFilterField>
          </ToolbarFilterSection>
        </ToolbarFilterPopover>
        {isCitiesFetching ? (
          <span className="text-[11px] text-accent">به‌روزرسانی…</span>
        ) : null}
      </Layout.TopBar.Filters>
      <Layout.TopBar.Actions>
        <Link href={v1Href} className={ACTION_BTN}>
          <HistoryIcon className="size-3.5" />
          <span className="hidden xl:inline">نسخه قبلی</span>
        </Link>
        <button
          type="button"
          className={ACTION_BTN}
          onClick={saveCurrentAsDefaults}
        >
          <BookmarkIcon className="size-3.5" />
          <span className="hidden xl:inline">ذخیره پیش‌فرض</span>
        </button>
        <button
          type="button"
          className={ACTION_BTN}
          onClick={applySavedOrSystemDefaults}
        >
          <SaveIcon className="size-3.5" />
          <span className="hidden xl:inline">
            {hasSavedDefaults ? "اعمال پیش‌فرض" : "اعمال پیش‌فرض سیستم"}
          </span>
        </button>
        <button
          type="button"
          className={ACTION_BTN}
          onClick={resetToSystemDefaults}
          title={`بازنشانی به ${systemSelectDefaults().period}`}
        >
          <RotateCcwIcon className="size-3.5" />
          <span className="hidden xl:inline">بازنشانی</span>
        </button>
      </Layout.TopBar.Actions>
    </Layout.TopBar>
  );
}
