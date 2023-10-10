import { twMerge } from "tailwind-merge";

export function Container({ children, className = "", rtl = false }) {
  return (
    <div
      className={twMerge("w-full p-1 sm:w-11/12 ", className)}
      dir={rtl ? "rtl" : ""}
    >
      {children}
    </div>
  );
}

export function ContainerBottomBorder({
  children,
  className = "",
  rtl = false,
}) {
  return (
    <div
      className={twMerge(
        " flex w-full items-center justify-center border-b border-b-primary/10",
        className,
      )}
      dir={rtl ? "rtl" : ""}
    >
      {children}
    </div>
  );
}
