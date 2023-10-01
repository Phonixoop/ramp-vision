import TextField from "../text-field";

export default function IntegerField({
  value,
  onChange = (e) => {},
  onValueChange = (value) => {},
  ...rest
}) {
  function parse(val) {
    return parseInt(val.replace(/[^0-9]/g, "")) || "";
  }

  return (
    <TextField
      value={value}
      isRtl={false}
      type="text"
      inputMode="numeric"
      pattern="[0-9]+"
      onChange={onChange}
      onValueChange={(val) => onValueChange(parse(val))}
      {...rest}
    />
  );
}
