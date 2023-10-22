import { User } from "@prisma/client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { api } from "~/utils/api";

type TThemeContext = {
  theme: string;
  setTheme: (user: string) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};
const ThemeContext = createContext({} as TThemeContext);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>("");

  const canUseDOM: boolean = !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );

  const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    function listenStorageChanges() {
      const _theme = localStorage.getItem("theme");
      if (_theme === null) {
        setTheme("theme-dark-1");
      }
      document.querySelector("body").className = _theme;
      setTheme(_theme);
    }
    setTheme(localStorage.getItem("theme") ?? "");
    window.addEventListener("storage", listenStorageChanges);
    return () => window.removeEventListener("storage", listenStorageChanges);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
