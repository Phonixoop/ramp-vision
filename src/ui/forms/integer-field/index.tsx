"use client";

import TextField from "../text-field";

interface IntegerFieldProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string | number) => void;
  [key: string]: any;
}

export default function IntegerField({
  value,
  onChange = () => {},
  onValueChange = () => {},
  ...rest
}: IntegerFieldProps) {
  function parse(val: string): string | number {
    return parseInt(val.replace(/[^0-9]/g, "")) || "";
  }

  // Convert value to string for TextField
  const stringValue = value !== undefined ? String(value) : undefined;

  return (
    <TextField
      value={stringValue}
      isRtl={false}
      type="text"
      inputMode="numeric"
      pattern="[0-9]+"
      onChange={onChange}
      onValueChange={(val: string) => onValueChange(parse(val))}
      {...rest}
    />
  );
}
