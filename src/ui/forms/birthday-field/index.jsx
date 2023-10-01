import TextField from "../text-field";

function containsOnlyNumbers(str) {
  return /^\d+$/.test(str);
}

function parse(val) {
  return val.replace(/[^0-9][/]/g, "");
}

export default function BirthdayField({ value, onChange = () => {}, ...rest }) {
  return (
    <TextField
      value={value}
      isRtl={false}
      onChange={(val) => {
        let value = parse(val);

        if (value.match(/^\d{2}$/) !== null) {
          return onChange(value + "/");
        } else if (value.match(/^\d{2}\/\d{2}$/) !== null) {
          return onChange(value + "/");
        }
        return onChange(value);
      }}
      {...rest}
    />
  );
}
