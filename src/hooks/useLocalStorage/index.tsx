import { useEffect, useLayoutEffect, useState } from "react";

export default function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
) {
  const canUseDOM: boolean = !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );

  const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

  const [value, setValue] = useState<T>(() => {
    if (typeof initialValue === "function") {
      return (initialValue as () => T)();
    } else {
      return initialValue;
    }
  });

  useIsomorphicLayoutEffect(() => {
    setValue(() => {
      let jsonValue: any = initialValue;
      if (typeof window !== "undefined" && window.localStorage) {
        jsonValue = localStorage.getItem(key);
      }

      if (jsonValue != undefined) return jsonValue;

      if (typeof initialValue === "function") {
        return (initialValue as () => T)();
      } else {
        return initialValue;
      }
    });
  }, []);
  useEffect(() => {
    //@ts-ignore
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as [typeof value, typeof setValue];
}
