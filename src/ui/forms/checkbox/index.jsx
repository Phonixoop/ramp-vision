export default function CheckBox({
  children,
  value = false,
  onChange = () => {},
}) {
  return (
    <>
      <input
        id="active"
        type={"checkbox"}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor="avtive">{children}</label>
    </>
  );
}
