"use client";

interface CheckBoxProps {
  children: React.ReactNode;
  value?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function CheckBox({
  children,
  value = false,
  onChange = () => {},
}: CheckBoxProps) {
  return (
    <>
      <input
        id="active"
        type={"checkbox"}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor="active">{children}</label>
    </>
  );
}
