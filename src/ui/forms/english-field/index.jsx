import TextField from "../text-field";

export default function EnglishField({
  value,
  upperCase = false,
  onChange = () => {},
  ...rest
}) {
  function parse(val) {
    if (upperCase) return val.replace(/[^\x00-\x7F]+/, "").toUpperCase();
    return val.replace(/[^\x00-\x7F]+/, "");
  }
  return (
    <TextField
      value={value}
      isRtl={false}
      onChange={(val) => onChange(parse(val))}
      {...rest}
    />
  );
}
