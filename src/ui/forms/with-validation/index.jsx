import { useState, useEffect } from "react";

export default function withValidation(Component) {
  return function WrappedComponent({
    onChange = () => {},
    value = "",
    validations = [],
    onValidation = () => {},
    ...rest
  }) {
    const [errors, setErrors] = useState([]);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
      if (!touched && value?.length === 0) return;

      setErrors(() => {
        const errors = validations
          .map((validator) =>
            Array.isArray(validator)
              ? validator[0](value, validator[1])
              : validator(value)
          )
          .filter((val) => val.length > 0);
        onValidation(errors);
        return errors;
      });
    }, [value, touched]);

    return (
      <>
        <Component
          onChange={(value) => {
            setTouched(true);
            return onChange(value);
          }}
          value={value}
          {...rest}
        />

        <div
          className={`${
            errors.length > 0 ? "scale-100" : "scale-0"
          } text-red-500 text-sm h-3 transition-transform origin-right text-right`}
        >
          {errors.join(", ")}
        </div>
      </>
    );
  };
}
