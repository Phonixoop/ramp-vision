import { Column } from "@tanstack/react-table";
import { MultiSelect, MultiSelectItem } from "@tremor/react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ServiceNamesType } from "~/constants/depo";
import Button from "~/ui/buttons";
import { api } from "~/utils/api";

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
  value,
  onChange,
  title,

  withSelectAll = false,
}) {
  const selectAllState = value.length < list.length;
  return (
    <div className=" flex w-full flex-col items-center justify-center gap-2 px-2 text-center sm:px-0 ">
      {withSelectAll && (
        <Button
          className={twMerge(
            "font-bold",
            selectAllState
              ? "bg-emerald-200 text-emerald-900"
              : "bg-rose-400 text-rose-900",
          )}
          onClick={() => {
            if (value.length == list.length) {
              onChange([]);
            } else {
              onChange(list);
            }
          }}
        >
          {selectAllState ? "انتخاب همه" : "پاک کردن همه"}
        </Button>
      )}
      <MultiSelect
        className="min-w-full"
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
    </div>
  );
}

export function SelectColumnFilter({
  column,
  data,
  initialFilters = [],
  onChange,
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
    .filter((item) => item != undefined)
    .toSorted();

  const selectedCount = getFilterValue() ? (getFilterValue() as any).length : 0;
  const selectAllState = selectedCount < unique.length;
  return (
    <>
      {withSelectAll && !singleSelect && (
        <Button
          className={twMerge(
            "font-bold",
            selectAllState
              ? "bg-emerald-200 text-emerald-900"
              : "bg-rose-400 text-rose-900",
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
          {selectAllState ? "انتخاب همه" : "پاک کردن همه"}
        </Button>
      )}
      <SelectControlled
        title={column.columnDef.header}
        list={unique}
        value={getFilterValue() ?? []}
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
    </>
  );
}
