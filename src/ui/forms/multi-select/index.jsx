import { useEffect } from "react";
import { useState } from "react";

export default function MultiSelectBox({
  className = "bg-green-700 text-white shadow-2xl shadow-green-700",
  values = [],
  list = [],
  onChange = () => {},
}) {
  const [selectedKeys, setSelectedKeys] = useState(values);
  const isSelected = (key) => selectedKeys.includes(key);

  useEffect(() => {
    onChange(selectedKeys);
  }, [selectedKeys]);
  return (
    <>
      <div className="flex gap-2">
        {list.map((item) => {
          return (
            <span
              className={`${
                isSelected(item.key) ? className : "ring-1 ring-gray-300"
              } w-auto py-2 px-3  hover:shadow-md rounded-full cursor-pointer select-none`}
              key={item.key}
              onClick={() => {
                setSelectedKeys((prev) => {
                  return prev.includes(item.key)
                    ? [...prev.filter((i) => i !== item.key)]
                    : [...prev, item.key];
                });
              }}
            >
              {item.value}
            </span>
          );
        })}
      </div>
    </>
  );
}
