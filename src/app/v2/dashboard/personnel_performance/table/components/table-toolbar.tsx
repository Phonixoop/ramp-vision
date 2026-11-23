/**
 * Filter toolbar for the v2 table page.
 *
 * Built from the same `linear-shell` primitives the v2 chart page uses
 * (`ToolbarFilterPopover` / `ToolbarFilterSection` / `ToolbarFilterField`,
 * `SelectControlled`, `CalendarButton`), so the two v2 pages look and behave
 * identically. Every control writes straight into URL state — the toolbar owns
 * no local copy of the filters, which is what keeps `/table` shareable.
 *
 * The one deliberate difference from v1: multi-city selection is allowed in
 * monthly mode. v1 had to cap that to a single city because it downloaded every
 * row to aggregate in the browser; here aggregation happens in SQL and the
 * browser only ever receives one page.
 */
"use client";

import { useMemo } from "react";
import { DownloadIcon, RotateCcwIcon } from "lucide-react";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import {
  ToolbarFilterField,
  ToolbarFilterPopover,
  ToolbarFilterSection,
} from "~/components/linear-shell";
import { SwitchControl } from "~/components/shadcn/switch-control";
import { SelectControlled } from "~/features/checkbox-list";
import { cn } from "~/lib/utils";
import type { PersonnelOptionsResponse } from "~/server/ramp-performance/params";
import type { TableUrlState } from "../table-state";

const ACTION_BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border-color/15 px-2.5 text-xs text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary";

const PERIOD_OPTIONS = ["روزانه", "هفتگی", "ماهانه"] as const;

const CALENDAR_PERIOD = {
  روزانه: "daily",
  هفتگی: "weekly",
  ماهانه: "monthly",
} as const;

type TableToolbarProps = {
  state: TableUrlState;
  options: PersonnelOptionsResponse | undefined;
  optionsLoading: boolean;
  activeFilters: number;
  total: number;
  onFilterChange: (patch: Partial<TableUrlState>) => void;
  onReset: () => void;
  onExport: () => void;
  exporting?: boolean;
};

function MultiField({
  label,
  values,
  options,
  loading,
  onChange,
}: {
  label: string;
  values: string[];
  options: string[];
  loading?: boolean;
  onChange: (next: string[]) => void;
}) {
  return (
    <ToolbarFilterField label={label}>
      <SelectControlled
        list={options}
        value={values}
        onChange={onChange}
        title={label}
        withSelectAll
        itemsPerPage={50}
        className={cn("w-full", loading && "pointer-events-none opacity-60")}
      />
    </ToolbarFilterField>
  );
}

