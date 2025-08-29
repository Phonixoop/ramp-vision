"use client";

import { useState, useEffect } from "react";

interface ValidationResult {
  errors: string[];
  touched: boolean;
}

interface WithValidationProps {
  onChange?: (value: any) => void;
  value?: any;
  validations?: Array<((value: any) => string) | [(value: any, params: any) => string, any]>;
  onValidation?: (errors: string[]) => void;
  [key: string]: any;
}

export default function withValidation<P extends WithValidationProps>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent({
    onChange = () => {},
    value = "",
    validations = [],
    onValidation = () => {},
    ...rest
  }: P) {
    const [errors, setErrors] = useState<string[]>([]);
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
    }, [value, touched, validations, onValidation]);

    return (
      <>
        <Component
          onChange={(value: any) => {
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
