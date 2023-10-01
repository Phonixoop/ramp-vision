import IntegerField from "../integer-field";

export default function PhoneField(
  { value, onChange = () => {}, ...rest },
  ref
) {
  function parse(val) {
    return val.slice(0, 11);
  }

  return (
    <IntegerField
      value={value}
      onChange={(val) => onChange(parse(val))}
      {...rest}
    />
  );
}
