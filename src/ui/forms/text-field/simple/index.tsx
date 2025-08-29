"use client";

import { useRef, useState } from "react";

interface SimpleTextFieldProps {
  className?: string;
  autoFocus?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}

export default function SimpleTextField({
  className = "",
  autoFocus = false,
  value,
  onChange = () => {},
  ...rest
}: SimpleTextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      dir="rtl"
      ref={ref}
      autoFocus={autoFocus}
      value={value}
      onKeyUpCapture={(e) => {
        if (e.key.toLowerCase() === "enter") ref.current?.blur();
      }}
      className={`border-none outline-none ${className}`}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
