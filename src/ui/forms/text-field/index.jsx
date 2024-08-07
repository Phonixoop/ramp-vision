import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export default function TextField({
  children = <></> || "",

  className = ``,
  value,
  placeholder = " ",
  isRtl = true,
  min = 0,
  max = 1000,
  onChange = (e) => {},
  onValueChange = (value) => {},
  focused = false,
  onFocus = () => {},

  ...rest
}) {
  function parse(value) {
    return value.slice(min, max);
  }
  const direction = `${isRtl ? "text-right" : "text-left"}`;
  const ref = useRef(undefined);
  const placeholderRef = useRef(undefined);
  useEffect(() => {
    if (!focused) return;
    ref.current.focus();
    placeholderRef.current.style.opacity = 1;
  }, [focused]);
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
      <input
        dir={isRtl ? "rtl" : "ltr"}
        ref={ref}
        type="text"
        className={twMerge(
          direction,
          `selection:text-secondry peer
        block 
        w-full
         appearance-none rounded-t-lg border-b-2 border-primary 
         bg-transparent 
         px-2.5 
         pb-2.5 pt-5 
       
         text-sm font-bold text-primary 
        placeholder:opacity-0 focus:border-accent focus:outline-none  focus:ring-0 focus:placeholder:opacity-100`,
          className,
        )}
        placeholder={" "}
        value={value}
        autoComplete="off"
        onFocus={() => {
          placeholderRef.current.style.opacity = 1;
          onFocus();
        }}
        onBlur={() => {
          placeholderRef.current.style.opacity = 0;
        }}
        onChange={(e) => {
          onValueChange(e.target.value);
          onChange(e);
        }}
        {...rest}
      />

      <label
        ref={placeholderRef}
        onClick={() => ref.current.focus()}
        className="placeholder absolute
       right-2.5
    top-9
    origin-top-right
       -translate-y-4
        scale-75
       transform 
        text-sm
        text-secondary 
        opacity-0
        duration-300
       peer-placeholder-shown:scale-100
         peer-focus:text-primary
        mobileMax:peer-focus:opacity-100 
       "
      >
        {placeholder}
      </label>
    </>
  );
}
