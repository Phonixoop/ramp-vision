import { Column } from "@tanstack/react-table";
import { MultiSelect, MultiSelectItem } from "@tremor/react";
import React, { useLayoutEffect, useState } from "react";
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

export function SelectControlled({ list = [], value, onChange, title }) {
  return (
    <div className="w-full  px-2 sm:px-0 ">
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
              <span className="px-2">{item}</span>
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
}) {
  if (!data || data.length === 0) return "";
  const { getFilterValue, setFilterValue } = column as Column<any>;
  const unique = [...new Set(data.map((a) => a[column.id]))];
  useLayoutEffect(() => {
    setFilterValue(initialFilters);
  }, []);
  return (
    <SelectControlled
      title={column.Header}
      list={unique.filter((item) => item != undefined)}
      value={getFilterValue()}
      onChange={(values) => {
        setFilterValue(values);
        onChange({
          id: column.id,
          values: values,
        });
      }}
    />
  );
}
