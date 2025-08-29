"use client";

import TextField from "../text-field";

interface FloatFieldProps {
  value?: string | number;
  onChange?: (value: string) => void;
  [key: string]: any;
}

export default function FloatField({ value, onChange = () => {}, ...rest }: FloatFieldProps) {
  function parse(val: string): string {
    function reverse(val: string): string {
      return val.split("").reverse().join("");
    }
    return reverse(reverse(val).replace(/[^0-9.]|\.(?=.*\.)/g, ""));
  }

  return (
    <TextField
      value={value}
      isRtl={false}
      onChange={(val) => onChange(parse(val))}
      {...rest}
    />
  );
}
