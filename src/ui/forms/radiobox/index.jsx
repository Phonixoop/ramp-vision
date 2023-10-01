import { useRef } from "react";
import { useState } from "react";

export default function RadioBox({
  children,
  groupName = "",
  checked = false,
  onChange = () => {},
  onClick = () => {},
}) {
  const ref = useRef(undefined);
  return (
    <>
      <input hidden ref={ref} name={groupName} type={"radio"} />
      <div
        dir="rtl"
        className="flex justify-center items-center gap-2 cursor-pointer"
        onClick={onClick}
      >
        <div
          onClick={() => onChange(!ref.current.checked)}
          className={`relative center flex justify-center items-center w-[20px] h-[20px] p-1 ring-inset rounded-full cursor-pointer
          ${
            checked
              ? " ring-[1.5px] ring-atysa-main"
              : "border-[1.5px] border-gray-400"
          }
          `}
        >
          <span
            className={`absolute inset-0 rounded-full transition-transform duration-300 ease-in-out ${
              checked ? "bg-atysa-main scale-[0.7]" : "bg-gray-200 scale-[0]"
            }  `}
          />
        </div>
        <label htmlFor="" className="cursor-pointer">
          {" "}
          {children}
        </label>
      </div>
    </>
  );
}
