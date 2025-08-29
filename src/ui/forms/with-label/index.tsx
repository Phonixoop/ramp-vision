"use client";
import { UserIcon } from "lucide-react";
import React, {
  useState,
  FC,
  ReactNode,
  ChangeEvent,
  ComponentPropsWithoutRef,
} from "react";
import { cn } from "~/lib/utils";

interface WithLabelProps {
  children?: ReactNode;
  value?: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  containerClassname?: string;
  iconContainerClassName?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  icon?: React.ReactElement;
  mainDir?: "rtl" | "ltr";
  [key: string]: any;
}

function withLabel<T>(Component: FC<T>) {
  const WrappedComponent: FC<T & WithLabelProps> = ({
    children = <></>,
    value = "",
    label = "",
    className = "",
    name = "",
    labelClassName = "",
    containerClassName = "",
    iconContainerClassName = "",
    onChange = (value) => {},
    onValueChange = (value = "") => {},
    mainDir = undefined,

    icon = undefined,
    ...rest
  }) => {
    const [focused, setFocused] = useState(false);
    const componentRef = React.useRef<HTMLInputElement>(null);

    return (
      <div dir={mainDir} className={cn("flex w-full", containerClassName)}>
        <div className="relative flex w-full flex-row">
          <Component
            ref={componentRef}
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onChange(e);
            }}
            onValueChange={(parsedValue) => {
              onValueChange(parsedValue);
            }}
            focused={focused}
            onBlur={() => setFocused(false)}
            className={className}
            name={name}
            {...(rest as T)}
          >
            {icon && (
              <label
                onClick={() => {
                  setFocused(true);
                  componentRef.current?.focus();
                }}
                className={cn(
                  "flex items-center justify-center pr-2 peer-focus:stroke-accent",
                  iconContainerClassName,
                )}
              >
                {icon}
              </label>
            )}
            {children}
          </Component>

          <label
            onClick={() => {
              setFocused(true);
              componentRef.current?.focus();
            }}
            htmlFor={name}
            className={cn(
              "absolute top-4 z-10 origin-top-right -translate-y-2 scale-75 transform",
              icon ? "right-10" : "right-2.5",
              "select-none text-sm text-primary duration-300 peer-placeholder-shown:translate-y-0",
              "peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-accent",
              labelClassName,
            )}
          >
            {label}
          </label>
        </div>
      </div>
    );
  };

  return WrappedComponent;
}

export default withLabel;
function isEmpty(value) {
  return !Number.isInteger(value);
}
