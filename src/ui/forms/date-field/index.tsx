"use client";

import { useState } from "react";

import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import Button from "~/ui/buttons";

interface DateFieldProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  value?: any;
  onChange?: (date: { formatted: string; original: any }) => void;
}

export default function DateField({
  children,
  className = "",
  title = "",
  value,
  onChange = () => {},
}: DateFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <>
      <Button
        className={className}
        onClick={() => {
          setShow((prev) => !prev);
        }}
      >
        {title}
      </Button>
      {show && (
        <>
          <Calendar
            onFocusedDateChange={() => {
              setShow(false);
            }}
            value={value}
            className="absolute bg-white/50 shadow-none backdrop-blur-lg  "
            calendar={persian}
            locale={persian_fa}
            onChange={(date: any) => {
              onChange({
                formatted: date.format("YYYY/MM/DD"),
                original: date,
              });
            }}
          >
            {children}
          </Calendar>
        </>
      )}
    </>
  );
}
