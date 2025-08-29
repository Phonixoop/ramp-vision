"use client";
import {
  useEffect,
  useRef,
  forwardRef,
  ChangeEvent,
  ComponentPropsWithoutRef,
  Ref,
  ComponentProps,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { cn } from "~/lib/utils";

type TextFieldProps = {
  children?: JSX.Element | string;
  className?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  isRtl?: boolean;

  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  focused?: boolean;
  onFocus?: () => void;
} & ComponentProps<"input">;

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ children = <>

    </> || "", className = ``, value, defaultValue, placeholder = " ", isRtl = true, onChange = () => {}, onValueChange = () => {}, focused = false, onFocus = () => {}, ...rest }, ref: Ref<HTMLInputElement>) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const isControlled = value !== undefined;

  const direction = `${isRtl ? "text-right" : "text-left"}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholderRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (!focused || !inputRef.current || !placeholderRef.current) return;

    inputRef.current.focus();
    // placeholderRef.current.style.opacity = "1";
  }, [focused]);

  useEffect(() => {
    if (typeof ref === "function") {
      ref(inputRef.current);
    } else if (ref) {
      (ref as any).current = inputRef.current;
    }
  }, [ref]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange(newValue);
    onChange(e);
  };

  return (
    <>
      {/* <style jsx>
        {`
          @media (max-width: 1000px) {
            .placeholder {
              opacity: 0;
            }
          }
        `}
      </style> */}
      {children}{" "}
      <input
        dir={isRtl ? "rtl" : "ltr"}
        ref={inputRef}
        type="text"
        className={cn(
          direction,
          `selection:text-secondry peer block w-full appearance-none rounded-t-lg border-b-2 border-primary bg-transparent px-2.5 pb-2.5 pt-5 text-sm font-bold text-primary focus:border-accent focus:outline-none focus:ring-0 focus:placeholder:opacity-100`,
          className,
        )}
        //  defaultValue={defaultValue}
        placeholder={placeholder ? placeholder : " "}
        value={isControlled ? value : internalValue}
        autoComplete="off"
        onFocus={() => {
          if (placeholderRef.current)
            placeholderRef.current.style.opacity = "1";
          onFocus();
        }}
        onChange={handleChange}
        {...rest}
      />
      {/* <label
        ref={placeholderRef}
        onClick={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
        className="placeholder absolute right-2.5 top-9 origin-top-right -translate-y-4 scale-75 transform text-sm text-secondary opacity-0 duration-300 peer-placeholder-shown:scale-100 peer-focus:text-primary mobileMax:peer-focus:opacity-100"
      >
        {placeholder}
      </label> */}
    </>
  );
});

export default TextField;

TextField.displayName = "TextField";
