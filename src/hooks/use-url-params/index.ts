"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type UrlParams = Record<
  string,
  string | string[] | number | boolean | null | undefined
>;

interface UseUrlParamsOptions {
  debounceMs?: number;
  replace?: boolean;
}

export function useUrlParams<T extends UrlParams>(
  initialParams: T,
  options: UseUrlParamsOptions = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { debounceMs = 0, replace = true } = options;
  const initializedFromUrl = useRef(false);
  const lastUrlRef = useRef("");
  const initialParamsRef = useRef(initialParams);
  initialParamsRef.current = initialParams;
  const [params, setParams] = useState<T>(initialParams);

  const getCurrentUrl = useCallback(() => {
    if (!pathname) return "";
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;

    const urlParams: Partial<T> = {};
    const defaults = initialParamsRef.current;
    const keys = Object.keys(defaults) as Array<keyof T>;

    keys.forEach((key) => {
      const paramValue = searchParams.get(String(key));
      if (paramValue === null) return;

      const initialValue = defaults[key];

      if (Array.isArray(initialValue)) {
        urlParams[key] = paramValue.split(",").filter(Boolean) as T[keyof T];
      } else if (typeof initialValue === "number") {
        const num = Number.parseInt(paramValue, 10);
        if (!Number.isNaN(num)) {
          urlParams[key] = num as T[keyof T];
        }
      } else if (typeof initialValue === "boolean") {
        urlParams[key] = (paramValue === "true") as T[keyof T];
      } else {
        urlParams[key] = paramValue as T[keyof T];
      }
    });

    if (Object.keys(urlParams).length > 0) {
      setParams((prev) => ({ ...prev, ...urlParams }));
    }

    lastUrlRef.current = getCurrentUrl();
  }, [searchParams, getCurrentUrl]);

  useEffect(() => {
    if (!initializedFromUrl.current) return;
    if (!pathname) return;

    const updateUrl = () => {
      const urlParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") return;

        if (Array.isArray(value)) {
          if (value.length > 0) {
            urlParams.set(key, value.join(","));
          }
          return;
        }

        if (typeof value === "boolean") {
          urlParams.set(key, value ? "true" : "false");
          return;
        }

        urlParams.set(key, String(value));
      });

      const queryString = urlParams.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentUrl = getCurrentUrl();

      if (nextUrl === currentUrl) {
        lastUrlRef.current = nextUrl;
        return;
      }

      if (nextUrl !== lastUrlRef.current) {
        lastUrlRef.current = nextUrl;
        if (replace) {
          router.replace(nextUrl, { scroll: false });
        } else {
          router.push(nextUrl);
        }
      }
    };

    if (debounceMs > 0) {
      const timer = setTimeout(updateUrl, debounceMs);
      return () => clearTimeout(timer);
    }

    updateUrl();
  }, [params, pathname, router, debounceMs, replace, getCurrentUrl]);

  const updateParam = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setParams((prev) => {
      if (Object.is(prev[key], value)) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const updateParams = useCallback((updates: Partial<T>) => {
    setParams((prev) => {
      let changed = false;
      for (const [key, value] of Object.entries(updates)) {
        if (!Object.is(prev[key as keyof T], value)) {
          changed = true;
          break;
        }
      }
      if (!changed) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const resetParams = useCallback(() => {
    setParams(initialParamsRef.current);
  }, []);

  return {
    params,
    setParams,
    updateParam,
    updateParams,
    resetParams,
  };
}
