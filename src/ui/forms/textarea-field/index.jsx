import { useEffect, useRef } from "react";

export default function TextAreaField({
  children,
  extraClass = "",
  bg = "bg-secondary",
  className = ` placeholder:opacity-0
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
  onChange = (value) => {},
  focused = false,
  onFocus = () => {},
  onBlur = () => {},
  ...rest
}) {
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

      <textarea
        dir={isRtl ? "rtl" : "ltr"}
        rows={rows}
        cols={cols}
        ref={ref}
        className={`${direction} ${className} ${bg} ${extraClass}`}
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
        onChange={(e) => onChange(e)}
        {...rest}
      />

      <label
        ref={placeholderRef}
        onClick={() => ref.current.focus()}
        className="placeholder mobileMax:peer-focus:opacity-100
       absolute
    right-2.5
    top-9
       origin-top-right
        -translate-y-4
       scale-75 
        transform
        text-sm 
        text-gray-500 
        opacity-0
       duration-300
       peer-placeholder-shown:scale-100
        peer-focus:text-blue-400  
         
        dark:text-gray-400
        peer-focus:dark:text-blue-200"
      >
        {placeholder}
      </label>
    </>
  );
}
