"use client";

import { useState, useEffect } from "react";

interface ValidationResult {
  errors: string[];
  touched: boolean;
}

interface WithValidationProps {
  onChange?: (value: any) => void;
  value?: any;
  validations?: Array<
    ((value: any) => string) | [(value: any, params: any) => string, any]
  >;
  onValidation?: (errors: string[]) => void;
  [key: string]: any;
}

export default function withValidation<P extends object>(
  Component: React.ComponentType<P & WithValidationProps>,
) {
  return function WrappedComponent({
    onChange = () => {},
    value = "",
    validations = [],
    onValidation = () => {},
    ...rest
  }: P & WithValidationProps) {
    const [errors, setErrors] = useState<string[]>([]);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
      if (!touched && value?.length === 0) return;

      setErrors(() => {
        const errors = validations
          .map((validator) =>
            Array.isArray(validator)
              ? validator[0](value, validator[1])
              : validator(value),
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
          {...(rest as P)}
        />

        <div
          className={`${
            errors.length > 0 ? "scale-100" : "scale-0"
          } h-3 origin-right text-right text-sm text-red-500 transition-transform`}
        >
          {errors.join(", ")}
        </div>
      </>
    );
  };
}
