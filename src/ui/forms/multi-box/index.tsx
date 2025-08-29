"use client";

import { useEffect, useMemo, useState } from "react";

interface MultiBoxItem {
  id?: string | number;
  [key: string]: any;
}

interface MultiBoxProps {
  className?: string;
  initialKeys?: MultiBoxItem[] | (string | number)[];
  list?: MultiBoxItem[];
  min?: number;
  max?: number;
  multiple?: boolean;
  onClick?: (value: MultiBoxItem) => void;
  onContextMenu?: (value: MultiBoxItem) => void;
  onChange?: (values: MultiBoxItem[]) => void;
  renderItem?: (value: MultiBoxItem, isSelected: () => boolean) => React.ReactNode;
}

export default function MultiBox({
  className = "",
  initialKeys = [],
  list = [],
  min = 0,
  max = undefined,
  multiple = false,
  onClick = () => {},
  onContextMenu = () => {},
  onChange = () => {},
  renderItem = (value, isSelected = () => false) => value,
}: MultiBoxProps) {
  const listWithKey = useMemo(
    () =>
      list.map((item) => {
        return {
          key: item?.id,
          value: item,
        };
      }),
    [list]
  );
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(
    initialKeys.map((item) => (item as MultiBoxItem).id || item as string | number)
  );
  const isSelected = (item: { key: string | number }) => selectedKeys?.includes(item.key);

  function handleChange(item: { key: string | number; value: MultiBoxItem }) {
    setSelectedKeys((prevKeys) => {
      const keys = multiple
        ? prevKeys.includes(item.key)
          ? [...prevKeys.filter((key) => key !== item.key)]
          : [...prevKeys, item.key]
        : prevKeys.includes(item.key)
        ? []
        : [item.key];

      if (keys.length > (max || list.length)) return prevKeys;

      if (keys.includes(item.key) && selectedKeys.length < min) return prevKeys;

      const result = keys.flatMap((key) => {
        return listWithKey
          .filter((item) => item.key === key)
          .map((a) => a.value);
      });

      onChange(result);
      return keys;
    });
  }
  function handleClick(e: React.MouseEvent, item: { key: string | number; value: MultiBoxItem }) {
    handleChange(item);

    onClick(item.value);
  }
  function handleContextMenu(e: React.MouseEvent, item: { key: string | number; value: MultiBoxItem }) {
    e.preventDefault();
    onContextMenu(item.value);
  }

  return (
    <div className={className}>
      {listWithKey.map((item) => {
        return (
          <div
            className="m-0 h-auto w-auto snap-center border-none bg-transparent p-0  outline-none"
            key={item.key}
            onClick={(e) => {
              handleClick(e, item);
            }}
            onContextMenu={(e) => {
              handleContextMenu(e, item);
            }}
          >
            {renderItem(item.value, () => isSelected(item))}
          </div>
        );
      })}
    </div>
  );
}
