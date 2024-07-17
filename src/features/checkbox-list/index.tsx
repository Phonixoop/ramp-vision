import { Column } from "@tanstack/react-table";
import { MultiSelect, MultiSelectItem } from "@tremor/react";
import { ListXIcon, ListChecksIcon } from "lucide-react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ServiceNamesType } from "~/constants/depo";
import Button from "~/ui/buttons";
import { api } from "~/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
export default function CheckboxList({ checkboxes, onCheckboxChange }) {
  const handleCheckboxChange = (id) => {
    onCheckboxChange(id);
  };

  return (
    <div>
      {checkboxes.map((checkbox) => (
        <div key={checkbox.id} className="flex items-center">
          <input
            type="checkbox"
            id={`checkbox-${checkbox.id}`}
            checked={checkbox.checked}
            onChange={() => handleCheckboxChange(checkbox.id)}
            className="mr-2"
          />
          <label htmlFor={`checkbox-${checkbox.id}`}>{checkbox.label}</label>
        </div>
      ))}
    </div>
  );
}

export function SelectControlled({
  list = [],
  value = [],
  onChange,
  title,
  className = "",
  withSelectAll = false,
}) {
  const selectAllState = value.length < list.length;
  return (
    <div
      className={twMerge(
        " flex w-full items-center justify-center gap-1 px-2 text-center sm:px-0 ",
        className,
      )}
    >
      <MultiSelect
        className="min-w-0"
        placeholder={title}
        placeholderSearch="جستجو..."
        defaultValue={list}
        value={value}
        onValueChange={onChange}
      >
        {list.map((item) => {
          return (
            <MultiSelectItem key={item} value={item}>
              <p className="px-2 text-right text-primary hover:text-accent">
                {item}
              </p>
            </MultiSelectItem>
          );
        })}
      </MultiSelect>
      {withSelectAll && list.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className={twMerge(
                  "font-bold",
                  selectAllState
                    ? " border border-primary/20  p-1.5 text-emerald-600 transition-all duration-300 hover:bg-emerald-50/20"
                    : "border border-primary/20  bg-primary/10 p-1.5 text-rose-600 transition-all duration-300 hover:bg-primary/20",
                )}
                onClick={() => {
                  if (value.length == list.length) {
                    onChange([]);
                  } else {
                    onChange(list);
                  }
                }}
              >
                {selectAllState ? <ListChecksIcon /> : <ListXIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-primary">
              <p className="text-secondary">
                {selectAllState ? "انتخاب همه" : "پاک کردن انتخاب ها"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function SelectColumnFilter({
  column,
  data,
  initialFilters = [],
  selectedValues = [],
  onChange = (filter) => {},
  withSelectAll = true,
  singleSelect = false,
}) {
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  const { getFilterValue, setFilterValue } = column as Column<any>;
  useIsomorphicLayoutEffect(() => {
    setFilterValue(initialFilters);
  }, []);

  if (!data || data.length === 0) return <></>;
  const unique = [...new Set(data.map((a) => a[column.id]))]
    .filter((item) => item)
    .toSorted();

  const finalValues =
    selectedValues?.length <= 0 ? getFilterValue() : selectedValues ?? [];

  const selectedCount = finalValues ? (finalValues as any).length : 0;
  const selectAllState = selectedCount < unique.length;
  return (
    <div className=" flex w-full items-center justify-center gap-2 px-2 text-center sm:px-0 ">
      <SelectControlled
        className="min-w-0"
        title={column.columnDef.header}
        list={unique}
        value={
          selectedValues?.length <= 0
            ? (finalValues as any[])
            : selectedValues ?? []
        }
        onChange={(values) => {
          let _values = values;
          if (singleSelect) _values = [values[values.length - 1]];

          setFilterValue(_values);

          onChange({
            id: column.id,
            values: _values,
          });
        }}
      />
      {withSelectAll && !singleSelect && unique.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className={twMerge(
                  "font-bold",
                  selectAllState
                    ? "border border-primary/20  p-1.5 text-emerald-600 transition-all duration-300 hover:bg-emerald-50/20"
                    : "border border-primary/20  bg-primary/10 p-1.5 text-rose-600 transition-all duration-300 hover:bg-primary/20",
                )}
                onClick={() => {
                  if (selectedCount == unique.length) {
                    setFilterValue([]);
                    onChange({
                      id: column.id,
                      values: [],
                    });
                  } else {
                    setFilterValue(unique);
                    onChange({
                      id: column.id,
                      values: unique,
                    });
                  }
                }}
              >
                {selectAllState ? <ListChecksIcon /> : <ListXIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-primary">
              <p className="text-secondary">
                {selectAllState ? "انتخاب همه" : "پاک کردن انتخاب ها"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
