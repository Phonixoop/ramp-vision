/**
 * Filter toolbar for the v2 depo page.
 *
 * Same primitives as the v2 table and chart pages. Filters write straight into
 * URL state so the page stays shareable and the three endpoints
 * (`/table`, `/charts`, `/estimate`) always receive one identical query.
 */
"use client";

import { useMemo } from "react";
import { RotateCcwIcon } from "lucide-react";
import CalendarButton from "~/features/persian-calendar-picker/calendar-button";
import {
  ToolbarFilterField,
  ToolbarFilterPopover,
  ToolbarFilterSection,
} from "~/components/linear-shell";
import { SelectControlled } from "~/features/checkbox-list";
import { cn } from "~/lib/utils";
import type { DepoUrlState } from "../depo-state";

const ACTION_BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border-color/15 px-2.5 text-xs text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary";

const PERIOD_OPTIONS = ["روزانه", "هفتگی", "ماهانه"] as const;

const CALENDAR_PERIOD = {
  روزانه: "daily",
  هفتگی: "weekly",
  ماهانه: "monthly",
} as const;

type DepoToolbarProps = {
  state: DepoUrlState;
  cities: string[];
  services: string[];
  billTypes: string[];
  caseTypes: string[];
  optionsLoading: boolean;
  activeFilters: number;
  total: number;
  onFilterChange: (patch: Partial<DepoUrlState>) => void;
  onReset: () => void;
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

export function DepoToolbar({
  state,
  cities,
  services,
  billTypes,
  caseTypes,
  optionsLoading,
  activeFilters,
  total,
  onFilterChange,
  onReset,
}: DepoToolbarProps) {
  // Keep current selections visible before the facet list arrives.
  const cityOptions = useMemo(
    () => Array.from(new Set([...state.cities, ...cities].filter(Boolean))),
    [cities, state.cities],
  );

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
          onFilterChange({ period, dates: selectedDates, page: 1 });
        }}
      />

      <ToolbarFilterPopover
        activeFilterCount={activeFilters}
        onClear={onReset}
        contentClassName="w-[520px] max-w-[92vw]"
      >
        <ToolbarFilterSection title="بازه و ابعاد">
          <div className="grid gap-3 sm:grid-cols-2">
            <ToolbarFilterField label="دوره">
              <SelectControlled
                list={[...PERIOD_OPTIONS]}
                value={[state.period]}
                onChange={(next) =>
                  onFilterChange({
                    period: (next[0] as DepoUrlState["period"]) ?? state.period,
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
              values={state.cities}
              options={cityOptions}
              loading={optionsLoading}
              onChange={(next) => onFilterChange({ cities: next, page: 1 })}
            />
            <MultiField
              label="نوع فعالیت"
              values={state.services}
              options={services}
              loading={optionsLoading}
              onChange={(next) => onFilterChange({ services: next, page: 1 })}
            />
            <MultiField
              label="نوع صورتحساب"
              values={state.billTypes}
              options={billTypes}
              loading={optionsLoading}
              onChange={(next) => onFilterChange({ billTypes: next, page: 1 })}
            />
            <MultiField
              label="نوع پرونده"
              values={state.caseTypes}
              options={caseTypes}
              loading={optionsLoading}
              onChange={(next) => onFilterChange({ caseTypes: next, page: 1 })}
            />
          </div>
        </ToolbarFilterSection>
      </ToolbarFilterPopover>

      <div className="ms-auto flex items-center gap-2">
        <span className="text-xs tabular-nums text-primary/50">
          {total.toLocaleString("fa-IR")} ردیف
        </span>
        <button type="button" className={ACTION_BTN} onClick={onReset}>
          <RotateCcwIcon className="size-3.5" />
          بازنشانی
        </button>
      </div>
    </div>
  );
}
