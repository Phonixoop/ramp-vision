import { useState } from "react";

export default function withLabel(Component) {
  return function WrappedComponent({
    children = <></> || "",
    value = "",
    label = "",

    onChange = (value = "") => {},
    ...rest
  }) {
    const [focused, setFocused] = useState(false);
    return (
      <div className="relative flex flex-row-reverse">
        <Component
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
          focused={focused}
          onBlur={() => setFocused(false)}
          label={label}
          {...rest}
        >
          {children}
        </Component>

        <label
          onClick={() => setFocused(true)}
          className="absolute right-2.5 top-4 z-10
          origin-top-right -translate-y-4 scale-75 transform select-none text-sm
          text-primary duration-300 peer-placeholder-shown:translate-y-0
          peer-placeholder-shown:scale-100 peer-focus:-translate-y-4
          peer-focus:scale-75 peer-focus:text-accent"
        >
          {label}
        </label>
      </div>
    );
  };
}
