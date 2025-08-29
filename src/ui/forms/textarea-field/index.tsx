import React, { useEffect, useRef, ChangeEvent, forwardRef } from "react";
import { cn } from "~/lib/utils";

interface TextAreaFieldProps {
  children?: React.ReactNode;
  extraClass?: string;
  bg?: string;
  className?: string;
  value?: string;
  placeholder?: string;
  isRtl?: boolean;
  rows?: number;
  cols?: number;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      children,
      extraClass = "",
      bg = "bg-secbuttn",
      className = `placeholder:opacity-0
    focus:placeholder:opacity-100 
    selection:text-white selection:bg-primary
    block px-2.5 pb-2.5 pt-5 
    w-full 
    text-sm 
    text-primary font-bold 
    border-b-2 border-primary appearance-none 
    focus:border-accent focus:outline-none focus:ring-0  peer`,
      value = "",
      placeholder = " ",
      isRtl = true,
      rows,
      cols,
      onChange = (e) => {},
      onValueChange = (value) => {},
      focused = false,
      onFocus = () => {},
      onBlur = () => {},
      ...rest
    }: TextAreaFieldProps,
    ref,
  ): JSX.Element => {
    const direction = `${isRtl ? "text-right" : "text-left"}`;
    const placeholderRef = useRef<HTMLLabelElement>(null);

    useEffect(() => {
      if (!focused || !ref || !placeholderRef.current) return;

      (ref as React.RefObject<HTMLTextAreaElement>).current?.focus();
      placeholderRef.current.style.opacity = "1";
    }, [focused, ref]);

    return (
      <>
        <style jsx>
          {`
            @media (max-width: 1000px) {
              .placeholder {
                opacity: 0;
              }
            }
          `}
        </style>
        {children}
        <textarea
          dir={isRtl ? "rtl" : "ltr"}
          rows={rows}
          cols={cols}
          ref={ref}
          className={cn(
            direction,
            `peer block w-full appearance-none border-b-2 border-primary bg-transparent px-2.5 pb-2.5 pt-5 text-sm font-bold text-primary selection:bg-primary selection:text-white placeholder:opacity-0 focus:border-accent focus:outline-none focus:ring-0 focus:placeholder:opacity-100`,
            className,
          )}
          placeholder={" "}
          value={value}
          autoComplete="off"
          onFocus={() => {
            if (placeholderRef.current)
              placeholderRef.current.style.opacity = "1";
            onFocus();
          }}
          onBlur={() => {
            if (placeholderRef.current)
              placeholderRef.current.style.opacity = "0";
            onBlur();
          }}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e);
            onValueChange(e.target.value);
          }}
          {...rest}
        />

        <label
          ref={placeholderRef}
          onClick={() => {
            if ((ref as React.RefObject<HTMLTextAreaElement>).current)
              (ref as React.RefObject<HTMLTextAreaElement>).current.focus();
          }}
          className="placeholder absolute right-2.5 top-9 origin-top-right -translate-y-4 scale-75 transform text-sm text-gray-500 opacity-0 duration-300 peer-placeholder-shown:scale-100 peer-focus:text-blue-400 mobileMax:peer-focus:opacity-100 dark:text-gray-400 peer-focus:dark:text-blue-200"
        >
          {placeholder}
        </label>
      </>
    );
  },
);

TextAreaField.displayName = "TextAreaField";

export default TextAreaField;