export function TableToolbar({
  state,
  options,
  optionsLoading,
  activeFilters,
  total,
  onFilterChange,
  onReset,
  onExport,
  exporting,
}: TableToolbarProps) {
  // Cities come from `/options`; keep current selections visible while loading.
  const cityOptions = useMemo(() => {
    const listed = options?.cities ?? [];
    return Array.from(
      new Set([...(state.cities ?? []), ...listed].filter(Boolean)),
    );
  }, [options?.cities, state.cities]);

  return (
    <div
      dir="rtl"
      className="flex flex-wrap items-center gap-2 border-b border-border-color/10 bg-fourth px-3 py-2"
    >
      <CalendarButton
        selectedDates={state.dates}
        periodType={CALENDAR_PERIOD[state.period]}
        buttonSize="sm"
        buttonVariant="outline"
        onSelect={({ reportPeriod, selectedDates }) => {
          const period =
            reportPeriod === "daily"
              ? "روزانه"
              : reportPeriod === "weekly"
                ? "هفتگی"
                : "ماهانه";
          onFilterChange({
            period,
            dates: selectedDates,
            // A new period invalidates the page position.
            page: 1,
          });
        }}
      />

      <ToolbarFilterPopover
        activeFilterCount={activeFilters}
        onClear={onReset}
        contentClassName="w-[640px] max-w-[92vw]"
      >
        <ToolbarFilterSection title="بازه و پرسنل">
          <div className="grid gap-3 sm:grid-cols-2">
            <ToolbarFilterField label="دوره">
              <SelectControlled
                list={[...PERIOD_OPTIONS]}
                value={[state.period]}
                onChange={(next) =>
                  onFilterChange({
                    period: (next[0] as TableUrlState["period"]) ?? state.period,
                    page: 1,
                  })
                }
                title="دوره"
                singleSelect
                className="w-full"
              />
            </ToolbarFilterField>
            <MultiField
              label="استان"
              values={state.cities ?? []}
              options={cityOptions}
              loading={optionsLoading}
              onChange={(cities) => onFilterChange({ cities, page: 1 })}
            />
            <MultiField
              label="نوع پروژه"
              values={state.project}
              options={options?.projectTypes ?? []}
              loading={optionsLoading}
              onChange={(project) => onFilterChange({ project, page: 1 })}
            />
            <MultiField
              label="نوع قرارداد"
              values={state.contract}
              options={options?.contractTypes ?? []}
              loading={optionsLoading}
              onChange={(contract) => onFilterChange({ contract, page: 1 })}
            />
            <MultiField
              label="سمت"
              values={state.role}
              options={options?.roles ?? []}
              loading={optionsLoading}
              onChange={(role) => onFilterChange({ role, page: 1 })}
            />
            <MultiField
              label="نوع سمت"
              values={state.role_type}
              options={options?.roleTypes ?? []}
              loading={optionsLoading}
              onChange={(role_type) => onFilterChange({ role_type, page: 1 })}
            />
            <MultiField
              label="تاریخ گزارش پرسنل"
              values={state.date_info}
              options={options?.dateInfos ?? []}
              loading={optionsLoading}
              onChange={(date_info) => onFilterChange({ date_info, page: 1 })}
            />
            <MultiField
              label="شهرستان"
              values={state.town}
              options={options?.towns ?? []}
              loading={optionsLoading}
              onChange={(town) => onFilterChange({ town, page: 1 })}
            />
            <MultiField
              label="شعبه"
              values={state.branch}
              options={options?.branchNames ?? []}
              loading={optionsLoading}
              onChange={(branch) => onFilterChange({ branch, page: 1 })}
            />
            <MultiField
              label="کد شعبه"
              values={state.branch_code}
              options={options?.branchCodes ?? []}
              loading={optionsLoading}
              onChange={(branch_code) => onFilterChange({ branch_code, page: 1 })}
            />
            <MultiField
              label="نوع شعبه"
              values={state.branch_type}
              options={options?.branchTypes ?? []}
              loading={optionsLoading}
              onChange={(branch_type) => onFilterChange({ branch_type, page: 1 })}
            />
          </div>
        </ToolbarFilterSection>
      </ToolbarFilterPopover>

      {/* Same presentation as the chart page's work-days switch. */}
      <label className="inline-flex h-8 items-center gap-2 rounded-md px-1 text-[11px] text-primary/55">
        <span className="whitespace-nowrap">روز کاری</span>
        <SwitchControl
          checked={state.work_days}
          onCheckedChange={(checked) =>
            onFilterChange({ work_days: checked, page: 1 })
          }
          aria-label="محاسبه بر اساس روز کاری"
        />
      </label>

      <div className="ms-auto flex items-center gap-2">
        <span className="text-xs tabular-nums text-primary/50">
          {total.toLocaleString("fa-IR")} ردیف
        </span>
        <button type="button" className={ACTION_BTN} onClick={onReset}>
          <RotateCcwIcon className="size-3.5" />
          بازنشانی
        </button>
        <button
          type="button"
          className={cn(ACTION_BTN, exporting && "opacity-60")}
          onClick={onExport}
          disabled={exporting}
        >
          <DownloadIcon className="size-3.5" />
          {exporting ? "در حال خروجی…" : "خروجی CSV"}
        </button>
      </div>
    </div>
  );
}
