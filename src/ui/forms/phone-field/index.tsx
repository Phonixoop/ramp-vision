"use client";

import IntegerField from "../integer-field";

interface PhoneFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}

export default function PhoneField({
  value,
  onChange = () => {},
  ...rest
}: PhoneFieldProps) {
  function parse(val: string): string {
    return val.slice(0, 11);
  }

  return (
    <IntegerField
      value={value}
      onValueChange={(val: string) => onChange(parse(val))}
      {...rest}
    />
  );
}
