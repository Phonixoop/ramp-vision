"use client";

import { useEffect, useState } from "react";

interface MultiSelectItem {
  key: string;
  value: string;
}

interface MultiSelectBoxProps {
  className?: string;
  values?: string[];
  list?: MultiSelectItem[];
  onChange?: (selectedKeys: string[]) => void;
}

export default function MultiSelectBox({
  className = "bg-green-700 text-white shadow-2xl shadow-green-700",
  values = [],
  list = [],
  onChange = () => {},
}: MultiSelectBoxProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(values);
  const isSelected = (key: string) => selectedKeys.includes(key);

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
              } w-auto cursor-pointer select-none  rounded-full px-3 py-2 hover:shadow-md`}
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
