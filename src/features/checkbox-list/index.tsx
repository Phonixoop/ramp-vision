import { Select, SelectItem } from "@tremor/react";
import React, { useState } from "react";

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

export function SelectControlled({ list = [], value, onChange }) {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <Select value={value} onValueChange={onChange}>
        {list.map((item) => {
          return (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
}
