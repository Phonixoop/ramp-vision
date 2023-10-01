import { useRef, useState } from "react";

export default function SimpleTextField({
  className = "",
  autoFocus = false,
  value,
  onChange = () => {},
  ...rest
}) {
  const ref = useRef(undefined);
  return (
    <input
      dir="rtl"
      ref={ref}
      autoFocus={autoFocus}
      value={value}
      onKeyUpCapture={(e) => {
        if (e.key.toLowerCase() === "enter") ref.current.blur();
      }}
      className={`border-none outline-none ${className}`}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
