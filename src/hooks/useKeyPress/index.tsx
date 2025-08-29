"use client";

import { useEffect } from "react";

export default function useKeyPress(
  callback: () => void,
  keyCodes: string[]
): void {
  const handler = ({ code }: KeyboardEvent) => {
    if (keyCodes.includes(code)) {
      callback();
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", handler);
    return () => {
      window.removeEventListener("keyup", handler);
    };
  }, [callback, keyCodes]);
}
