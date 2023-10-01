import { useEffect, useMemo, useState } from "react";

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
  renderItem = (value, isSelected = () => {}) => value,
}) {
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
  const [selectedKeys, setSelectedKeys] = useState(
    initialKeys.map((item) => item.id || item)
  );
  const isSelected = (item) => selectedKeys?.includes(item.key);

  function handleChange(item) {
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
  function handleClick(e, item) {
    handleChange(item);

    onClick(item.value);
  }
  function handleContextMenu(e, item) {
    e.preventDefault();
    onContextMenu(item.value);
  }

  // useEffect(() => {
  //   onChange(
  //     listWithKey
  //       .filter((item) => {
  //         return selectedKeys.some((element) => {
  //           return element === item.key;
  //         });
  //       })
  //       .map((item) => item.value)
  //   );
  // }, [selectedKeys]);

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
            {renderItem(item.value, isSelected(item))}
          </div>
        );
      })}
    </div>
  );
}
