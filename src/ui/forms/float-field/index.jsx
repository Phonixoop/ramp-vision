import TextField from "../text-field";

export default function FloatField({ value, onChange = () => {}, ...rest }) {
  function parse(val) {
    function reverse(val) {
      return val.split("").reverse().join("");
    }
    return reverse(reverse(val).replace(/[^0-9.]|\.(?=.*\.)/g, ""));
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
